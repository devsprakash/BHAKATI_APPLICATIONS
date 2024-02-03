
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const Booking = require("../../models/Booking.model");
const constants = require("../../config/constants");
const { newBooking} = require("../services/booking.service")



exports.NewBookingSlot = async (req, res, next) => {

    try {

        const reqBody = req.body
        const userId = req.user._id;
        reqBody.userId = userId
        const randomDecimal = Math.random();
        const randomNumber = Math.floor(randomDecimal * 100000000);
        const formattedNumber = randomNumber.toString().padStart(8, '0');
        reqBody.ref_no = formattedNumber;
        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();
       
        const newSlotBooking = await newBooking(reqBody);

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.new_slot_booking', newSlotBooking , req.headers.lang);

    } catch (err) {

        console.log("err(NewBookingSlot)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.getAllBookingSlot = async (req, res, next) => {

    try {

        const userId = req.user._id;
        const { page = 1, per_page = 10, sort } = req.query;

        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        const bookings = await Booking.find({userId: userId})
            .populate('userId' , 'full_name email mobile_number')
            .sort(sortOptions)
            .skip((page - 1) * per_page)
            .limit(Number(per_page));

        if (!bookings  && bookings.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.not_found', {}, req.headers.lang)

        const totalBookings = await Booking.countDocuments({userId:userId});

        let data = {
            page: Number(page),
            total_pages: Math.ceil(totalBookings / per_page),
            total_booking: totalBookings,
            bookings
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.get_all_booking', data , req.headers.lang);

    } catch (err) {

        console.log("err(getAllBookingSlot)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




