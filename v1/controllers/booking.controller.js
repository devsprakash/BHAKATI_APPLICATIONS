
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const Temple = require("../../models/temple.model");
const moment = require("moment");
const User = require("../../models/user.model");
const Booking = require("../../models/Booking.model");
const Puja = require("../../models/puja.model");
const Slot = require("../../models/slot.model");
const TemplePuja = require("../../models/temple.puja.model");
const { timeToMinutes , convertTo24Hour , convertTo24HourFormat , generateTimeSlots , convertTo12Hour } = require('../services/booking.service')





exports.createdNewSlot = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.temple._id;
        console.log("data..." , templeId)

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

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




exports.getAllTheSlots = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { limit } = req.query;

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const slotList = await Slot.find({ templeId: templeId }).limit(parseInt(limit)).sort()

        const responseData = slotList.map(data => ({
            temple_id: data.templeId._id,
            temple_name: data.templeId.temple_name,
            temple_image_url: data.templeId.temple_image,
            slot_id: data._id,
            start_time: data.start_time,
            end_time: data.end_time,
            slot_duration: data.slot_duration,
            date: data.date,
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.get_all_the_slot', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in getAllTheSlots:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateSlot = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.temple._id;
        const { slotId } = req.params;

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
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




exports.deleteSlot = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { slotId } = req.params;

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const newSlot = await Slot.findByIdAndDelete(
            { _id: slotId },
        );

        const slotData = {
            slot_id: newSlot._id,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            slot_duration: newSlot.slot_duration,
            date: newSlot.date,
            temple_id: templeId
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.delete_slots', slotData, req.headers.lang);

    } catch (err) {
        console.error("Error in deleteSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.TempleUnderAllTheBookings = async (req, res) => {

    try {

        const templeId = req.temple._id
        const { limit } = req.query;

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookings = await Booking.find({ templeId: templeId })
            .sort()
            .limit(parseInt(limit));

        const responseData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: data.created_at,
                date: data.date,
                user_name: data.userId.full_name,
                user_email: data.userId.email,
                user_mobile_number: data.userId.mobile_number,
                user_id: data.userId._id,
                temple_name: data.templeId.temple_name,
                temple_id: data.templeId._id,
                puja_id: data.TemplepujaId.pujaId,
                temple_puja_id: data.TemplepujaId._id,
                puja_name: data.TemplepujaId.puja_name,
                puja_price: data.TemplepujaId.price,
                duration: data.TemplepujaId.duration
            };
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.temple_under_booking_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in TempleUnderAllTheBookings:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}




exports.bookedPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const { temple_id, start_time, end_time, date, email, name, mobile_number, temple_puja_id, slot_id } = reqBody;
        const userId = req.user._id;

        const findAdmin = await User.findById(userId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const pujaData = await TemplePuja.findOne({ _id: temple_puja_id, templeId: temple_id })
            .populate('templeId', "_id temple_name temple_image")

        if (!pujaData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        const slotData = await Slot.findOneAndUpdate({ _id: slot_id, templeId: temple_id });

        if (!slotData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.slots_not_found', {}, req.headers.lang);

        if (slotData.available === false)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.all_the_slots_booked', {}, req.headers.lang);

        // Convert start and end times to minutes
        const startMinutes = timeToMinutes(start_time);
        const endMinutes = timeToMinutes(end_time);

        // Calculate the duration in minutes
        const duration = endMinutes - startMinutes;
            reqBody.templeId = temple_id,
            reqBody.TemplepujaId = temple_puja_id,
            reqBody.userId = userId,
            reqBody.slotId = slot_id,
            reqBody.email = email,
            reqBody.mobile_number = mobile_number,
            reqBody.name = name;
        reqBody.start_time = start_time,
            reqBody.is_reserved = true;
        reqBody.end_time = end_time,
            reqBody.date = moment(date).format('DD/MM/YYYY');
        reqBody.created_at = dateFormat.set_current_timestamp()
        reqBody.updated_at = dateFormat.set_current_timestamp()

        const bookings = await Booking.create(reqBody)

        const responseData = {
            booking_id: bookings._id,
            puja_id: pujaData._id,
            puja_name: pujaData.pujaName,
            temple_puja_id: bookings.TemplepujaId,
            duration: pujaData.duration,
            price: pujaData.price,
            status: pujaData.status,
            description: pujaData.description,
            date: pujaData.date,
            puja_image: pujaData.image,
            temple_id: pujaData.templeId._id,
            temple_name: pujaData.templeId.temple_name,
            temple_image_url: pujaData.templeId.temple_image,
            email: bookings.email,
            mobile_number: bookings.mobile_number,
            name: bookings.name,
            start_time: bookings.start_time,
            end_time: bookings.end_time,
            date: bookings.date,
            is_reserved: bookings.is_reserved,
            total_booking_duration: duration,
            user_id: userId,
            slot_id: slot_id,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.update_slots', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in bookedPuja", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.bookedList = async (req, res) => {

    try {

        const userId = req.user._id;
        const { limit, temple_id, date } = req.query;

        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookings = await Booking.find({ userId: userId }).populate('userId')
            .sort()
            .limit(parseInt(limit));

        const templeData = await TemplePuja.find({ templeId: temple_id, date: date })
            .populate('templeId', "temple_name _id temple_image")
            .select('templeId puja_name duration price _id pujaId date');

        const responseData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: data.created_at,
                date: data.date,
                user_name: data.userId.full_name,
                user_email: data.userId.email,
                user_mobile_number: data.userId.mobile_number,
                user_id: data.userId._id,
                templeData: templeData.map(data => ({
                    temple_name: data.templeId.temple_name,
                    temple_id: data.templeId._id,
                    temple_image_url: data.templeId.templeId,
                    puja_name: data.puja_name,
                    duration: data.duration,
                    price: data.price,
                    date: data.date,
                    temple_puja_id: data._id,
                    master_puja_id: data.pujaId
                })) || []
            };
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booked_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in bookedList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.userBookingList = async (req, res) => {

    try {

        const userId = req.user._id;
        const { limit } = req.query;

        const user = await User.findById(userId);
        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookings = await Booking.find({ userId: userId }).populate("userId").sort().limit(parseInt(limit));

        const responseData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: data.created_at,
                date: data.date,
                user_name: data.userId.full_name,
                user_email: data.userId.email,
                user_mobile_number: data.userId.mobile_number,
                user_id: data.userId._id
            };

        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booked_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in bookingList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}




exports.bookingSlotDownloaded = async (req, res) => {

    try {

        const { booking_id } = req.params;

        const userId = req.user._id
        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const booking = await Booking.findOne({ _id: booking_id }).populate('templeId')

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
            .text(`Full Name: ${booking.name}`, { bold: true })
            .text(`Email: ${booking.email}`, { bold: true })
            .text(`Mobile Number: ${booking.mobile_number}`, { bold: true })
            .text(`Temple Name: ${booking.templeId.temple_name}`, { bold: true })
            .text(`Temple Location: ${booking.templeId.location}`, { bold: true })
            .text(`Temple District: ${booking.templeId.district}`, { bold: true })
            .text(`Temple State: ${booking.templeId.state}`, { bold: true })
            .text(`Date: ${booking.date}`, { bold: true })
            .text(`Slot: ${booking.Slot}`, { bold: true })
            .text(`Start Time: ${booking.start_time}`, { bold: true })
            .text(`End Time: ${booking.end_time}`, { bold: true })
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




exports.getSlotsWithBookedData = async (req, res) => {

    try {

        const reqBody = req.body;
        const userId = req.user._id;
        const { templeId, date, temple_puja_id } = reqBody; 

        const findAdmin = await User.findById(userId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookingDate = moment(date, "DD/MM/YYYY").format("MM/DD/YYYY");

        const bookings = await Booking.find({ templeId: templeId, date: bookingDate }).populate('templeId').sort();
        console.log("data..." , bookings)

        const slotData = await Slot.findOne({ templeId: templeId, date: bookingDate  }).populate("templeId");
        console.log("data1...." , slotData)

        if (!slotData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.slots_not_found', {}, req.headers.lang);
        
        const pujaData = await TemplePuja.findOne({ _id: temple_puja_id, templeId: templeId })
            .populate('templeId', "_id temple_name temple_image")

        if (!pujaData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        const bookingData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                date: data.date,
                temple_name: data.templeId.temple_name,
                temple_id: data.templeId._id,
                puja_id: data.TemplepujaId.pujaId,
                temple_puja_id: data.TemplepujaId._id,
                duration: data.TemplepujaId.duration
            };
        })) || [];

        /*const slotData = slotList.map(data => ({
            temple_id: data.templeId._id,
            temple_name: data.templeId.temple_name,
            temple_image_url: data.templeId.temple_image,
            slot_id: data._id,
            start_time: data.start_time,
            end_time: data.end_time,
            slot_duration: data.slot_duration,
            date: data.date
        })) || [];*/

        
        const startTime24 = convertTo24Hour(slotData.start_time); 
        const endTime24 =convertTo24Hour(slotData.end_time);
        const slotDuration = slotData.slot_duration;
        const pujaDuration = pujaData.duration;
        //const slotsWithBookingData = generateTimeSlots(startTime24, endTime24, slotDuration, pujaDuration, bookingData);
        const slotsWithBookingData = generateTimeSlots(startTime24, endTime24, pujaDuration, bookingData, bookingDate);
        const responseData = {
            temple_id : templeId,
            slot_id : slotData._id,
            slots: slotsWithBookingData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.get_all_the_slot', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in getAllTheSlots:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};







