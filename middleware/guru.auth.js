
const jwt = require('jsonwebtoken');

const TempleGuru = require('../models/guru.model');
const constants = require('../config/constants')
const { sendResponse } = require('../services/common.service');
const { JWT_SECRET } = require('../keys/keys')





//authenticate user
let GuruAuth = async (req, res, next) => {

    try {

        if (!req.header('Authorization')) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.not_token', {}, req.headers.lang)

        const decoded = await jwt.verify(token, JWT_SECRET);
        const guru = await TempleGuru.findOne({ _id: decoded._id, 'tokens': token }).lean();
      
        if (!guru) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang)
    
        if (guru.status == 0) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'USER.inactive_account', {}, req.headers.lang);
        if (guru.status == 2) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'USER.deactive_account', {}, req.headers.lang);
        if (guru.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'USER.delete_account', {}, req.headers.lang);
    
        req.token = token;
        req.guru = guru;

        next();
        
    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

module.exports = GuruAuth;