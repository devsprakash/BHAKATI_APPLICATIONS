
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { APPID, APPCERTIFICATE } = require('../../keys/development.keys')
const { sendResponse } = require("../../services/common.service");
const constants = require('../../config/constants')

const APP_ID = APPID;
const APP_CERTIFICATE = APPCERTIFICATE;



exports.generateRTCToken = (req, res) => {

    try {

        res.header('Access-Control-Allow-Origin', '*');

        const channelName = req.params.channel;

        if (!channelName)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'LIVE.channel_name_is_required', {}, req.headers.lang);

        const uid = req.params.uid;

        if (!uid || uid === '')
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'LIVE.uid_is_required', {}, req.headers.lang);


        let role;
        if (req.params.role === 'publisher') {
            role = RtcRole.PUBLISHER;
        } else if (req.params.role === 'audience') {
            role = RtcRole.SUBSCRIBER;
        } else {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'LIVE.in_correct', {}, req.headers.lang);
        }

        let expireTime = req.query.expiry;
        if (!expireTime || expireTime === '') {
            expireTime = 3600;
        } else {
            expireTime = parseInt(expireTime, 10);
        }

        let token;
        if (req.params.tokentype === 'userAccount') {
            token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFICATE, channelName, uid, role, expireTime);
        } else if (req.params.tokentype === 'uid') {
            token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, expireTime);
        } else {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'LIVE.in_valid_token', {}, req.headers.lang);
        }
        
        let TOKEN = {
            token
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'LIVE.generate_token',TOKEN , req.headers.lang);

    } catch (err) {

        console.log("err(generateRTCToken)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }



}