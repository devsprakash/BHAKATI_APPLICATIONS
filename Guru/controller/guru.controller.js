

const { sendResponse } = require('../../services/common.service')
const { BASEURL } = require('../../keys/development.keys')
const constants = require("../../config/constants");
const { checkAdmin } = require('../../v1/services/user.service')
const dateFormat = require('../../helper/dateformat.helper');
const TempleGuru = require('../../models/guru.model');
const bcrypt = require('bcryptjs')
const { isValid } = require("../../services/blackListMail");
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL } = require('../../keys/development.keys')
const axios = require('axios');




exports.addNewGuru = async (req, res) => {

    try {

        const { email, password } = req.body;
        const userId = req.user._id;

        const isAdmin = await checkAdmin(userId);
        if (!isAdmin || isAdmin.user_type !== constants.USER_TYPE.ADMIN) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        const isBlacklisted = await isValid(email);
        if (!isBlacklisted) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);
        }

        const existingEmail = await TempleGuru.findOne({ email });
        if (existingEmail) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.existing_email', {}, req.headers.lang);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const guruImage = `${BASEURL}/uploads/${req.file.filename}`;

        const newGuru = await TempleGuru.create({
            ...req.body,
            GuruImg: guruImage,
            password: hashedPassword,
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp()
        });

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.add_new_guru', newGuru, req.headers.lang);
    } catch (error) {
        console.error('Error in addNewGuru:', error);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', error.message, req.headers.lang);
    }
};



exports.guruLogin = async (req, res) => {

    try {

        const reqBody = req.body

        const checkMail = await isValid(reqBody.email)

        if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        let guru = await TempleGuru.findOne({ email: reqBody.email });

        if (!guru)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'GURU.guru_not_found', {}, req.headers.lang);


        const matchPassword = await bcrypt.compare(reqBody.password, guru.password);

        if (matchPassword === false)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);

        if (guru == 1) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.email_not_found', {}, req.headers.lang);
        if (guru == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);

        if (guru.status == 0) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        if (guru.status == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        if (guru.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);

        let newToken = await guru.generateAuthToken();
        let refreshToken = await guru.generateRefreshToken()

        guru.refresh_tokens = refreshToken
        guru.tokens = newToken;
        await guru.save()

        let resData = guru;
        resData.verify = undefined;
        resData.status = undefined;
        resData.password = undefined;
        resData.pancardNumber = undefined;
        resData.aadharacardNumber = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.guru_login_success', resData, req.headers.lang);

    } catch (err) {
        console.log('err(guruLogin).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.gurulogout = async (req, res, next) => {

    try {

        const { guruId } = req.body;

        let guruData = await TempleGuru.findById(guruId)
        guruData.tokens = null
        guruData.refresh_tokens = null

        await guruData.save()
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.guru_logout', guruData, req.headers.lang);

    } catch (err) {
        console.log("err(gurulogout)....")
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.getGuruProfile = async (req, res) => {

    try {

        const { guruId } = req.params;
        const guru = await TempleGuru.findById(guruId);

        if (!guru) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'GURU.guru_not_found', {}, req.headers.lang);
        }
    

        const sanitizedGuru = {
            _id: guru._id,
            GuruName: guru.GuruName,
            email: guru.email,
            mobile_number: guru.mobile_number,
            expertise: guru.expertise,
            templeId: guru.templeId,
            GuruImg: guru.GuruImg,
            created_at: guru.created_at,
            updated_at: guru.updated_at
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_guru_profile', sanitizedGuru, req.headers.lang);
    } catch (err) {
        console.error('Error(getGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getAllGuru = async (req, res) => {

    try {

        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const [gurus, totalGurus] = await Promise.all([
            TempleGuru.find({}, '_id GuruName email mobile_number expertise templeId GuruImg created_at updated_at')
                .populate('templeId')
                .skip(skip)
                .limit(parseInt(limit)),
            TempleGuru.countDocuments()
        ]);

        if (!gurus || gurus.length === 0) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'GURU.guru_not_found', {}, req.headers.lang);
        }

        const data = {
            page: parseInt(page),
            total_gurus: totalGurus,
            gurus
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_gurus', data, req.headers.lang);

    } catch (err) {
        console.error('Error(getAllGuru)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.GuruCreateNewLiveStream = async (req, res) => {

    const { guruId } = req.params;

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


        const object = {

            status: 'LIVE',
            startTime: dateFormat.add_current_time(),
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            muxData: {
                stream_key: response.data.data.stream_key,
                status: response.data.data.status,
                reconnect_window: response.data.data.reconnect_window,
                max_continuous_duration: response.data.data.max_continuous_duration,
                latency_mode: response.data.data.latency_mode,
                plackBackId: response.data.data.id,
                created_at: response.data.data.created_at,
            },
        }

        const addNewLiveStreamingByGuru = await TempleGuru.findOneAndUpdate(
            { _id: guruId },
            { $set: object },
            { new: true }
        ).populate('templeId');

        if (!addNewLiveStreamingByGuru) {
            return sendResponse(
                res,
                constants.WEB_STATUS_CODE.NOT_FOUND,
                constants.STATUS_CODE.FAIL,
                'GURU.guru_not_found',
                {},
                req.headers.lang
            );
        }
        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', addNewLiveStreamingByGuru, req.headers.lang);

    } catch (err) {
        console.log("err(GuruCreateNewLiveStream)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.getAllLiveStreamByGuru = async (req, res) => {
    
    const { limit = 25, page = 1 } = req.query;

    try {
        
        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams`,
            {
                params: {
                    limit,
                    offset: (page - 1) * limit
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const LiveStreamsData = await TempleGuru.find()
            .populate('templeId')
            .sort({createdAt: -1}) 
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        const allLivestreams = {
            LiveStreamsData,
            muxData: response.data
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', allLivestreams, req.headers.lang);

    } catch (err) {
        // Handle errors
        console.log("err(getAllLiveStreamByGuru )....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};
