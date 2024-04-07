
const { sendResponse } = require('../../services/common.service')
const constants = require("../../config/constants");
const dateFormat = require('../../helper/dateformat.helper');
const TempleGuru = require('../../models/guru.model');
const Rituals = require('../../models/Rituals.model')






exports.addNewRithuals = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.Temple._id;

        const temples = await TempleGuru.findOne({ _id: templeId })

        if (!temples || (temples.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.templeId = templeId;

        const newRithuals = await Rituals.create(reqBody)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'PUJA.add_new_rithuals', newRithuals, req.headers.lang);

    } catch (err) {
        console.log('err(addNewRithuals).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllRithuals = async (req, res) => {

    try {

        const { page = 1, limit = 10, sortField = 'rithualName', sortOrder = 'asc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const rithuals = await Rituals.find()
            .populate('templeId', 'TempleName TempleImg Location')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalRithuals = await Rituals.countDocuments();

        if (!rithuals || rithuals.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', [], req.headers.lang);

        const data = {
            page: parseInt(page),
            total_rithuals: totalRithuals,
            rithuals
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_rithuals', data, req.headers.lang);
    } catch (err) {
        console.error('Error(getAllRithuals)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getRithualsByTemples = async (req, res) => {

    try {

        const { templeId } = req.body;

        const { page = 1, limit = 10, sortField = 'rithualName', sortOrder = 'asc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const rithuals = await Rituals.find({ templeId: templeId })
            .populate('templeId', 'TempleName TempleImg Location')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalRithuals = await Rituals.countDocuments({ templeId: templeId });

        if (!rithuals || rithuals.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', [], req.headers.lang);

        const data = {
            page: parseInt(page),
            total_rithuals: totalRithuals,
            rithuals
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_rithuals', data, req.headers.lang);


    } catch (err) {
        console.error('Error(getRithualsByTemples)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};