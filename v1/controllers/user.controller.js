const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
const { isValid } = require("../../services/blackListMail");
const {
    Usersave,
    getUser
} = require("../services/user.service");
const constants = require("../../config/constants");
const { BASEURL } = require("../../keys/keys");
const { sendMail } = require('../../services/email.services')





exports.logout = async (req, res, next) => {

    try {

        const reqBody = req.user;

        let UserData = await User.findById(reqBody._id)
        UserData.tokens = null
        UserData.refresh_tokens = null

        await UserData.save()
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.logout_success', {}, req.headers.lang);

    } catch (err) {
        console.log("err(logout)....")
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.login = async (req, res, next) => {

    try {

        const reqBody = req.body
        const { device_token, device_type } = reqBody;

        const checkMail = await isValid(reqBody.email)
        if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        let user = await User.findOne({ email: reqBody.email })
        let otp = Math.floor(100000 + Math.random() * 900000);
        let text = `${otp}`

        if (!user) {
            sendMail(reqBody.email, text)
            reqBody.otp = text;
            reqBody.created_at = await dateFormat.set_current_timestamp();
            reqBody.updated_at = await dateFormat.set_current_timestamp();
            let users = await User.create(reqBody);
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.login_success', users, req.headers.lang);
        }

        if (user.verify === false)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.not_verify', user, req.headers.lang);

        if (user == 1) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.email_not_found', {}, req.headers.lang);
        if (user == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);

        if (user.status == 0) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        if (user.status == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        if (user.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);

        let newToken = await user.generateAuthToken();
        let refreshToken = await user.generateRefreshToken()

        sendMail(reqBody.email, text)
        user.otp = text
        user.refresh_tokens = refreshToken
        user.tokens = newToken;
        user.device_token = device_token;
        user.device_type = device_type;
        await user.save()

        let resData = user
        resData.tokens = '';
        resData.refresh_tokens = ''
        delete resData.reset_password_token;
        delete resData.reset_password_expires;
        delete resData.password;
        delete resData.refresh_tokens;
        delete resData.tokens;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.login_success', resData, req.headers.lang);

    } catch (err) {

        console.log('err(login).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.verifyOtp = async (req, res) => {

    try {

        const { userId } = req.params;

        const user = await User.findOne({ _id: userId })

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang);

        if (user.otp !== req.body.otp)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.otp_not_matched', {}, req.headers.lang);

        let newToken = await user.generateAuthToken();
        let refreshToken = await user.generateRefreshToken();

        let users = await User.findOneAndUpdate({ _id: userId }, { $set: { otp: null, tokens: newToken, refresh_tokens: refreshToken, verify: true } }, { new: true })

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.opt_verify', users, req.headers.lang);

    } catch (err) {

        console.log('err(verifyOtp).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.getUser = async (req, res) => {

    try {

        const userId = req.user._id;
        const user = await getUser(userId);

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.user_details_not_found', {}, req.headers.lang);

        let resData = user
        delete resData.reset_password_token;
        delete resData.password;
        delete resData.tokens;
        delete resData.user_type;
        delete resData.status;
        delete resData.signup_status;
        delete resData.refresh_tokens;
        delete resData.tempTokens;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.profile_fetch_success', resData, req.headers.lang);

    } catch (err) {

        console.log('err(getUser).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}





exports.updateProfile = async (req, res) => {

    try {

        const { userId } = req.params;
        const reqBody = req.body;
        const userData = await User.findOne({ _id: userId });

        if (userData.isUpdated === true)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.already_updated', {}, req.headers.lang);

        // if (!req.file)
        //     return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.no_image_upload', {}, req.headers.lang);

        // let files = req.file;
        // const imageUrl = `${BASEURL}/${files.destination}/${files.filename}`;

        const user = await User.findOneAndUpdate({ _id: userId },
            {
                $set: {

                    full_name: reqBody.full_name,
                    email: reqBody.email,
                    gender: reqBody.gender,
                    mobile_number: reqBody.mobile_number,
                    dob: reqBody.dob,
                    isUpdated: true,
                    status: constants.STATUS.ACTIVE
                }
            },

            { new: true })

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang);

        let resData = user
        delete resData.reset_password_token;
        delete resData.password;
        delete resData.tokens;
        delete resData.user_type;
        delete resData.status;
        delete resData.signup_status;
        delete resData.refresh_tokens;
        delete resData.tempTokens;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.profile_update_success', resData, req.headers.lang);

    } catch (err) {

        console.log('err(updateProfile).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.updateDeviceToken = async (req, res) => {

    try {

        const userId = req.user._id;
        const reqBody = req.body;
        const { device_token, device_type } = reqBody;
        const users = await User.findOne({ _id: userId });

        if (!users)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.user_details_not_found', {}, req.headers.lang);

        users.device_token = device_token;
        users.device_type = device_type;
        users.updated_at = dateFormat.set_current_timestamp()
        await users.save();

        let resData = users
        delete resData.reset_password_token;
        delete resData.password;
        delete resData.tokens;
        delete resData.user_type;
        delete resData.status;
        delete resData.signup_status;
        delete resData.refresh_tokens;
        delete resData.tempTokens;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.update_device_token', resData, req.headers.lang);

    } catch (err) {

        console.log('err(updateDeviceToken).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


