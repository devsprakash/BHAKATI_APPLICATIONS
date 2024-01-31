const Booking = require("../../models/bookingSlot.model");


exports.newBooking = data => Booking(data).save();