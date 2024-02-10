
const { sendResponse } = require("../../services/common.service");
const constants = require('../../config/constants')
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL } = require('../../keys/development.keys')
const axios = require('axios')




exports.createNewLiveStream = async (req, res) => {

    const requestData = {
        "playback_policy": [
            "public"
        ],
        "new_asset_settings": {
            "playback_policy": [
                "public"
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

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.create_new_live_stream_video', response.data, req.headers.lang);

    } catch (err) {
        console.log("err(createNewLiveStream)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.getAllLiveStream = async (req, res) => {

    const { limit = 25 , page = 1 } = req.query;

    try {

        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams`,
            {
                params: {
                    limit,
                    page
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.get_all_live_streams', response.data, req.headers.lang);

    } catch (err) {

        console.log("err(getAllLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}




exports.getLiveStream = async (req, res) => {

    let { LIVE_STREAM_ID } = req.params;

    try {

        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams/${LIVE_STREAM_ID}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.get_all_live_streams', response.data, req.headers.lang);

    } catch (err) {
        console.log("err(getAllLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.updateLiveStream = async (req, res) => {

    let { LIVE_STREAM_ID } = req.params;
    const reqBody = req.body;

    try {

        const response = await axios.patch(
            `${MUXURL}/video/v1/live-streams/${LIVE_STREAM_ID}`,
             reqBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.update_live_streams', response.data, req.headers.lang);

    } catch (err) {
        console.log("err( updateLiveStream )....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}


