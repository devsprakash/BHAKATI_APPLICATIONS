

const { sendResponse } = require('../../services/common.service')
const Puja = require('../../models/puja.model');
const { BASEURL } = require('../../keys/development.keys')
const constants = require("../../config/constants");
const { checkAdmin } = require('../../v1/services/user.service')
const dateFormat = require('../../helper/dateformat.helper');
const Temple = require('../../models/Temple.model');
const User = require('../../models/user.model')



exports.addNewPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const userId = req.user._id;

        const users = await User.findOne({ _id: userId })

        if (!users || (users.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const pujaImagesPromises = req.files.map(file => `${BASEURL}/${file.filename}`);
        const pujaImageUrls = await Promise.all(pujaImagesPromises);

        reqBody.pujaImage = pujaImageUrls;
        reqBody.category = [reqBody.category];

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const newPuja = await Puja.create(reqBody)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'PUJA.add_new_puja', newPuja, req.headers.lang);

    } catch (err) {
        console.log('err(addNewPuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllPuja = async (req, res) => {

    try {

        const { page = 1, limit = 10, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'Invalid page or limit values.', {}, req.headers.lang);
        }

        const pujas = await Puja.find({ status })
            .populate('templeId')
            .skip(skip)
            .limit(parseInt(limit));

        const totalPujas = await Puja.countDocuments({ status });

        if (!pujas || pujas.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang);

        const data = {
            page: parseInt(page),
            total_pujas: totalPujas,
            pujas
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', data, req.headers.lang);
    } catch (err) {
        console.error('Error(getAllPuja)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.updatePuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const { pujaId } = req.params;
        const templeId = req.temple._id;
        const temple = await Temple.findOne({ _id: templeId })
        if (!temple || (temple.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const updatedPuja = await Puja.findByIdAndUpdate(pujaId, {

            $set: {
                pujaName: reqBody.pujaName,
                StartTime: reqBody.StartTime,
                EndTime: reqBody.EndTime,
                description: reqBody.description,
                date: reqBody.date,
                updated_at: dateFormat.set_current_timestamp(),
            }

        }, { new: true });

        if (!updatedPuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang)

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.update_puja ', updatedPuja, req.headers.lang);

    } catch (err) {
        console.log('err(updatePuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}