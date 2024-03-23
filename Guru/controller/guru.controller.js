

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

        let files = req.file
        const guruImage = `${BASEURL}/uploads/${files.filename}`;

        const newGuru = await TempleGuru.create({
            ...req.body,
            GuruImg: guruImage,
            password: hashedPassword,
            templeId: templeId,
            user_type: 4,
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
        console.log(guruId)

        const guru = await TempleGuru.findById(guruId);

        const selectFields = '_id GuruName expertise templeId GuruImg';
        const guruList = await TempleGuru.find({ user_type: constants.USER_TYPE.GURU }).select(selectFields).sort().limit(10)


        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );


        const LiveStreamingId =  guru.muxData.map((stream) => stream.LiveStreamId);
       
        const matchedData = [];
        for (const item of response.data.data) {
          if (LiveStreamingId.includes(item.id)) {
            matchedData.push(item);
          }
        }
        

        const VideoData = await Video.find({ guruId: guru._id }).sort().limit(8)

        let object = {
            GuruName: guru.GuruName,
            email: guru.email,
            mobile_number: guru.mobileNumber,
            _id: guru._id,
            expertise: guru.expertise,
            GuruImg: guru.GuruImg,
            muxData: guru.muxData,
        }

        const guruLiveStreaming = guruLiveStreamResponse.data;

        const guruProfileData = {
            guruData: object,
            GuruList: guruList,
            guruLiveStreaming: matchedData,
            VideoData: VideoData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_guru_profile', guruProfileData, req.headers.lang);
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
            guruId: guruId
        };

        const templeData = await TempleGuru.findOneAndUpdate(
            { _id: guruId }, 
            { $set: liveStreamData }, 
            { new: true }
        );

        templeData.muxData.push({
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
        });

        await templeData.save()

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', templeData, req.headers.lang);

    } catch (err) {
        console.log("err(GuruCreateNewLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getAllLiveStreamByGuru = async (req, res) => {

    try {

        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        if (!response.data || !response.data.data || response.data.data.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found_streams', {}, req.headers.lang);

        const selectedFields = 'GuruName email mobile_number muxData.title muxData.description expertise GuruImg _id guruId muxData.plackBackId muxData.stream_key  muxData.LiveStreamId';
        const LiveStreamsData = await TempleGuru.find({ user_type: 4 })
            .select(selectedFields)
            .sort({ createdAt: -1 })

        if (!LiveStreamsData || LiveStreamsData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);

            const liveStreamIds = LiveStreamsData.map(item => item.muxData.map(mux => mux.LiveStreamId)).flat();
            const matchedStreamingData = [];


            for (const stream of response.data.data) {
            
                if (liveStreamIds.includes(stream.id)) {
                    matchedStreamingData.push(stream); 
                }
            }

        const allLivestreams = {
            LiveStreamsData,
            matchedStreamingData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', allLivestreams, req.headers.lang);

    } catch (err) {
        console.log("err(getAllLiveStreamByGuru )....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};
