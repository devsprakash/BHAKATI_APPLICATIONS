

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
const { guruResponseData, guruLiveStreamResponse, guruLoginResponse } = require('../../ResponseData/Guru.response')
const Video = require('../../models/uploadVideo.model');
const User = require('../../models/user.model');





exports.addNewGuru = async (req, res) => {

    try {

        const { email, password, templeId } = req.body;

        const isBlacklisted = await isValid(email);
        if (!isBlacklisted) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);
        }

        const existingEmail = await TempleGuru.findOne({ email });
        if (existingEmail) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.existing_email', {}, req.headers.lang);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let files = req.files;

        const newGuru = await TempleGuru.create({
            ...req.body,
            GuruImg: `${BASEURL}/uploads/${files[0].filename}`,
            password: hashedPassword,
            templeId: templeId,
            user_type: 4,
            backgroundImage: `${BASEURL}/uploads/${files[1].filename}`,
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

        const { guruId } = req.body;
        const selectField = 'muxData.title muxData.description muxData.plackBackId muxData.stream_key muxData.LiveStreamId GuruName GuruImg backgroundImage _id  description expertise mobile_number email';
        const guruData = await TempleGuru.findOne({ _id: guruId }).select(selectField)

        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams/${guruData.muxData.LiveStreamId}`,
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

        const videoData = await Video.find({ 'muxData.assetId': { $in: assetsId } }).sort().limit(8);

        const selectFields = 'GuruName GuruImg backgroundImage _id description expertise mobile_number email';
        const GuruList = await TempleGuru.find({ user_type: constants.USER_TYPE.GURU }).sort().select(selectFields).limit(10);

        let datas = {
            streamKey: response.data.data.stream_key,
            id: response.data.data.id
        };

        const data = {
            guruData,
            matchedData: datas,
            GuruList,
            suggestVideo: videoData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_guru_profile', data, req.headers.lang);
    } catch (err) {
        console.error('Error(getGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.SearchAllGuru = async (req, res) => {

    try {

        // const guruId = req.user._id;
        // const GuruData = await User.findById(guruId);

        // if (GuruData.user_type !== constants.USER_TYPE.ADMIN)
        //     return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

        const { sort, guruname, email, expertise, mobile_number } = req.query;

        const query = { user_type: 4 };

        if (email) {
            query.email = email;
        }

        if (guruname) {
            const gurunameRegex = new RegExp(guruname.split(' ').join('|'), 'i');
            query.GuruName = gurunameRegex;
        }

        // Refine keyword search for expertise
        if (expertise) {
            const expertiseRegex = new RegExp(expertise.split(' ').join('|'), 'i');
            query.expertise = expertiseRegex;
        }

        if (mobile_number) {
            query.mobile_number = mobile_number;
        }

        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        let guruData;
        let totalGurus
        const selectFields = '_id GuruName email mobile_number expertise templeId GuruImg created_at updated_at'
        if (query.length === 0) {
            [guruData, totalGurus] = await Promise.all([
                TempleGuru.find({ user_type: 4 })
                    .select(selectFields)
                    .populate('templeId', 'TempleName TempleImg Location State District Desc Temple_Open_time Closing_time _id templeId user_type')
                    .sort(sortOptions),
                TempleGuru.countDocuments({ user_type: 4 })
            ]);
        }

        [guruData, totalGurus] = await Promise.all([
            TempleGuru.find(query)
                .select(selectFields)
                .populate('templeId', 'TempleName TempleImg Location State District Desc Temple_Open_time Closing_time _id templeId user_type')
                .sort(sortOptions),
            TempleGuru.countDocuments(query)
        ]);

        if (!guruData || guruData.length === 0) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'GURU.guru_not_found', {}, req.headers.lang);
        }

        const data = {
            total_gurus: totalGurus,
            guruData: guruData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_gurus', data, req.headers.lang);

    } catch (err) {
        console.error('Error(SearchAllGuru)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.GuruCreateNewLiveStream = async (req, res) => {

    const guruId = req.Temple._id;
    const reqBody = req.body;
    const guru = await TempleGuru.findById(guruId);

    if (guru.user_type !== constants.USER_TYPE.GURU)
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
            description: reqBody.description,
            title: reqBody.title,
            guruId: guruId,
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

        const guruData = await TempleGuru.findOneAndUpdate(
            { _id: guruId },
            { $set: liveStreamData },
            { new: true }
        );

        const responseData = guruLiveStreamResponse(guruData)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(GuruCreateNewLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getLiveStreamByGuru = async (req, res) => {

    try {

        const { guruId } = req.body;

        const selectFields = 'muxData.title muxData.description muxData.plackBackId muxData.stream_key muxData.LiveStreamId GuruName GuruImg backgroundImage _id  description expertise mobile_number email';
        const guruData = await TempleGuru.findOne({ _id: guruId }).select(selectFields);

        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams/${guruData.muxData.LiveStreamId}`,
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

        let data = {
            streamKey: response.data.data.stream_key,
            id: response.data.data.id
        }

        const allLivestreams = {
            guruData,
            matchedStreamingData: data,
            suggestVideo: videoData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', allLivestreams, req.headers.lang); // Ensure sendResponse function is correctly defined and imported
    } catch (err) {
        console.log("err(getLiveStreamByGuru)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang); // Ensure sendResponse function is correctly defined and imported
    }
};
