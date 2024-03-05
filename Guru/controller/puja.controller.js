
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

        const file = req.files
        let pujaImageUrls = `${BASEURL}/uploads/${file.filename}`

        reqBody.pujaImage = pujaImageUrls;

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const newPuja = await Puja.create(reqBody);

        newPuja.duration = undefined;
        newPuja.price = undefined;
        newPuja.templeId = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'PUJA.add_new_puja', newPuja, req.headers.lang);

    } catch (err) {
        console.log('err(addNewPuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllPuja = async (req, res) => {

    try {

        const { page = 1, limit = 10, sortField = 'pujaName', sortOrder = 'asc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const pujas = await Puja.find().select('pujaImage pujaName description')
            .populate('templeId', 'TempleName TempleImg')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPujas = await Puja.countDocuments();

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



exports.ListOfPuja = async (req, res) => {

    try {

        const { page = 1, limit = 10, sortField = 'pujaName', sortOrder = 'asc', status, filter } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const filterCondition = status ? { status } : {};

        if (filter) {
            filterCondition["someField"] = filter;
        }

        const pujas = await Puja.find(filterCondition).select('pujaImage pujaName description duration price status')
            .populate('templeId', 'TempleName TempleImg')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPujas = await Puja.countDocuments(filterCondition);

        if (!pujas || pujas.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang);

        const data = {
            page: parseInt(page),
            total_pujas: totalPujas,
            pujas
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', data, req.headers.lang);

    } catch (err) {
        console.error('Error(ListOfPuja)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addPuja = async (req, res) => {

    try {

        const reqBody = req.body;

        const { pujaId } = req.params;

        const templeId = req.temple._id;
        console.log(templeId);

        const temple = await Temple.findOne({ _id: templeId });
        console.log(temple)

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);


        const updatedPuja = await Puja.findByIdAndUpdate(pujaId, {

            $set: {
                pujaName: reqBody.pujaName,
                duration: reqBody.duration,
                price: reqBody.price,
                updated_at: dateFormat.set_current_timestamp(),
            }

        }, { new: true });

        if (!updatedPuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'PUJA.not_found', {}, req.headers.lang);

        updatedPuja.description = undefined;
        updatedPuja.pujaImage = undefined;
        updatedPuja.templeId = undefined;
        updatedPuja.date = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.update_puja ', updatedPuja, req.headers.lang);

    } catch (err) {
        console.log('err(updatePuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}