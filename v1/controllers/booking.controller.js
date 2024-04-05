
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const Booking = require("../../models/Booking.model");
const Slot = require("../../models/slot.model");
const constants = require("../../config/constants");
const { createBookingSlots } = require("../services/booking.service")
const { checkAdmin } = require("../services/user.service")
const { isValid } = require("../../services/blackListMail");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const TempleGuru = require("../../models/guru.model");




exports.createdNewSlot = async (req, res) => {
    try {
        const reqBody = req.body;
        const templeId = req.Temple._id;
        
        // Assuming TempleGuru is a Mongoose model
        const findAdmin = await TempleGuru.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY) {
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.date = new Date();

        const newSlot = await Booking.create(reqBody);

        const data = {
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            slot_duration: newSlot.slot_duration,
            date: newSlot.date,
        };
 
        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.create_new_slot', data, req.headers.lang);

    } catch (err) {
        console.error("Error in createdNewSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};





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




