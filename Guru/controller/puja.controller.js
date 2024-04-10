
const { sendResponse } = require('../../services/common.service')
const Puja = require('../../models/puja.model');
const { BASEURL } = require('../../keys/development.keys')
const constants = require("../../config/constants");
const { checkAdmin } = require('../../v1/services/user.service')
const dateFormat = require('../../helper/dateformat.helper');
const TempleGuru = require('../../models/guru.model');
const User = require('../../models/user.model')




exports.addNewPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const userId = req.user._id;

        const users = await User.findOne({ _id: userId })

        if (!users || (users.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const file = req.files
        let pujaImageUrls = `${BASEURL}/uploads/${file[0].filename}`

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

        const pujas = await Puja.find().select('pujaImage pujaName description category status _id')
            .populate('templeId', 'TempleName TempleImg')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPujas = await Puja.countDocuments();

        if (!pujas || pujas.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', [], req.headers.lang);

        const responseData = pujas.map(data => ({
            total_pujas: totalPujas,
            puja_name: data.pujaName,
            puja_image_url: data.pujaImage,
            description: data.description,
            category: data.category,
            status: data.status,
            puja_id: data._id
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', responseData, req.headers.lang);

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

        const pujas = await Puja.find(filterCondition).select('pujaImage pujaName description duration price status category')
            .populate('templeId', 'temple_name temple_image _id')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));


        const totalPujas = await Puja.countDocuments(filterCondition);

        const responseData = pujas.map(puja => ({
            total_pujas: totalPujas,
            puja_id: puja._id,
            puja_name: puja.pujaName,
            puja_image_url: puja.pujaImage,
            duration: puja.duration,
            cost: puja.price,
            description: puja.description,
            temple_name: puja.templeId.temple_name,
            temple_image_url: puja.templeId.temple_image,
            category: puja.category,
            status: puja.status,
            temple_id: puja.templeId._id

        })) || [];

        console.log(responseData)

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(ListOfPuja)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const { pujaId } = req.params;
        const templeId = req.Temple._id;
        const temple = await TempleGuru.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const updatedPuja = await Puja.findByIdAndUpdate(pujaId, {

            $set: {
                pujaName: reqBody.pujaName,
                duration: reqBody.duration,
                price: reqBody.price,
                templeId: templeId,
                updated_at: dateFormat.set_current_timestamp(),
            }
        }, { new: true });

        if (!updatedPuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        updatedPuja.description = undefined;
        updatedPuja.pujaImage = undefined;
        updatedPuja.templeId = undefined;
        updatedPuja.date = undefined;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.update_puja ', updatedPuja, req.headers.lang);

    } catch (err) {
        console.log('err(addPuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.pujs_by_temple = async (req, res) => {

    try {

        const { limit, templeId } = req.query;
        const templeData = await TempleGuru.findById(templeId);

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        const pujsList = await Puja.find({ templeId: templeId }).sort({ created_at: -1 }).limit(parseInt(limit));

        if (!pujsList || pujsList.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        const responseData = {
            temple_name: templeData.temple_name,
            temple_id: templeData._id,
            puja: pujsList.map(puja => ({
                puja_id: puja._id,
                puja_name: puja.pujaName,
                puja_image_url: puja.pujaImage,
                duration: puja.duration,
                cost: puja.price,
                category: puja.category,
                status: puja.status
            }))
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.temple_under_pujaList', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(pujs_by_temple).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.deletePuja = async (req, res) => {

    try {

        const { pujaId, templeId } = req.params

        const temples = await TempleGuru.findOne({ _id: templeId })

        if (!temples || (temples.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY && temples.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const newpuja = await Puja.findOneAndDelete({ _id: pujaId })

        if (!newpuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.delete_puja', newpuja, req.headers.lang);

    } catch (err) {
        console.log('err(deletePuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}