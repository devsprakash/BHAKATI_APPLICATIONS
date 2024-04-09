
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
const { getData } = require('../services/views.services')
const TempleLiveStreaming = require('../../models/templeLiveStream.model')




exports.templeLogin = async (req, res) => {

    try {
        const reqBody = req.body;
        const { email, password } = reqBody;

        const checkMail = await isValid(email);
        if (!checkMail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

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

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const TempleData = await TempleLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, templeId: templeId }).limit(limit)
            .populate('templeId', 'temples_id temple_name category temple_image background_image _id state district location mobile_number open_time closing_time created_at');

        if (!TempleData || TempleData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.Live_stream_not_found', [], req.headers.lang);

        const templeList = await TempleGuru.find({ user_type: 3 }).sort().limit(limit)

        if (!templeList || templeList.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', [], req.headers.lang);

        const responseData = {
            temple_data: {
                temple_id: templeData._id,
                temple_name: templeData.temple_name,
                temple_image_url: templeData.temple_image_url,
                feature_image_url: templeData.background_image,
                description: templeData.description,
                location: templeData.location,
                state: templeData.state,
                district: templeData.district,
                category: templeData.category,
                date_of_joining: templeData.created_at
            },
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
            })),
            suggested_temples: templeList.map(temple => ({
                temple_id: temple.temples_id,
                temple_name: temple.temple_name,
                temple_image_url: temple.temple_image,
                temple_id: temple._id
            }))
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

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const TempleData = await TempleLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, templeId: templeId }).limit(limit)
            .populate('templeId', 'temples_id temple_name category temple_image background_image _id state district location mobile_number open_time closing_time created_at');

        if (!TempleData || TempleData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.Live_stream_not_found', [], req.headers.lang);

        const templeList = await TempleGuru.find({ user_type: 3 }).sort().limit(limit)

        if (!templeList || templeList.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', [], req.headers.lang);

        const responseData = {
            temple_data: {
                temple_id: templeData._id,
                temple_name: templeData.temple_name,
                temple_image_url: templeData.temple_image_url,
                feature_image_url: templeData.background_image,
                description: templeData.description,
                location: templeData.location,
                state: templeData.state,
                district: templeData.district,
                category: templeData.category,
                mobile_number:templeData.mobile_number,
                open_time:templeData.open_time,
                close_time:templeData.close_time,
                date_of_joining: templeData.created_at
            },
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
            })),
            suggested_temples: templeList.map(temple => ({
                temple_id: temple.temples_id,
                temple_name: temple.temple_name,
                temple_image_url: temple.temple_image,
                temple_id: temple._id
            }))
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', responseData, req.headers.lang);
    } catch (err) {
        console.error('Error(getTempleProfileByAdmin)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.CreateNewLiveStreamByTemple = async (req, res) => {

    const templeId = req.Temple._id;
    const reqBody = req.body;
    const temple = await TempleGuru.findById(templeId)
   

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
        }

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

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const TempleData = await TempleLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData } }).limit(limit)
            .populate('templeId', 'temples_id temple_name category temple_image background_image _id state district location mobile_number open_time closing_time created_at');


        if (!TempleData || TempleData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.Live_stream_not_found', [], req.headers.lang);

        const responseData = TempleData.map(temple => ({
            playback_id: temple.playback_id,
            live_stream_id: temple.live_stream_id,
            stream_key: temple.stream_key,
            temple_id: temple.templeId._id || null,
            temple_name: temple.templeId.temple_name || null,
            temple_image_url: temple.templeId.temple_image || null,
            background_image_url: temple.templeId.background_image || null,
            title: temple.title,
            description: temple.description,
            location: temple.templeId.location || null,
            state: temple.templeId.state || null,
            district: temple.templeId.district || null,
            temple_id: temple._id,
            category: temple.templeId.category || null,
            published_date: new Date(),
            views: '',
            temple_id: temple.templeId._id
        }))

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(getTempleLiveStream)....", err);
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

        if (!videoData || videoData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.not_found', [], req.headers.lang);

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
            duration: matchedData[0].duration,
            temple_id: video.guruId,
        }));

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_the_suggested_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(temple_suggested_videos)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addBankDetails = async (req, res) => {

    try {

        const templeId = req.Temple._id;

        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const reqBody = req.body;
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.templeId = templeId;

        const addBank = await Bank.create(reqBody);
        addBank.templeId = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_bank_details', addBank, req.headers.lang);

    } catch (err) {
        console.error('Error(addBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.getBankDetails = async (req, res) => {

    try {

        const { bankId } = req.params;
        const templeId = req.Temple._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const banks = await Bank.findById(bankId)
            .populate('templeId', 'TempleName TempleImg _id')

        if (!banks) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_bankDetils', banks, req.headers.lang);

    } catch (err) {
        console.error('Error(getBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addpanditDetails = async (req, res) => {

    try {

        const templeId = req.Temple._id;
        const reqBody = req.body;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const existEmail = await Pandit.findOne({ email: reqBody.email });

        if (existEmail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAI4, 'TEMPLE.email_already_exist', {}, req.headers.lang);

        reqBody.templeId = templeId;

        const addpandit = await Pandit.create(reqBody);
        addpandit.templeId = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_pandit_details', addpandit, req.headers.lang);

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

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findById(panditId)
            .populate('templeId', 'TempleName TempleImg _id')

        if (!pandit) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found_pandit', {}, req.headers.lang);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_pandit_details', pandit, req.headers.lang);

    } catch (err) {
        console.error('Error(getpanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.UpdatepanditDetails = async (req, res) => {

    try {

        const { panditId } = req.params;
        const reqBody = req.body;
        const templeId = req.Temple._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findOneAndUpdate({ _id: panditId },
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

        if (!pandit) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found_pandit', {}, req.headers.lang);
        }

        pandit.templeId = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_pandit_details', pandit, req.headers.lang);

    } catch (err) {
        console.error('Error(UpdatepanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.generate_refresh_tokens = async (req, res, next) => {

    try {

        let temple = await TempleGuru.findOne({ refresh_tokens: req.body.refresh_tokens });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.token_expired', {}, req.headers.lang);

        let newToken = await temple.generateAuthToken();

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_auth_token', newToken, req.headers.lang);

    } catch (err) {
        console.log('err(generate_refresh_tokens)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

