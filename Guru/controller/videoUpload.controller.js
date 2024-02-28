
const { sendResponse } = require('../../services/common.service')
const constants = require("../../config/constants");
const dateFormat = require('../../helper/dateformat.helper');
const TempleGuru = require('../../models/guru.model');
const Video = require('../../models/uploadVideo.model')
const {MUXURL , MUX_TOKEN_ID , MUX_TOKEN_SECRET} = require('../../keys/development.keys');
const axios = require('axios');
const fs = require('fs');



exports.uploadNewVideo = async (req, res) => {

    const { guruId } = req.guru._id;
    const reqBody = req.body;

    const requestData = {

        "input": reqBody.inputUrl,
        "playback_policy": [
            "public"
        ],
        "encoding_tier": "smart",
        "max_resolution_tier": "2160p"
    };


    try {

        const response = await axios.post(
            `${MUXURL}/video/v1/assets`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const uploadUrl = response.data.url;
        let filePath = req.file.path;
        const fileData = fs.readFileSync(filePath);
        await axios.put(uploadUrl, fileData);


        const object = {
            startTime: dateFormat.add_current_time(),
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            description:reqBody.description,
            guruId:guruId,
                muxData: {
                    mp4_support: response.data.mp4_support,
                    master_access: response.data.data.master_access,
                    encoding_tier: response.data.data.encoding_tier,
                    plackBackId: response.data.data.id,
                    created_at: response.data.data.created_at
                },
        }
       
        const videoData = await Video.create(object)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', videoData, req.headers.lang);

    } catch (err) {
        console.log("err(uploadNewVideo)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

