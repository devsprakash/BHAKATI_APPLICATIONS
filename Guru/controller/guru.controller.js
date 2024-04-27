

const { sendResponse } = require('../../services/common.service')
const { BASEURL } = require('../../keys/development.keys')
const constants = require("../../config/constants");
const { checkAdmin } = require('../../v1/services/user.service')
const dateFormat = require('../../helper/dateformat.helper');
const TempleGuru = require('../../models/guru.model');
const bcrypt = require('bcryptjs')
const { isValid } = require("../../services/blackListMail");
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL, WEBHOOKSCRETKEY } = require('../../keys/development.keys')
const axios = require('axios');
const { guruResponseData, guruLiveStreamResponse, guruLoginResponse } = require('../../ResponseData/Guru.response')
const Video = require('../../models/uploadVideo.model');
const User = require('../../models/user.model');
const { v4: uuidv4 } = require('uuid');
const GuruLiveStreaming = require('../../models/GuruLiveStreaming.model')
const { minutesToSeconds, verifyWebhookSignature, handleActiveLiveStream, getLiveStreamInfo } = require('../services/views.services')
const Mux = require('@mux/mux-node');
const mux = new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET
});






exports.addNewGuru = async (req, res) => {

    try {

        const { email, password, templeId } = req.body;

        const isBlacklisted = await isValid(email);

        if (!isBlacklisted)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        const existingEmail = await TempleGuru.findOne({ email });
        if (existingEmail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.existing_email', {}, req.headers.lang);

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!req.files['image'] || !req.files['background_image'])
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.upload_image', {}, req.headers.lang);

        const newGuru = await TempleGuru.create({
            ...req.body,
            guru_image: `${BASEURL}/uploads/${req.files['image'][0].filename}`,
            password: hashedPassword,
            temple_id: templeId,
            user_type: 4,
            gurus_id: uuidv4(),
            background_image: `${BASEURL}/uploads/${req.files['background_image'][0].filename}`,
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

        const guruId = req.Temple._id;
        const { limit } = req.query;
        const guruData = await TempleGuru.findOne({ _id: guruId });

        if (!guruData || (guruData.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const GuruData = await GuruLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, guruId: guruId }).limit(limit)
            .populate('guruId', 'guru_name guru_image _id email mobile_number gurus_id expertise created_at');

        const guruList = await TempleGuru.find({ user_type: 4 }).sort().limit(limit)

        const responseData = {
            guru_data: {
                guru_id: guruData._id,
                guru_name: guruData.guru_name,
                guru_image_url: guruData.guru_image,
                feature_image_url: guruData.background_image,
                description: guruData.description,
                email: guruData.email,
                expertise: guruData.expertise,
                date_of_joining: guruData.created_at
            } || {},
            live_aarti: GuruData.map(guru => ({
                playback_id: guru.playback_id,
                live_stream_id: guru.live_stream_id,
                stream_key: guru.stream_key,
                guru_name: guru.guruId.guru_name,
                guru_image_url: guru.guruId.guru_image,
                feature_image_url: guru.guruId.background_image,
                title: guru.title,
                description: guru.description,
                guru_id: guru._id,
                expertise: guru.guruId.expertise,
                email: guru.guruId.email,
                mobile_number: guru.guruId.mobile_number,
                published_date: new Date(),
                views: '',
                guru_id: guru.guruId._id
            })) || [],
            suggested_gurus: guruList.map(guru => ({
                guru_name: guru.guru_name,
                guru_image_url: guru.guru_image,
                guru_id: guru._id,
                created_at: guru.created_at
            })) || []
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_guru_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getGuruProfileByAdmin = async (req, res) => {

    try {

        const userId = req.user._id;
        console.log("data", userId)
        const { limit } = req.query;
        const { guruId } = req.body;

        if (!userId || !limit)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const users = await User.findById(userId)

        if (!users || (users.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

        const guruData = await TempleGuru.findOne({ _id: guruId });

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const GuruData = await GuruLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, guruId: guruId }).limit(limit)
            .populate('guruId', 'guru_name guru_image _id email mobile_number gurus_id expertise created_at');

        const guruList = await TempleGuru.find({ user_type: 4 }).sort().limit(limit)

        const responseData = {
            guru_data: {
                guru_id: guruData._id,
                guru_name: guruData.guru_name,
                guru_image_url: guruData.guru_image,
                feature_image_url: guruData.background_image,
                description: guruData.description,
                email: guruData.email,
                expertise: guruData.expertise,
                mobile_number: guruData.mobile_number,
                date_of_joining: guruData.created_at
            } || {},
            live_aarti: GuruData.map(guru => ({
                playback_id: guru.playback_id,
                live_stream_id: guru.live_stream_id,
                stream_key: guru.stream_key,
                guru_name: guru.guruId.guru_name,
                guru_image_url: guru.guruId.guru_image,
                feature_image_url: guru.guruId.background_image,
                title: guru.title,
                description: guru.description,
                guru_id: guru._id,
                expertise: guru.guruId.expertise,
                email: guru.guruId.email,
                mobile_number: guru.guruId.mobile_number,
                published_date: new Date(),
                views: '',
                guru_id: guru.guruId._id
            })) || [],
            suggested_gurus: guruList.map(guru => ({
                guru_name: guru.guru_name,
                guru_image_url: guru.guru_image,
                guru_id: guru._id,
                created_at: guru.created_at
            })) || []
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_guru_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getGuruProfileByAdmin)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.SearchAllGuru = async (req, res) => {

    try {


        const { sort, guruname, email, expertise, mobile_number } = req.query;

        const query = { user_type: 4 };

        if (email) {
            const emailRegex = new RegExp(email.split(' ').join('|'), 'i');
            query.email = emailRegex;
        }

        if (guruname) {
            const gurunameRegex = new RegExp(guruname.split(' ').join('|'), 'i');
            query.guru_name = gurunameRegex;
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
        const selectFields = '_id guru_name email mobile_number expertise gurus_id guru_image background_image created_at updated_at'
        if (query.length === 0) {
            [guruData, totalGurus] = await Promise.all([
                TempleGuru.find({ user_type: 4 })
                    .select(selectFields)
                    .populate('temple_id', 'temple_name temple_image location state district _id user_type')
                    .sort(sortOptions),
                TempleGuru.countDocuments({ user_type: 4 })
            ]);
        }

        [guruData, totalGurus] = await Promise.all([
            TempleGuru.find(query)
                .select(selectFields)
                .populate('temple_id', 'temple_name temple_image location state district _id user_type')
                .sort(sortOptions),
            TempleGuru.countDocuments(query)
        ]);


        const responseData = guruData.map(guru => ({
            total_gurus: totalGurus,
            guru_name: guru.guru_name,
            guru_image_url: guru.guru_image,
            mobile_number: guru.mobile_number,
            email: guru.email,
            expertise: guru.expertise,
            guru_id: guru._id,
            feature_image_url: guru.background_image,
            created_at: guru.created_at,
            updated_at: guru.updated_at
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_gurus', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(SearchAllGuru)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.GuruCreateNewLiveStream = async (req, res) => {

    const guruId = req.Temple._id;
    const reqBody = req.body;
    const guru = await TempleGuru.findById(guruId);

    if (!guru || (guru.user_type !== constants.USER_TYPE.GURU))
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
            guruId: guruId,
        }

        const guruData = await GuruLiveStreaming.create(liveStreamData)

        const responseData = guruLiveStreamResponse(guruData)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(GuruCreateNewLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getLiveStreamByGuru = async (req, res) => {

    try {

        const { limit } = req.query;

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const GuruData = await GuruLiveStreaming.find({ live_stream_id: { $in: LiveStreamingData } }).limit(limit)
            .populate('guruId', '_id guru_name email mobile_number expertise gurus_id guru_image background_image created_at updated_at');

        const responseData = GuruData.map(guru => ({
            playback_id: guru.playback_id,
            live_stream_id: guru.live_stream_id,
            stream_key: guru.stream_key,
            guru_name: guru.guruId.guru_name,
            guru_image_url: guru.guruId.guru_image,
            feature_image_url: guru.guruId.background_image,
            title: guru.title,
            description: guru.description,
            guru_id: guru._id,
            expertise: guru.guruId.expertise,
            email: guru.guruId.email,
            mobile_number: guru.guruId.mobile_number,
            published_date: new Date(),
            views: '',
            guruId: guru.guruId._id
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(getLiveStreamByGuru)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang); // Ensure sendResponse function is correctly defined and imported
    }
};


exports.guru_suggested_videos = async (req, res) => {

    try {

        const { guruId, limit } = req.query;

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

        const videoData = await Video.find({ 'muxData.asset_id': { $in: assetsId }, guruId: guruId }).sort({ created_at: -1 }).limit(parseInt(limit));

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
            guru_id: video.guruId,
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_the_suggested_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(guru_suggested_videos)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateGuruProfile = async (req, res) => {

    try {

        const guruId = req.Temple._id;
        const guru = await TempleGuru.findOne({ _id: guruId });

        if (guru.user_type !== constants.USER_TYPE.GURU)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const { guru_name, email, mobile_number } = req.body;


        if (!guru_name || !email)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);


        const updateFields = {};

        if (guru_name) {
            updateFields.guru_name = guru_name;
        }

        if (email) {
            updateFields.email = email;
        }

        if (mobile_number) {
            updateFields.mobile_number = mobile_number;
        }

        if (expertise) {
            updateFields.expertise = expertise;
        }

        if (mobile_number) {
            updateFields.mobile_number = mobile_number;
        }

        const guruData = await TempleGuru.findOneAndUpdate({ _id: guruId }, { $set: { updateFields } }, { new: true });
        guruData.updated_at = dateFormat.set_current_timestamp()
        await guruData.save();

        if (!guruData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.guru_not_found', {}, req.headers.lang);

        const responseData = {
            guru_id: guruData._id,
            guru_name: guruData.guru_name,
            guru_image_url: guruData.guru_image,
            feature_image_url: guruData.background_image,
            description: guruData.description,
            email: guruData.email,
            expertise: guruData.expertise,
            mobile_number: guruData.mobile_number,
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.update_guru', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(updateGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.guruDelete = async (req, res) => {

    try {

        const { guruId } = req.query;
        const userId = req.user._id;
        const user = await checkAdmin(userId);

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const guruData = await TempleGuru.findOneAndDelete({ _id: guruId });

        if (!guruData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.guru_not_found', {}, req.headers.lang);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.delete_guru', guruData, req.headers.lang);

    } catch (err) {
        console.log("err(guruDelete)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }

}



exports.Webhook = (req, res) => {

    try {

        const payload = {
            type: 'video.live_stream.idle',
            data: {
                stream_id: '036fd35c-516a-7b58-0c95-aa3ddbb2b5f2',
                status: 'Idle',
                duration: 3600
            }
        };

        const timestamp = Date.now().toString();
        const isValidSignature = verifyWebhookSignature(payload, timestamp, WEBHOOKSCRETKEY);

        if (!isValidSignature) {
            console.log('Webhook signature is invalid');
            return res.status(401).json({ success: false, message: 'Invalid signature' });
        }

        const eventType = payload.type;
        let responseData;
        switch (eventType) {
            case 'video.live_stream.active':
                responseData = handleActiveLiveStream(payload);
                break;
            case 'video.live_stream.idle':
                responseData = handleActiveLiveStream(payload);
                break;
            case 'video.live_stream.disabled':
                responseData = handleActiveLiveStream(payload);
                break;
            default:
                console.log('Unknown event type:', eventType);
                break;
        }

        res.status(200).json({ success: true, data: responseData });

    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
