
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

        const reqBody = req.body
        const templeId = req.Temple._id;
        const findAdmin = await TempleGuru.findById(templeId)

        if (findAdmin.user_type !== constants.USER_TYPE.TEMPLEAUTHORITY)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const NewSlots = await createBookingSlots(reqBody.startTime, reqBody.endTime, reqBody.slotsCount, reqBody.slotDurationInMinutes);
        reqBody.slotNumber = reqBody.slotsCount;
        let slot = await Slot.create(reqBody);

        const updatedBookings = NewSlots.map(async (booking) => {
            booking.slotId = slot._id;
            booking.created_at = dateFormat.set_current_timestamp();
            booking.updated_at = dateFormat.set_current_timestamp();
            booking.date = new Date()
            booking.templeId = templeId
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



async function bookPujaSlots(pujaId, slotsCount, email, Name, mobile_number, userId) {

    const availableSlots = await Booking.find().limit(slotsCount);

    if (availableSlots.length < slotsCount) {
        throw new Error('Not enough available slots for this puja.');
    }

    const bookedSlots = [];
    for (let i = 0; i < slotsCount; i++) {
        const slot = availableSlots[i];
        slot.slotKey = pujaId;
        slot.available = false;
        slot.email = email
        slot.mobile_number = mobile_number,
        slot.Name = Name,
        slot.userId = userId,
        slot.available = false,
        await slot.save();
        bookedSlots.push(slot);
    }

    console.log(`${slotsCount} puja slots booked for Puja ID: ${pujaId}.`);
    return bookedSlots;
}



exports.BookingPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const userId = req.user._id;
        const { pujaId, slotsCount, email, Name, mobile_number } = reqBody;

        let bookings = await bookPujaSlots(pujaId, slotsCount, email, Name, mobile_number, userId);

        let slots = bookings.map((bookings) => bookings.slotId);

        const slotData = await Slot.find({ _id: { $in: slots } });

        await Promise.all(slotData.map(async slot => {
            slot.slotNumber -= slotsCount; 
            await slot.save();
        }));

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_slot', bookings, req.headers.lang);

    } catch (err) {
        console.log("err(BookingPuja)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllBookingSlot = async (req, res, next) => {

    try {

        const { sort, date } = req.query;

        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        let query = Booking.find();

        if (date) {

            const formattedDate = new Date(date).toISOString().split('T')[0];
            query = query.where('date').gte(formattedDate).lt(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1));
        }

        const bookings = await query.sort(sortOptions);

        if (!bookings || bookings.length === 0) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.not_found', {}, req.headers.lang);
        }

        const totalBookings = await Booking.countDocuments(query);

        let data = {
            total_booking: totalBookings,
            bookings
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.get_all_booking', data, req.headers.lang);
    } catch (err) {
        console.log("err(getAllBookingSlot)....", err);
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




