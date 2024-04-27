
const { sendResponse } = require('../../services/common.service')
const constants = require('../../config/constants');
const TempleGuru = require('../../models/guru.model');
const {
    checkAdmin
} = require("../../v1/services/user.service");
const { BASEURL, JWT_SECRET, MUXURL, MUX_TOKEN_ID, MUX_TOKEN_SECRET } = require('../../keys/development.keys')
const { templeSave } = require('../services/temple.service')
const dateFormat = require("../../helper/dateformat.helper");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { TempleReponse } = require('../../ResponseData/Temple.reponse')
const User = require('../../models/user.model');
const axios = require('axios');






exports.addTemple = async (req, res) => {

    const reqBody = req.body;
    const userId = req.user._id;

    try {

        const user = await checkAdmin(userId);

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if (!req.files['image'] || !req.files['background_image'])
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.upload_image', {}, req.headers.lang);

        reqBody.temple_image = `${BASEURL}/uploads/${req.files['image'][0].filename}`;
        reqBody.background_image = `${BASEURL}/uploads/${req.files['background_image'][0].filename}`;

        const templesEmailExist = await TempleGuru.findOne({ email: reqBody.email });

        if (templesEmailExist)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'TEMPLE.email_already_exist', {}, req.headers.lang);

        reqBody.temples_id = uuidv4();
        if (reqBody.password)
            reqBody.password = await bcrypt.hash(reqBody.password, 10)
        else {
            reqBody.password = null;
        }

        reqBody.tempTokens = await jwt.sign({
            email: reqBody.email.toString()
        }, JWT_SECRET, { expiresIn: '24h' })

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.user_type = 3;
        const templeData = await templeSave(reqBody);

        const responseData = TempleReponse(templeData)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.addTemple', responseData, req.headers.lang);

    } catch (err) {

        console.log("err(addTemple)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.SearchAllTemples = async (req, res, next) => {

    try {

        const { sort, state, templename, location, district, email, category } = req.query;

        let query = {};

        if (templename) {
            const templeRegex = new RegExp(templename.split(' ').join('|'), 'i');
            query.temple_name = templeRegex;
        }
        if (category) {
            const categoryRegex = new RegExp(category.split(' ').join('|'), 'i');
            query.category = categoryRegex;
        }
        if (state) {
            query.state = state;
        }
        if (location) {
            query.location = location;
        }
        if (district) {
            query.district = district;
        }
        if (email) {
            query.email = email;
        }

        const sortOptions = {};

        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        let temples;
        let countTemples;

        if (Object.keys(query).length === 0) {
            temples = await TempleGuru.find({ user_type: 3 })
                .select('temple_name category temple_image _id state district location description mobile_number email open_time closing_time')
                .sort(sortOptions)

            countTemples = await TempleGuru.countDocuments({ user_type: 3 });
        } else {
            temples = await TempleGuru.find({ user_type: 3, ...query })
                .select('temple_name category temple_image _id state district location description mobile_number email open_time closing_time')
                .sort(sortOptions)

            countTemples = await TempleGuru.countDocuments({ user_type: 3, ...query });
        }

        if (!temples || temples.length === 0) {
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', [], req.headers.lang);
        }

        const responseData = temples.map(data => ({
            totalTemples: countTemples,
            mobile_number: data.mobile_number,
            email: data.email,
            temple_name: data.temple_name,
            temple_image_url: data.temple_image,
            feature_image_url: data.background_image,
            location: data.location,
            district: data.district,
            description: data.description,
            open_time: data.open_time,
            closing_time: data.closing_time,
            temple_id: data._id,
            state: data.state,
            category: data.category
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_all_temples', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(SearchAllTemples)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.templeDelete = async (req, res) => {


    try {

        const { templeId } = req.query;

        const userId = req.user._id;

        const user = await checkAdmin(userId);

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const templeData = await TempleGuru.findOneAndDelete({ _id: templeId });

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_not_found', {}, req.headers.lang);

        const responseData = TempleReponse(templeData)

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.delete_temples', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(templeDelete)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }

}
