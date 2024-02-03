const Booking = require("../../models/Booking.model");


exports.newBooking = data => Booking(data).save();