
const { sendResponse } = require('../../services/common.service')
const { BASEURL } = require('../../keys/development.keys')
const { isValid } = require("../../services/blackListMail");
const constants = require("../../config/constants");
const bcrypt = require('bcryptjs')
const TempleGuru = require('../../models/guru.model');
const { TempleLoginReponse, TempleReponse } = require('../../ResponseData/Temple.reponse')
const { guruLoginResponse } = require('../../ResponseData/Guru.response')
const dateFormat = require('../../helper/dateformat.helper')
const Bank = require('../../models/bankDetails.model');
const Pandit = require('../../models/pandit.model');
const Puja = require('../../models/puja.model');
const LiveStream = require('../../models/liveStreaming.model');
const Video = require('../../models/uploadVideo.model');






exports.templeLogin = async (req, res) => {

    try {
        const reqBody = req.body;

        const checkMail = await isValid(reqBody.email);

        if (checkMail === false) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);
        }

        let user = await TempleGuru.findOne({ email: reqBody.email });

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

        let responseData

        if (user.user_type === constants.USER_TYPE.TEMPLEAUTHORITY) {
            responseData = TempleLoginReponse(user);
        } else {
            responseData = guruLoginResponse(user);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_login', responseData, req.headers.lang);

    } catch (err) {
        console.log(`err(TempleLoginOrGuruLogin).....`, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}


exports.logout = async (req, res, next) => {

    try {

        const templeId = req.guru._id;

        let userData = await TempleGuru.findById(templeId);

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

        const templeId = req.guru._id;
        const temple = await TempleGuru.findById(templeId);

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const LiveArati = await LiveStream.find({ templeId: templeId }, { pujaId: 0 }).populate('ritualId');

        if (!LiveArati || LiveArati.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);

        const pujaData = await Puja.find({ templeId: templeId, status: 'upcoming' });

        if (!pujaData || pujaData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang);

        const templeData = await TempleGuru.findOne({ templeId: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        const VideoData = await Video.find({ guruId: templeData._id });

        if (!VideoData || VideoData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.not_found', {}, req.headers.lang);


        const data = {
            templeData: TempleReponse(temple),
            liveAarati: LiveArati,
            pujaData: pujaData,
            VideoData: VideoData
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', data, req.headers.lang);

    } catch (err) {
        console.error('Error(getGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.addBankDetails = async (req, res) => {

    try {

        const templeId = req.guru._id;

        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const reqBody = req.body;
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.templeId = templeId;

        const addBank = await Bank.create(reqBody);
        addBank.templeId = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_bank_details', addBank, req.headers.lang);

    } catch (err) {
        console.error('Error(addBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.getBankDetails = async (req, res) => {

    try {

        const { bankId } = req.params;
        const templeId = req.guru._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const banks = await Bank.findById(bankId)
            .populate('templeId', 'TempleName TempleImg _id')

        if (!banks) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_bankDetils', banks, req.headers.lang);

    } catch (err) {
        console.error('Error(getBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addpanditDetails = async (req, res) => {

    try {

        const templeId = req.guru._id;
        const reqBody = req.body;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const existEmail = await Pandit.findOne({ email: reqBody.email });

        if (existEmail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAI4, 'TEMPLE.email_already_exist', {}, req.headers.lang);

        reqBody.templeId = templeId;

        const addpandit = await Pandit.create(reqBody);
        addpandit.templeId = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_pandit_details', addpandit, req.headers.lang);

    } catch (err) {
        console.error('Error(addpanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.getpanditDetails = async (req, res) => {

    try {

        const { panditId } = req.params;
        const templeId = req.guru._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findById(panditId)
            .populate('templeId', 'TempleName TempleImg _id')

        if (!pandit) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found_pandit', {}, req.headers.lang);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_pandit_details', pandit, req.headers.lang);

    } catch (err) {
        console.error('Error(getpanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.UpdatepanditDetails = async (req, res) => {

    try {

        const { panditId } = req.params;
        const reqBody = req.body;
        const templeId = req.guru._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        if (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findOneAndUpdate({ _id: panditId },
            {
                $set: {
                    email: reqBody.email,
                    mobile_number: reqBody.mobile_number,
                    full_name: reqBody.full_name,
                    updated_at: dateFormat.set_current_timestamp()
                }
            },
            { new: true }
        )

        if (!pandit) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found_pandit', {}, req.headers.lang);
        }

        pandit.templeId = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_pandit_details', pandit, req.headers.lang);

    } catch (err) {
        console.error('Error(UpdatepanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};