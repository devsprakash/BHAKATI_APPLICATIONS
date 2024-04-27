
const { sendResponse } = require('../../services/common.service')
const { BASEURL, MUXURL, MUX_TOKEN_ID, MUX_TOKEN_SECRET } = require('../../keys/development.keys')
const { isValid } = require("../../services/blackListMail");
const constants = require("../../config/constants");
const bcrypt = require('bcryptjs')
const TempleGuru = require('../../models/guru.model');
const { TempleLoginReponse, TempleReponse, TempleLiveStreamingReponse } = require('../../ResponseData/Temple.reponse')
const { guruLoginResponse } = require('../../ResponseData/Guru.response')
const dateFormat = require('../../helper/dateformat.helper')
const Bank = require('../../models/bankDetails.model');
const Pandit = require('../../models/pandit.model');
const Puja = require('../../models/puja.model');
const LiveStream = require('../../models/liveStreaming.model');
const Video = require('../../models/uploadVideo.model');
const axios = require('axios');
const { getData, minutesToSeconds } = require('../services/views.services')
const TempleLiveStreaming = require('../../models/templeLiveStream.model')
const User = require('../../models/user.model');
const { sendOTP, resendOTP, verifyOTP } = require('../../services/otp.service')





exports.templeLogin = async (req, res) => {

    try {

        const reqBody = req.body;
        const { email, password } = reqBody;

        const user = await TempleGuru.findOne({ email });

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);

        if (user.status === 0 || user.status === 2 || user.deleted_at !== null) {
            let errorMsg;
            if (user.status === 0) errorMsg = 'USER.inactive_account';
            else if (user.status === 2) errorMsg = 'USER.deactive_account';
            else errorMsg = 'USER.inactive_account';
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, errorMsg, {}, req.headers.lang);
        }

        const newToken = await user.generateAuthToken();
        const refreshToken = await user.generateRefreshToken();

        user.refresh_tokens = refreshToken;
        user.tokens = newToken;
        await user.save();

        const responseData = user.user_type === constants.USER_TYPE.TEMPLEAUTHORITY ? TempleLoginReponse(user) : guruLoginResponse(user);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_login', responseData, req.headers.lang);

    } catch (err) {
        console.log(`Error in templeLogin: `, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.logout = async (req, res, next) => {

    try {

        const templeId = req.Temple._id;

        let userData = await TempleGuru.findById(templeId);

        if (!userData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);
        }

        userData.tokens = null;
        userData.refresh_tokens = null;

        await userData.save();

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, `TEMPLE.logout_success`, {}, req.headers.lang);

    } catch (err) {
        console.log(`err(TempleLoginOrGuruLogin)....`, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}




exports.getTempleProfile = async (req, res) => {

    try {

        const { templeId } = req.body;
        const { limit } = req.query;
        const templeData = await TempleGuru.findOne({ _id: templeId });

        if (!templeData || (templeData.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const TempleData = await TempleLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, templeId: templeId }).limit(limit)
            .populate('templeId', 'temples_id temple_name category temple_image background_image _id state district location mobile_number open_time closing_time created_at');

        const templeList = await TempleGuru.find({ user_type: 3 }).sort().limit(limit)

        const responseData = {
            temple_data: {
                temple_id: templeData._id,
                temple_name: templeData.temple_name,
                temple_image_url: templeData.temple_image,
                feature_image_url: templeData.background_image,
                description: templeData.description,
                location: templeData.location,
                state: templeData.state,
                district: templeData.district,
                category: templeData.category,
                state: templeData.state,
                open_time: templeData.open_time,
                closing_time: templeData.closing_time,
                date_of_joining: templeData.created_at
            } || {},
            live_aarti: TempleData.map(temple => ({
                playback_id: temple.playback_id,
                live_stream_id: temple.live_stream_id,
                stream_key: temple.stream_key,
                temple_name: temple.templeId.temple_name,
                temple_image_url: temple.templeId.temple_image,
                background_image_url: temple.templeId.background_image,
                title: temple.title,
                description: temple.description,
                location: temple.templeId.location,
                state: temple.templeId.state,
                district: temple.templeId.district,
                temple_id: temple._id,
                category: temple.templeId.category,
                published_date: temple.created_at,
                views: '',
                temple_id: temple.templeId._id
            })) || [],
            suggested_temples: templeList.map(temple => ({
                temple_id: temple.temples_id,
                temple_name: temple.temple_name,
                temple_image_url: temple.temple_image,
                temple_id: temple._id
            })) || []
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', responseData, req.headers.lang);
    } catch (err) {
        console.error('Error(getTempleProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.getTempleProfileByAdmin = async (req, res) => {

    try {

        const { templeId } = req.body;
        const { limit } = req.query;

        const templeData = await TempleGuru.findOne({ _id: templeId });

        console.log("templeData......", templeData)

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const TempleData = await TempleLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, templeId: templeId }).limit(limit)
            .populate('templeId', 'temples_id temple_name category temple_image background_image _id state district location mobile_number open_time closing_time created_at');


        const templeList = await TempleGuru.find({ user_type: 3 }).sort().limit(limit)

        const responseData = {
            temple_data: {
                temple_id: templeData._id,
                temple_name: templeData.temple_name,
                temple_image_url: templeData.temple_image,
                feature_image_url: templeData.background_image,
                description: templeData.description,
                location: templeData.location,
                state: templeData.state,
                district: templeData.district,
                category: templeData.category,
                mobile_number: templeData.mobile_number,
                open_time: templeData.open_time,
                closing_time: templeData.closing_time,
                email: templeData.email,
                date_of_joining: templeData.created_at
            } || {},
            live_aarti: TempleData.map(temple => ({
                playback_id: temple.playback_id,
                live_stream_id: temple.live_stream_id,
                stream_key: temple.stream_key,
                temple_name: temple.templeId.temple_name,
                temple_image_url: temple.templeId.temple_image,
                background_image_url: temple.templeId.background_image,
                title: temple.title,
                description: temple.description,
                location: temple.templeId.location,
                state: temple.templeId.state,
                district: temple.templeId.district,
                temple_id: temple._id,
                category: temple.templeId.category,
                published_date: temple.created_at,
                views: '',
                temple_id: temple.templeId._id
            })) || [],
            suggested_temples: templeList.map(temple => ({
                temple_id: temple.temples_id,
                temple_name: temple.temple_name,
                temple_image_url: temple.temple_image,
                temple_id: temple._id
            })) || []
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', responseData, req.headers.lang);
    } catch (err) {
        console.error('Error(getTempleProfileByAdmin)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateTempleProfile = async (req, res) => {

    try {

        const templeId = req.Temple._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const templeData = await TempleGuru.findOneAndUpdate({ _id: templeId }, req.body, { new: true });
        templeData.updated_at = dateFormat.set_current_timestamp();
        await templeData.save();

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_not_found', {}, req.headers.lang);

        const responseData = {
            temple_id: templeData._id,
            temple_name: templeData.temple_name,
            temple_image_url: templeData.temple_image,
            feature_image_url: templeData.background_image,
            description: templeData.description,
            location: templeData.location,
            state: templeData.state,
            district: templeData.district,
            category: templeData.category,
            mobile_number: templeData.mobile_number,
            open_time: templeData.open_time,
            closing_time: templeData.closing_time,
            email: templeData.email,
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_temple_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(updateTempleProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};

exports.updateProfileImage = async (req, res) => {

    try {

        const templeId = req.Temple._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY && temple.user_type !== constants.USER_TYPE.GURU)) {
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        if (!req.files || (!req.files['image'] && !req.files['background_image'])) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'Image file or background image file is required', {}, req.headers.lang);
        }

        let updateData = {};

        if (temple.user_type === constants.USER_TYPE.TEMPLEAUTHORITY) {
            if (req.files['image']) {
                const temple_image_url = `${BASEURL}/uploads/${req.files['image'][0].filename}`;
                updateData.temple_image = temple_image_url;
            }
        } else if (temple.user_type === constants.USER_TYPE.GURU) {

            if (req.files['image']) {
                const guru_image_url = `${BASEURL}/uploads/${req.files['image'][0].filename}`;
                updateData.guru_image = guru_image_url;
            }
        }

        if (req.files['background_image']) {
            const background_image_url = `${BASEURL}/uploads/${req.files['background_image'][0].filename}`;
            updateData.background_image = background_image_url;
        }

        // Update the document in the database with the appropriate fields
        const templeData = await TempleGuru.findOneAndUpdate(
            { _id: templeId },
            { $set: updateData },
            { new: true }
        );

        // Update timestamp and save changes
        templeData.updated_at = dateFormat.set_current_timestamp();
        await templeData.save();

        // Prepare response data
        let responseData;
        if (templeData.user_type === constants.USER_TYPE.TEMPLEAUTHORITY) {
            responseData = {
                temple_id: templeData._id,
                temple_name: templeData.temple_name,
                temple_image_url: templeData.temple_image,
                feature_image_url: templeData.background_image,
            };
        } else if (templeData.user_type === constants.USER_TYPE.GURU) {
            responseData = {
                guru_id: templeData._id,
                guru_name: templeData.guru_name,
                guru_image_url: templeData.guru_image,
                feature_image_url: templeData.background_image,
            };
        }

        // Send response
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_temple_profile_image', responseData, req.headers.lang);
    } catch (err) {
        console.error('Error(updateProfileImage):', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.CreateNewLiveStreamByTemple = async (req, res) => {

    const templeId = req.Temple._id;
    const reqBody = req.body;
    const temple = await TempleGuru.findById(templeId)
    console.log("temple", temple)

    if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
        return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

    const requestData = {
        "playback_policy": [
            "public"
        ],
        "new_asset_settings": {
            "playback_policy": "public",
            "max_resolution_tier": "1080p",
            "generated_subtitles": [
                {
                    "name": "Auto-generated Subtitles",
                    "language_code": "en"
                }
            ]
        }
    };

    try {
        const response = await axios.post(
            `${MUXURL}/video/v1/live-streams`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const ids = response.data.data.playback_ids.map((item) => item.id);

        const liveStreamData = {
            description: reqBody.description,
            title: reqBody.title,
            stream_key: response.data.data.stream_key,
            status: response.data.data.status,
            reconnect_window: response.data.data.reconnect_window,
            max_continuous_duration: response.data.data.max_continuous_duration,
            latency_mode: response.data.data.latency_mode,
            live_stream_id: response.data.data.id,
            playback_id: ids[0],
            created_at: response.data.data.created_at,
            templeId: templeId
        } || {}

        const templeData = await TempleLiveStreaming.create(liveStreamData)

        const responseData = TempleLiveStreamingReponse(templeData);

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(CreateNewLiveStreamByTemple)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.getTempleLiveStream = async (req, res) => {
    try {
        const { limit } = req.query;

        // Fetch live streaming data from external API
        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        // Fetch temple details from the database based on live streaming IDs
        const TempleData = await TempleLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData } }).limit(parseInt(limit))
            .populate('templeId', 'temple_name category temple_image background_image _id state district location mobile_number open_time closing_time created_at');

        // Construct response data by mapping over TempleData
        const responseData = await Promise.all(TempleData.map(async temple => {
            const templeDetails = await TempleGuru.findOne({ _id: temple.templeId });
            if (!templeDetails) return null; // Return null if temple details are not found
            return {
                playback_id: temple.playback_id,
                live_stream_id: temple.live_stream_id,
                stream_key: temple.stream_key,
                temple_id: templeDetails._id,
                temple_name: templeDetails.temple_name,
                temple_image_url: templeDetails.temple_image,
                background_image_url: templeDetails.background_image,
                title: temple.title,
                description: temple.description,
                location: templeDetails.location,
                state: templeDetails.state,
                district: templeDetails.district,
                category: templeDetails.category,
                published_date: new Date(),
                views: '',
            };
        }));

        const filteredResponseData = responseData.filter(item => item !== null);

        // Send response
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', filteredResponseData, req.headers.lang);
    } catch (err) {
        console.log("err(getTempleLiveStream):", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};






exports.temple_suggested_videos = async (req, res) => {

    try {

        const { templeId, limit } = req.query;

        const response = await axios.get(
            `${MUXURL}/video/v1/assets`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const assetsId = response.data.data.map(asset => asset.id);

        const videoData = await Video.find({ 'muxData.asset_id': { $in: assetsId }, guruId: templeId }).sort({ created_at: -1 }).limit(parseInt(limit));

        const matchedData = response.data.data.filter(user => {
            return videoData.some(muxData => muxData.muxData.asset_id === user.id);
        });

        const responseData = videoData.map(video => ({
            plackback_id: video.muxData.playback_id,
            asset_id: video.muxData.asset_id,
            description: video.description,
            title: video.title,
            video_url: video.videoUrl,
            id: video._id,
            duration: minutesToSeconds(matchedData[0].duration),
            created_at: video.created_at,
            temple_id: video.guruId,
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_the_suggested_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(temple_suggested_videos)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addBankDetailsByAdmin = async (req, res) => {

    try {

        const userId = req.user._id;
        const reqBody = req.body;
        const user = await User.findOne({ _id: userId });

        if (!user || (user.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        let files = req.file;
        reqBody.bank_logo = `${BASEURL}/uploads/${files.filename}`;
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        const addBank = await Bank.create(reqBody);

        let data = {
            bank_id: addBank._id,
            bank_name: addBank.bank_name,
            bank_logo: addBank.bank_logo
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(addBankDetailsByAdmin)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.AllBankList = async (req, res) => {

    try {

        const addBank = await Bank.find();

        if (!addBank || addBank.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', [], req.headers.lang);

        let data = addBank.map(data => ({
            bank_id: data._id,
            bank_name: data.bank_name,
            bank_logo: data.bank_logo
        }))

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_all_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(AllBankList)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.addBankDetails = async (req, res) => {

    try {

        const templeId = req.Temple._id;
        const temple = await TempleGuru.findOne({ _id: templeId });
        const { bank_id } = req.body;

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const addBank = await Bank.findOneAndUpdate({ _id: bank_id },
            {
                $set:
                {
                    bank_name: req.body.bank_name,
                    account_number: req.body.account_number,
                    ifsc_code: req.body.ifsc_code,
                    templeId: templeId
                }
            })

        let data = {
            bank_id: addBank._id,
            bank_name: addBank.bank_name,
            account_number: addBank.account_number,
            bank_logo: addBank.bank_logo,
            ifsc_code: addBank.ifsc_code,
            temple_id: addBank.templeId
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(addBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getBankDetails = async (req, res) => {

    try {

        const { templeId } = req.params;

        const banks = await Bank.findOne({ templeId: templeId })
            .populate('templeId', 'temple_name temple_image _id')

        if (!banks)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        let data = {
            bank_id: banks._id,
            bank_name: banks.bank_name,
            account_number: banks.account_number,
            ifsc_code: banks.ifsc_code,
            bank_logo: banks.bank_logo,
            temple_id: banks.templeId
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_bankDetils', data, req.headers.lang);

    } catch (err) {
        console.error('Error(getBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.updateBankDetails = async (req, res) => {

    try {

        const { templeId } = req.params;

        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const banks = await Bank.findOneAndUpdate({ templeId: templeId }, {
            $set:
            {
                bank_name: req.body.bank_name,
                account_number: req.body.account_number,
                ifsc_code: req.body.ifsc_code,
                updated_at: dateFormat.set_current_timestamp()
            }
        },
            { new: true },

        ).populate('templeId', 'temple_name temple_image _id')

        if (!banks)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        let data = {
            bank_id: banks._id,
            bank_name: banks.bank_name,
            account_number: banks.account_number,
            ifsc_code: banks.ifsc_code,
            bank_logo: banks.bank_logo,
            temple_id: banks.templeId
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(updateBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.deleteBankDetails = async (req, res) => {

    try {

        const { templeId } = req.params;

        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const banks = await Bank.findOne({ templeId: templeId });

        if (!banks)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        await Bank.deleteOne({ _id: banks._id })

        let data = {
            bank_id: banks._id,
            bank_name: banks.bank_name,
            account_number: banks.account_number,
            ifsc_code: banks.ifsc_code,
            temple_id: banks.templeId
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.delete_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(deleteBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addpanditDetails = async (req, res) => {

    try {

        const templeId = req.Temple._id;
        const reqBody = req.body;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const existEmail = await Pandit.findOne({ email: reqBody.email });

        if (existEmail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAI4, 'TEMPLE.email_already_exist', {}, req.headers.lang);

        reqBody.templeId = templeId;

        const addpandit = await Pandit.create(reqBody);

        let data = {
            full_name: addpandit.full_name,
            email: addpandit.email,
            mobile_number: addpandit.mobile_number,
            temple_name: addpandit.templeId.temple_name,
            temple_image: addpandit.templeId.temple_image,
            temple_id: addpandit.templeId._id,
            pandit_id: addpandit._id,
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_pandit_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(addpanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.getpanditDetails = async (req, res) => {
    try {
        const { panditId } = req.params;
        const templeId = req.Temple._id;

        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const pandit = await Pandit.findOne({ _id: panditId, templeId: templeId })
            .populate('templeId', 'temple_name temple_image _id');

        if (!pandit)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found_pandit', {}, req.headers.lang);

        let data = {
            full_name: pandit.full_name,
            email: pandit.email,
            mobile_number: pandit.mobile_number,
            temple_name: pandit.templeId.temple_name,
            temple_image: pandit.templeId.temple_image,
            temple_id: pandit.templeId._id,
            pandit_id: pandit._id,
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_pandit_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(getpanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getAllpanditList = async (req, res) => {

    try {

        const { templeId } = req.params;

        const pandit = await Pandit.find({ templeId: templeId })
            .populate('templeId', 'temple_name temple_image _id')

        if (!pandit || pandit.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found_pandit', [], req.headers.lang);

        const responseData = pandit.map(data => ({
            full_name: data.full_name,
            email: data.email,
            mobile_number: data.mobile_number,
            temple_name: data.templeId.temple_name,
            temple_image: data.templeId.temple_image,
            temple_id: data.templeId._id,
            pandit_id: data._id,
        }))

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_pandit_details', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getAllpanditList)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.UpdatepanditDetails = async (req, res) => {

    try {

        const { panditId } = req.params;
        const templeId = req.Temple._id;
        const reqBody = req.body;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findOneAndUpdate({ _id: panditId, templeId: templeId },
            {
                $set: {
                    email: reqBody.email,
                    mobile_number: reqBody.mobile_number,
                    full_name: reqBody.full_name,
                    updated_at: dateFormat.set_current_timestamp()
                }
            },
            { new: true }
        )

        if (!pandit)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found_pandit', {}, req.headers.lang);

        let data = {
            full_name: pandit.full_name,
            email: pandit.email,
            mobile_number: pandit.mobile_number,
            pandit_id: pandit._id,
        }


        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_pandit_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(UpdatepanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.deletePanditDetails = async (req, res) => {

    try {

        const { panditId } = req.params;
        const templeId = req.Temple._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findOneAndDelete({ _id: panditId, templeId: templeId })

        if (!pandit)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found_pandit', {}, req.headers.lang);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.delete_pandit_details', pandit, req.headers.lang);


    } catch (err) {
        console.error('Error(deletePanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.generate_refresh_tokens = async (req, res, next) => {

    try {

        let temple = await TempleGuru.findOne({ refresh_tokens: req.body.refresh_tokens });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.token_expired', {}, req.headers.lang);

        let newToken = await temple.generateAuthToken();
        let refresh_token = await temple.generateRefreshToken()

        let data = {
            token: newToken,
            refresh_token: refresh_token
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_auth_token', data, req.headers.lang);

    } catch (err) {
        console.log('err(generate_refresh_tokens)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

