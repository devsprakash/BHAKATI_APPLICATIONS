

const { sendResponse } = require('../../services/common.service')
const Puja = require('../../models/puja.model');
const { BASEURL } = require('../../keys/development.keys')
const constants = require("../../config/constants");
const { checkAdmin } = require('../../v1/services/user.service')
const dateFormat = require('../../helper/dateformat.helper');
const Temple = require('../../models/Temple.model');




exports.addNewPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.temple._id;

        const temple = await Temple.findOne({ _id: templeId })
        console.log("temples", temple)

        if (!temple || (temple.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const newPuja = await Puja.create(reqBody)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'PUJA.add_new_puja', newPuja, req.headers.lang);

    } catch (err) {
        console.log('err(addNewPuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


// this api access only admin and integrate this api in the admin panel
exports.getAllPuja = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const pujas = await Puja.find()
            .skip(skip)
            .limit(limit)


        if (!pujas && pujas.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang)

        const totalpujas = await Puja.countDocuments();

        let data = {
            page: Number(page),
            total_pujas: totalpujas,
            pujas
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', data, req.headers.lang)

    } catch (err) {
        console.log('err(getAllPuja)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



// this api access only admin and integrate this api in the admin panel
exports.getAllUpcomingorLivePuja = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status


        const pujas = await Puja.find({ status })
            .skip(skip)
            .limit(limit)


        if (!pujas && pujas.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang)

        const totalpujas = await Puja.countDocuments({ status });

        let data = {
            page: Number(page),
            total_pujas: totalpujas,
            pujas
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', data, req.headers.lang)

    } catch (err) {
        console.log('err(getAllUpcomingorLivePuja)...', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.updatePuja = async (req, res) => {

    try {

        const reqBody = req.body;

        const { pujaId } = req.params;
        
        const templeId = req.temple._id;
      
        const temple = await Temple.findOne({ _id: templeId })

        if (!temple || (temple.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const updatedPuja = await Puja.findOneAndUpdate({ _id: pujaId }, reqBody, { new: true })

        if (!updatedPuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang)

        updatedPuja.updated_at = dateFormat.set_current_timestamp();
        await updatedPuja.save();

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.update_puja ', updatedPuja, req.headers.lang);

    } catch (err) {
        console.log('err(updatePuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}