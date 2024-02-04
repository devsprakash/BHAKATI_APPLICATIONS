
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const Booking = require("../../models/Booking.model");
const constants = require("../../config/constants");
const { newBooking } = require("../services/booking.service")
const { isValid } = require("../../services/blackListMail");
const fs = require('fs')
const path = require('path')


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

        const bookings = await Booking.find({ userId: userId }, { date: 1, StartTime: 1, EndTime: 1, _id: 1, Slot: 1 , Name:1 })
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



exports.bookingSlotDownloaded = async (req , res) => {

   try {

    const { bookingId } = req.params;
    console.log(bookingId)

        const booking = {
            "_id": {
              "$oid": "65bef6022c7024536c50553c"
            },
            "deleted_at": null,
            "date": "2024-02-14",
            "Slot": 1,
            "StartTime": "09:00 AM",
            "EndTime": "10:30 AM",
            "templeId": {
              "$oid": "65bc50bfcc899f2df475a95b"
            },
            "Name": "prakash",
            "email": "prakash123@gmail.com",
            "mobile_number": "6371704662",
            "userId": {
              "$oid": "65bef5095349231d28d97e81"
            },
            "ref_no": "31551687",
            "created_at": "02/04/2024 07:02:72",
            "updated_at": "02/04/2024 07:02:72",
            "__v": 0
          }

        if (!booking)
        return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.not_found', {}, req.headers.lang)

        const jsonData = JSON.stringify(booking);
        console.log(jsonData)

        const filePath = path.join(__dirname, 'download', `booking_${bookingId}.json`);

        fs.writeFileSync(filePath, jsonData);

        // Set the response headers for downloading the file
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=booking_${bookingId}.json`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('end', () => {
            fs.unlinkSync(filePath);
        });

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_downlod', {} , req.headers.lang);

    } catch (err) {

        console.log("err(BookingDownloaded)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }

}




