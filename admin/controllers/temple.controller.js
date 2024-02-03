
const { sendResponse } = require('../../services/common.service')
const constants = require('../../config/constants');
const Temple = require('../../models/Temple.model');
const {
    checkAdmin
} = require("../../v1/services/user.service");
const { BASEURL } = require('../../keys/development.keys')
const {templeSave} = require('../services/temple.service')
const dateFormat = require("../../helper/dateformat.helper");





exports.addTemple = async (req, res) => {

    const reqBody = req.body;
    const userId = req.user._id;

    try {

        const user = await checkAdmin(userId)
        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if (!req.file)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.no_image_upload', {}, req.headers.lang);

        let files = req.file;
        console.log(files)
        const TempleImageUrl = `${BASEURL}/${files.destination}/${files.filename}`;
        reqBody.TempleImg = TempleImageUrl;

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at =  dateFormat.set_current_timestamp();

        const templeData = await templeSave(reqBody)

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.addTemple', templeData , req.headers.lang);

    } catch (err) {

        console.log("err(addTemple)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.getAllTemples = async (req, res, next) => {

    try {

        const { page = 1, per_page = 10, sort} = req.query;

        
        const sortOptions = {};

        if (sort) {

            const [field, order] = sort.split(':');

            sortOptions[field] = order === 'desc' ? -1 : 1;
        }
        
        const temples = await Temple.find().select('TempleName TempleImg _id State District Location Desc')
            .sort(sortOptions)
            .skip((page - 1) * per_page)
            .limit(Number(per_page));
        
        if (!temples || temples.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        const countsTemples = await Temple.countDocuments();

        let data = {
            countsTemples,
            temples
        }
   
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_all_temples', data , req.headers.lang);

    } catch (err) {

        console.log("err(getAllTemples)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.SearchAllTemples = async (req, res, next) => {

    try {

        const { page = 1, per_page = 10, sort, state, templename , district  , location} = req.query;

        const query = { };

        if (templename) {
            query.TempleName = templename
          }
          if (state) {
            query.State = state;
          }
          if (district) {
            query.District = district;
          }

          if(location){
            query.Location = location
          }
        
        const sortOptions = {};

        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }
        
        const temples = await Temple.find(query).select('TempleName TempleImg _id State District Location Desc')
            .sort(sortOptions)
            .skip((page - 1) * per_page)
            .limit(Number(per_page));
        
        if (!temples || temples.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_all_temples', temples , req.headers.lang);

    } catch (err) {

        console.log("err(SearchAllTemples)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}
