
const express = require('express');
const { NewBookingSlot , getAllBookingSlot, getAllTemples} = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate')

router.post('/newSlotBooking' , authenticate , NewBookingSlot)
router.get('/getAllBookingSlot' , authenticate  , getAllBookingSlot)


module.exports = router;