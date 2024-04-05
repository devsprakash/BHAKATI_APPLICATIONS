
const express = require('express');
const {createdNewSlot, bookingSlotDownloaded} = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const TempleAuth = require('../../middleware/guru.auth')


router.post('/createNewSlots' , TempleAuth , createdNewSlot)
router.get('/bookingSlotDownload/:bookingId' , bookingSlotDownloaded)



module.exports = router;