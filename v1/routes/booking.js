
const express = require('express');
const {  getAllBookingSlot, createdNewSlot, bookingSlotDownloaded, BookingPuja} = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const TempleAuth = require('../../middleware/guru.auth')


router.post('/createNewSlots' , TempleAuth , createdNewSlot)
router.post('/Bookingpuja' , authenticate , BookingPuja)
router.get('/getAllBookingSlot'   , getAllBookingSlot)
router.get('/bookingSlotDownload/:bookingId' , bookingSlotDownloaded)

module.exports = router;