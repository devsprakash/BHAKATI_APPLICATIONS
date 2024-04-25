
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const TempleGuru = require("../../models/guru.model");
const moment = require("moment");
const User = require("../../models/user.model");
const Booking = require("../../models/Booking.model");
const Puja = require("../../models/puja.model");
const Slot = require("../../models/slot.model");





exports.createdNewSlot = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.Temple._id;

        const findAdmin = await TempleGuru.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY) {
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.templeId = templeId;
        reqBody.slot_duration = reqBody.slot_duration;
        reqBody.date = moment(reqBody.date).format("DD/MM/YYYY");
        const newSlot = await Slot.create(reqBody);
        const slotData = {
            slot_id: newSlot._id,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            slot_duration: newSlot.slot_duration,
            date: newSlot.date,
            temple_id: templeId
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.create_new_slot', slotData, req.headers.lang);

    } catch (err) {
        console.error("Error in createdNewSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateSlot = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.Temple._id;
        const { slotId } = req.params;

        const findAdmin = await TempleGuru.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const updated_at = dateFormat.set_current_timestamp();

        const newSlot = await Slot.findByIdAndUpdate(
            { _id: slotId },
            {
                ...reqBody,
                updated_at
            },
            { new: true }
        );

        const slotData = {
            slot_id: newSlot._id,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            slot_duration: newSlot.slot_duration,
            date: newSlot.date,
            temple_id: templeId
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.update_slots', slotData, req.headers.lang);

    } catch (err) {
        console.error("Error in updateSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.temple_under_list_of_slots = async (req, res) => {

    try {

        const templeId = req.Temple._id;

        const findAdmin = await TempleGuru.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const slotData = await Slot.find({ templeId: templeId });

        const responseData = slotData.map(data => ({
            slot_duration: data.slot_duration,
            start_time: data.start_time,
            end_time: data.end_time,
            date: data.date,
            slot_id: data._id,
            temple_id: data.templeId
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.update_slots', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in temple_under_list_of_slots :", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.bookedPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const { temple_id, start_time, end_time, date, email, name, mobile_number, puja_id } = reqBody;
        const userId = req.user._id;

        const findAdmin = await User.findById(userId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.USER) {
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        const pujaData = await Puja.findOne({ _id: puja_id, templeId: temple_id });

        if (!pujaData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        const templeData = await TempleGuru.findOne({ _id: temple_id });

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', {}, req.headers.lang);

        reqBody.templeId = temple_id,
            reqBody.pujaId = puja_id,
            reqBody.userId = userId,
            reqBody.email = email,
            reqBody.mobile_number = mobile_number,
            reqBody.name = name;
        reqBody.start_time = start_time,
            reqBody.end_time = end_time,
            reqBody.date = moment(date).format('DD/MM/YYYY');
        reqBody.created_at = dateFormat.set_current_timestamp()
        reqBody.updated_at = dateFormat.set_current_timestamp()

        const bookings = await Booking.create(reqBody)

        const responseData = {
            puja_id: pujaData._id,
            puja_name: pujaData.pujaName,
            duration: pujaData.duration,
            price: pujaData.price,
            status: pujaData.status,
            description: pujaData.description,
            date: pujaData.date,
            puja_image: pujaData.image,
            temple_id: templeData._id,
            temple_name: templeData.temple_name,
            temple_image_url: templeData.temple_image_url,
            feature_image_url: templeData.background_image,
            description: templeData.description,
            location: templeData.location,
            state: templeData.state,
            district: templeData.district,
            category: templeData.category,
            email: bookings.email,
            mobile_number: bookings.mobile_number,
            name: bookings.name,
            start_time: bookings.start_time,
            end_time: bookings.end_time,
            date: bookings.date
        } || {}


        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.update_slots', responseData, req.headers.lang);


    } catch (err) {
        console.error("Error in updateSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.bookedList = async (req, res) => {

    try {

        const { temple_id, puja_id, date } = req.body;

        const bookedListData = await Booking.find({ templeId: temple_id, pujaId: puja_id });

        const slotData = await Slot.findOne({ templeId: temple_id, date: moment(date).format('DD/MM/YYYY') });

        const pujaData = await Puja.findOne({ _id: puja_id, templeId: temple_id })

        if (!pujaData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        let data = {
            start_time: slotData.start_time,
            end_time: slotData.end_time,
            slot_duration: slotData.slot_duration,
            puja_name: pujaData.pujaName,
            puja_id: pujaData._id,
            puja_price: pujaData.price,
            puja_duration: pujaData.duration,
            booked_times: bookedListData.map(data => ({
                start_time: data.start_time,
                end_time: data.end_time
            })) || []

        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booked_list', data, req.headers.lang);

    } catch (err) {
        console.error("Error in bookedList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.bookingSlotDownloaded = async (req, res) => {

    try {

        const { bookingId } = req.params;

        const booking = await Booking.findOne({ _id: bookingId }).populate('templeId')

        if (!booking)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.not_found', {}, req.headers.lang)


        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('booking.pdf'));

        doc.font('Helvetica-Bold')
            .fontSize(14)
            .text('Booking Details', { align: 'center' })
            .moveDown();

        doc.image('OIP.jpeg', {
            fit: [70, 70],
            align: 'center',
            valign: 'top'
        })
            .moveDown();

        doc.font('Helvetica')
            .fontSize(12)
            .text(`Full Name: ${booking.Name}`, { bold: true })
            .text(`Email: ${booking.email}`, { bold: true })
            .text(`Mobile Number: ${booking.mobile_number}`, { bold: true })
            .text(`Temple Name: ${booking.templeId.TempleName}`, { bold: true })
            .text(`Temple Location: ${booking.templeId.Location}`, { bold: true })
            .text(`Temple District: ${booking.templeId.District}`, { bold: true })
            .text(`Temple State: ${booking.templeId.State}`, { bold: true })
            .text(`Date: ${booking.date}`, { bold: true })
            .text(`Slot: ${booking.Slot}`, { bold: true })
            .text(`Start Time: ${booking.StartTime}`, { bold: true })
            .text(`End Time: ${booking.EndTime}`, { bold: true })
            .text(`Reference Number: ${booking.ref_no}`, { bold: true })
            .text(`Created At: ${booking.created_at}`, { bold: true })
            .moveDown();

        doc.end();

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_downlod', {}, req.headers.lang);

    } catch (err) {

        console.log("err(BookingDownloaded)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




