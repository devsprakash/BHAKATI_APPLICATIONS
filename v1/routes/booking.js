
const express = require('express');
const { NewBookingSlot , getAllBookingSlot, BookingDownloaded, bookingSlotDownloaded} = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate')


router.post('/newSlotBooking' , authenticate , NewBookingSlot)
router.get('/getAllBookingSlot' , authenticate  , getAllBookingSlot)
router.get('/bookingSlotDownload/:bookingId' , bookingSlotDownloaded)

module.exports = router;