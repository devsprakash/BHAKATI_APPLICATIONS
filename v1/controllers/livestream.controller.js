
const { sendResponse } = require("../../services/common.service");
const constants = require('../../config/constants')
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL } = require('../../keys/development.keys')
const axios = require('axios');
const LiveStream = require('../../models/liveStreaming.model')
const dateFormat = require('../../helper/dateformat.helper')




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

        reqBody.status = 'LIVE'
        reqBody.startTime = dateFormat.add_current_time()
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const addNewLiveStreaming = await LiveStream.create(reqBody)

        const obj = {
            LiveStreamData: response.data,
            addNewLiveStreaming
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.create_new_live_stream_video', obj, req.headers.lang);

    } catch (err) {
        console.log("err(createNewLiveStream)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.getAllLiveStream = async (req, res) => {

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

        const LiveStreamsData = await LiveStream.find()
            .populate('templeId')
            .populate('pujaId')
            .sort()
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        const allLivestreams = {
            LiveStreamsData,
            muxData: response.data
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.get_all_live_streams', allLivestreams, req.headers.lang);
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

        const livestream = await LiveStream.findOneAndDelete({ _id: id });

        const deleteStream = {
            livestream,
            muxData: response.data
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.delete_live_streams', deleteStream, req.headers.lang);

    } catch (err) {
        console.log("err(deleteLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.LiveStreamingEnd = async (req, res) => {

    let { LIVE_STREAM_ID, id } = req.params;
    const reqBody = req.body;

    try {

        const response = await axios.put(
            `${MUXURL}/video/v1/live-streams/${LIVE_STREAM_ID}/complete`,
            reqBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const endLiveStream = await LiveStream.findOneAndUpdate({ _id: id },
            {
                $set:
                    { status: 'END', endTime: dateFormat.add_current_time(), updated_at: dateFormat.set_current_timestamp() }
            },
            {
                new: true
            },

        ).populate('templeId').populate('pujaId');

        const updateLiveStream = {
            endLiveStream: endLiveStream,
            muxData: response.data
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.update_live_streams', updateLiveStream, req.headers.lang);

    } catch (err) {
        console.log("err(LiveStreamingEnd)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}


