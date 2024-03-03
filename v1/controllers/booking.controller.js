
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
const { v4: uuid } = require('uuid')



exports.createdNewSlot = async (req, res, next) => {

    try {

        const reqBody = req.body
        const userId = req.user._id;
        const findAdmin = await checkAdmin(userId)

        if (findAdmin.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const NewSlots = await createBookingSlots(reqBody.startTime, reqBody.endTime, reqBody.slotsCount, reqBody.templeId, reqBody.slotDurationInMinutes);
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.slotNumber = reqBody.slotsCount;
        let slot = await Slot.create(reqBody);

        const updatedBookings = NewSlots.map(async (booking) => {
            booking.slotId = slot._id;
            await booking.save();
            return booking;
        });

        const updatedBookingsResult = await Promise.all(updatedBookings);

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.create_new_slot', updatedBookingsResult, req.headers.lang);

    } catch (err) {
        console.log("err(createdNewSlot)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.createNewBooking = async (req, res) => {

    try {

        const reqBody = req.body;
        const userId = req.user._id;

        const bookings = await Booking.find({ _id: reqBody.bookingId });

        if (!bookings && bookings.length <= 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.not_found', {}, req.headers.lang);

        for (const booking of bookings) {
            if (booking.available === false) {
                return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.already_booked_slot', booking, req.headers.lang);
            }
        }

        const updatedBookings = bookings.map(async (booking) => {

            booking.userId = userId;
            booking.available = false;
            booking.ref_no = uuid();
            booking.Name = reqBody.Name;
            booking.email = reqBody.email;
            booking.mobile_number = reqBody.mobile_number;
            booking.created_at = dateFormat.set_current_timestamp();
            booking.updated_at = dateFormat.set_current_timestamp();
            let slots = await Slot.findOne({ _id: booking.slotId });

            if (!slots)
                return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.slots_not_found', {}, req.headers.lang);

            slots.slotNumber--;
            await Promise.all([slots.save(), booking.save()]);

            return booking;
        });

        const updatedBookingsResult = await Promise.all(updatedBookings);

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_slot', updatedBookingsResult, req.headers.lang);

    } catch (err) {
        console.log("err(createNewBooking)....", err)
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




