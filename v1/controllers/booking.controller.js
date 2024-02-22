
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const Booking = require("../../models/Booking.model");
const constants = require("../../config/constants");
const { newBooking } = require("../services/booking.service")
const { isValid } = require("../../services/blackListMail");
const PDFDocument = require('pdfkit');
const fs = require('fs')
const blobStream = require('blob-stream');



exports.NewBookingSlot = async (req, res, next) => {

    try {

        const reqBody = req.body
        const userId = req.user._id;
        const checkMail = await isValid(reqBody.email)
        if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        reqBody.userId = userId;
        const randomDecimal = Math.random();
        const randomNumber = Math.floor(randomDecimal * 100000000);
        const formattedNumber = randomNumber.toString().padStart(8, '0');
        reqBody.ref_no = formattedNumber;
        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();

        const newSlotBooking = await newBooking(reqBody);

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.new_slot_booking', newSlotBooking, req.headers.lang);

    } catch (err) {

        console.log("err(NewBookingSlot)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllBookingSlot = async (req, res, next) => {

    try {

        const { page = 1, per_page = 10, sort } = req.query;
        const userId = req.user._id;

        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        const bookings = await Booking.find({ userId: userId }, { date: 1, StartTime: 1, EndTime: 1, _id: 1, Slot: 1, Name: 1 })
            .populate('templeId')
            .sort(sortOptions)
            .skip((page - 1) * per_page)
            .limit(Number(per_page));

        if (!bookings && bookings.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.not_found', {}, req.headers.lang)

        const totalBookings = await Booking.countDocuments({ userId: userId });

        let data = {
            page: Number(page),
            total_pages: Math.ceil(totalBookings / per_page),
            total_booking: totalBookings,
            bookings
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.get_all_booking', data, req.headers.lang);

    } catch (err) {

        console.log("err(getAllBookingSlot)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
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




