
const { sendResponse } = require("../../services/common.service");
const constants = require('../../config/constants')
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL } = require('../../keys/development.keys')
const axios = require('axios');
const LiveStream = require('../../models/liveStreaming.model')
const dateFormat = require('../../helper/dateformat.helper')
const { LiveStreamingResponse, LiveStreamingEndResponse } = require('../../ResponseData/LiveStream.reponse')






exports.createNewLiveStream = async (req, res) => {

    const reqBody = req.body;

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

            pujaId: reqBody.pujaId,
            templeId: reqBody.templeId,
            status: 'LIVE',
            startTime: dateFormat.add_current_time(),
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            description:reqBody.description,
            title:reqBody.title,
            muxData: {
                playBackId: ids[0],
                stream_key: response.data.data.stream_key,
                status: response.data.data.status,
                reconnect_window: response.data.data.reconnect_window,
                max_continuous_duration: response.data.data.max_continuous_duration,
                latency_mode: response.data.data.latency_mode,
                LiveStreamingId: response.data.data.id,
                created_at: response.data.data.created_at,
            },
        }

        const addNewLiveStreaming = await LiveStream.create(object)
        const streams = LiveStreamingResponse(addNewLiveStreaming)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.create_new_live_stream_video', streams, req.headers.lang);

    } catch (err) {
        console.log("err(createNewLiveStream)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllLiveStreamByPuja = async (req, res) => {

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


        const LiveStreamsData = await LiveStream.find().select('_id status startTime muxData title description')
            .populate('templeId', 'TempleName TempleImg _id Location')
            .populate('pujaId', 'pujaName pujaImage _id')
            .sort()
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        if (!LiveStreamsData && LiveStreamsData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);


        const allLivestreams = {
            LiveStreamsData,
            muxData: response.data
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.get_all_live_streams_by_puja', allLivestreams, req.headers.lang);
    } catch (err) {
        console.log("err(getAllLiveStreamByPuja)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.getAllLiveStreamByRithuals = async (req, res) => {

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


        const LiveStreamsData = await LiveStream.find().select('_id status startTime muxData')
            .populate('templeId', 'TempleName TempleImg _id Location')
            .populate('ritualId', 'ritualName StartTime EndTime _id')
            .sort()
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        if (!LiveStreamsData && LiveStreamsData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);

        const allLivestreams = {
            LiveStreamsData,
            muxData: response.data
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.get_all_live_streams_by_rithuals', allLivestreams, req.headers.lang);

    } catch (err) {
        console.log("err(getAllLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}





exports.deleteLiveStream = async (req, res) => {

    let { LIVE_STREAM_ID, id } = req.params;

    try {

        const response = await axios.delete(
            `${MUXURL}/video/v1/live-streams/${LIVE_STREAM_ID}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        if (!response.data)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found_streams', {}, req.headers.lang);


        const livestream = await LiveStream.findOneAndDelete({ _id: id });

        if (!livestream)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);


        const livestreams = LiveStreamingResponse(livestream)

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.delete_live_streams', livestreams, req.headers.lang);

    } catch (err) {
        console.log("err(deleteLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.LiveStreamingEnd = async (req, res) => {

    let { LIVE_STREAM_ID, id } = req.params;
    const reqBody = req.body;

    try {

          const response =  await axios.put(
            `${MUXURL}/video/v1/live-streams/${LIVE_STREAM_ID}/complete`,
            reqBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        if (!response.data)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found_streams', {}, req.headers.lang);


        const endLiveStream = await LiveStream.findOneAndUpdate({ _id: id },
            {
                $set:
                    { status: 'END', endTime: dateFormat.add_current_time(), updated_at: dateFormat.set_current_timestamp() }
            },
            {
                new: true
            },
        )

        if (!endLiveStream)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);


        const endLiveStreams = LiveStreamingEndResponse(endLiveStream)

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.update_live_streams', endLiveStreams, req.headers.lang);

    } catch (err) {
        console.log("err(LiveStreamingEnd)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}


