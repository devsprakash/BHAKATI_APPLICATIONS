
const { sendResponse } = require('../../services/common.service')
const constants = require('../../config/constants');
const User = require('../../models/user.model');
const {
    deleteUserAccount,
    checkAdmin
} = require("../../v1/services/user.service");




exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email: email, deleted_at: null });
        console.log(user)

        if (!user) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_username_password', {}, req.headers.lang);
        }
       
        
        if (user.user_type !== constants.USER_TYPE.ADMIN) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        await user.generateAuthToken();
        await user.generateRefreshToken();

       return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.login_success', user, req.headers.lang);
    } catch (err) {
        console.log("err(admin_login)........", err)
       return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.logout = async (req, res) => {

    try {

        const reqBody = req.user;

        let UserData = await User.findById(reqBody._id)
        UserData.tokens = null
        UserData.refresh_tokens = null

        await UserData.save()
        
       return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.logout_success', {}, req.headers.lang);
    } catch (err) {
        console.log("err(admin_logout)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

// this api access only admin and integrate this api in the admin panel
exports.getAllUser = async (req, res) => {

    try {

        const userId = req.user._id;
        const findAdmin = await checkAdmin(userId)

        if (findAdmin.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const filter = {};

        if (req.query.country) {
            filter['address.country'] = req.query.country;
        }

        if (req.query.city) {
            filter['address.city'] = req.query.city;
        }

        if (req.query.state) {
            filter['address.state'] = req.query.state;
        }

        filter['user_type'] = 2;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'created_at';

        const users = await User.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder });

        if (!users && users.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang)

        const totalUsers = await User.countDocuments(filter);

        let data = {
            page: Number(page),
            total_pages: Math.ceil(totalUsers / per_page),
            total_users: totalUsers,
            users
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.getAllUser', data, req.headers.lang)


    } catch (err) {
        console.log('err(getAllUser)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


// this api access only admin and integrate this api in the admin panel
exports.deleteProfile = async (req, res) => {

    try {

        const { userId } =  req.query
        const userIds = req.user._id;

        const findAdmin = await checkAdmin(userIds);

        if (findAdmin.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const user = await deleteUserAccount(userId)

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

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.delete_account', resData, req.headers.lang);

    } catch (err) {

        console.log('err(deleteProfile).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


