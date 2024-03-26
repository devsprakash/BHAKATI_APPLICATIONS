
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
const axios = require('axios')





exports.templeLogin = async (req, res) => {

    try {
        const reqBody = req.body;

        const checkMail = await isValid(reqBody.email);

        if (checkMail === false) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);
        }

        let user = await TempleGuru.findOne({ email: reqBody.email });

        if (!user) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);
        }

        const matchPassword = await bcrypt.compare(reqBody.password, user.password);

        if (matchPassword === false) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);
        }

        if (user.status === 0) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        }

        if (user.status === 2) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        }

        if (user.deleted_at !== null) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        }

        let newToken = await user.generateAuthToken();
        let refreshToken = await user.generateRefreshToken();

        user.refresh_tokens = refreshToken;
        user.tokens = newToken;
        await user.save();

        let responseData

        if (user.user_type === constants.USER_TYPE.TEMPLEAUTHORITY) {
            responseData = TempleLoginReponse(user);
        } else {
            responseData = guruLoginResponse(user);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_login', responseData, req.headers.lang);

    } catch (err) {
        console.log(`err(TempleLoginOrGuruLogin).....`, err);
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

        const templeData = await TempleGuru.findOne({ _id: templeId });

        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams/${templeData.muxData.LiveStreamId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const responses = await axios.get(
            `${MUXURL}/video/v1/assets`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const assetsId = responses.data.data.map(asset => asset.id); 

        const videoData = await Video.find({ 'muxData.assetId': { $in: assetsId } }).sort().limit(8)


        const selectFields = 'TempleName category TempleImg _id State District Location Desc trust_mobile_number email Open_time Closing_time';
        const templeList = await TempleGuru.find({ user_type: constants.USER_TYPE.TEMPLEAUTHORITY }).sort().select(selectFields).limit(10)

        let datas = {
            streamKey: response.data.data.stream_key,
            id: response.data.data.id
        }

        const TempleData = TempleLiveStreamingReponse(templeData)

        const data = {
            TempleData,
            matchedData: datas,
            TempleList: templeList,
            suggestVideo: videoData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', data, req.headers.lang);
    } catch (err) {
        console.error('Error(getTempleProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.CreateNewLiveStreamByTemple = async (req, res) => {


    const templeId = req.Temple._id;
    const reqBody = re.body;
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
            startTime: dateFormat.add_current_time(),
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            guruId: templeId,
            muxData: {
                description: reqBody.description,
                title: reqBody.title,
                stream_key: response.data.data.stream_key,
                status: response.data.data.status,
                reconnect_window: response.data.data.reconnect_window,
                max_continuous_duration: response.data.data.max_continuous_duration,
                latency_mode: response.data.data.latency_mode,
                LiveStreamId: response.data.data.id,
                plackBackId: ids[0],
                created_at: response.data.data.created_at,
            }
        };

        const templeData = await TempleGuru.findOneAndUpdate(
            { _id: templeId },
            { $set: liveStreamData },
            { new: true }
        );

        const responseData = TempleLiveStreamingReponse(templeData);

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(CreateNewLiveStreamByTemple)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getTempleLiveStream = async (req, res) => {

    try {
        const { templeId } = req.body;

        const selectFields = 'muxData.title muxData.description muxData.plackBackId muxData.stream_key muxData.LiveStreamId TempleName category TempleImg backgroundImage _id State District Location description trust_mobile_number guru_name email Open_time Closing_time';
        const TempleData = await TempleGuru.findOne({ _id: templeId }).select(selectFields);

        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams/${TempleData.muxData.LiveStreamId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const responses = await axios.get(
            `${MUXURL}/video/v1/assets`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const assetsId = responses.data.data.map(asset => asset.id); 

        const videoData = await Video.find({ 'muxData.assetId': { $in: assetsId } });

        let data = {
            streamKey: response.data.data.stream_key,
            id: response.data.data.id
        }

        const allLivestreams = {
            TempleData,
            matchedStreamingData: data,
            suggestVideo: videoData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', allLivestreams, req.headers.lang); // Ensure sendResponse function is correctly defined and imported
    } catch (err) {
        console.log("err(getTempleLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang); // Ensure sendResponse function is correctly defined and imported
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

