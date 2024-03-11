

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
const { guruResponseData, guruLiveStreamResponse } = require('../../ResponseData/Guru.response')





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

        let files = req.file
        const guruImage = `${BASEURL}/uploads/${files.filename}`;

        const newGuru = await TempleGuru.create({
            ...req.body,
            GuruImg: guruImage,
            password: hashedPassword,
            templeId: reqBody.templeId,
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp()
        });

        const responseData = guruResponseData(newGuru)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.add_new_guru', responseData, req.headers.lang);

    } catch (error) {
        console.error('Error in addNewGuru:', error);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', error.message, req.headers.lang);
    }
};




exports.getGuruProfile = async (req, res) => {

    try {

        const guruId = req.guru._id;

        const guru = await TempleGuru.findById(guruId)
            .populate('templeId', 'TempleName TempleImg _id')

        if (!guru) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'GURU.guru_not_found', {}, req.headers.lang);
        }

        const responseData = guruResponseData(guru);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_guru_profile', responseData, req.headers.lang);

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

        const query = {
            GuruName: { $ne: null },
            GuruImg: { $ne: null },
            mobile_number: { $ne: null },
            expertise: { $ne: null }
        };

        const [gurus, totalGurus] = await Promise.all([
            TempleGuru.find(query, '_id GuruName email mobile_number expertise templeId GuruImg created_at updated_at')
                .populate('templeId', 'TempleName TempleImg Location State District Desc Temple_Open_time Closing_time _id templeId user_type')
                .skip(skip)
                .limit(parseInt(limit)),
            TempleGuru.countDocuments(query)
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

    const guruId = req.guru._id;

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
                LiveStreamId: response.data.data.id,
                plackBackId: ids[0],
                created_at: response.data.data.created_at,
            },
        }

        const addNewLiveStreamingByGuru = await TempleGuru.findOneAndUpdate(
            { _id: guruId },
            { $set: object },
            { new: true }
        )

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

        const responseData = guruLiveStreamResponse(addNewLiveStreamingByGuru)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', responseData, req.headers.lang);

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

        if (!response.data)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found_streams', {}, req.headers.lang);

        const query = {
            GuruName: { $ne: null },
            GuruImg: { $ne: null },
            mobile_number: { $ne: null },
            expertise: { $ne: null }
        };

        const selectedFields = 'GuruName email mobile_number title description expertise templeId GuruImg _id muxData.plackBackId muxData.stream_key  muxData.LiveStreamId created_at';

        const LiveStreamsData = await TempleGuru.find(query).select(selectedFields)
            .populate('templeId', 'TempleName TempleImg Location State District Desc Temple_Open_time Closing_time _id templeId user_type')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        if (!LiveStreamsData || LiveStreamsData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);

        const LiveStreamingData = LiveStreamsData.map(stream => stream.muxData.LiveStreamId);

        const streamingData = response.data.data.filter(stream => LiveStreamingData == stream.id);

        const allLivestreams = {
            LiveStreamsData,
            streamingData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', allLivestreams, req.headers.lang);

    } catch (err) {
        // Handle errors
        console.log("err(getAllLiveStreamByGuru )....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};
