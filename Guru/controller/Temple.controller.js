
const { sendResponse } = require('../../services/common.service')
const Temple = require('../../models/Temple.model');
const { BASEURL } = require('../../keys/development.keys')
const { isValid } = require("../../services/blackListMail");
const constants = require("../../config/constants");
const bcrypt = require('bcryptjs')
const TempleGuru = require('../../models/guru.model');
const { TempleLoginReponse , TempleReponse  } = require('../../ResponseData/Temple.reponse')
const { guruLoginResponse } = require('../../ResponseData/Guru.response')




exports.templeLogin = async (req, res) => {

    try {

        const reqBody = req.body;
        const userType = reqBody.userType;

        const checkMail = await isValid(reqBody.email);

        if (checkMail == false) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);
        }

        let user;

        if (userType === constants.USER_TYPE.GURU) {
            user = await TempleGuru.findOne({ email: reqBody.email });
        } else if (userType === constants.USER_TYPE.TEMPLEAUTHORITY) {
            user = await Temple.findOne({ email: reqBody.email });
        } else {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);
        }

        console.log('users', user)
        if (!user) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);
        }

        const matchPassword = await bcrypt.compare(reqBody.password, user.password);

        if (matchPassword === false) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);
        }

        if (user.status === 0) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        }

        if (user.status === 2) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        }

        if (user.deleted_at !== null) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        }


        let newToken = await user.generateAuthToken();
        let refreshToken = await user.generateRefreshToken();

        user.refresh_tokens = refreshToken;
        user.tokens = newToken;
        await user.save();

        let responseData;

        if (user.user_type == 3) {
            responseData = TempleLoginReponse(user);
        } else if (user.user_type == 4) {
            responseData = guruLoginResponse(user)
        }


        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_login', responseData, req.headers.lang);

    } catch (err) {
        console.log(`err(TempleLoginOrGuruLogin).....`, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.logout = async (req, res, next) => {

    try {

        const { userId, userType } = req.body;

        let userData;

        if (userType === constants.USER_TYPE.TEMPLEAUTHORITY) {
            userData = await Temple.findById(userId);
        } else if (userType === constants.USER_TYPE.GURU) {
            userData = await TempleGuru.findById(userId);
        } else {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);
        }

        if (!userData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);
        }

        userData.tokens = null;
        userData.refresh_tokens = null;

        await userData.save();

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, `TEMPLE.logout_success`, {}, req.headers.lang);

    } catch (err) {
        console.log(`err(TempleLoginOrGuruLogin)....`, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}




exports.getTempleProfile = async (req, res) => {

    try {

        const { templeId } = req.params;
        const temple = await Temple.findById(templeId);

        if (!temple) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);
        }

        const responseData = TempleReponse(temple);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', responseData , req.headers.lang);

    } catch (err) {
        console.error('Error(getGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};

