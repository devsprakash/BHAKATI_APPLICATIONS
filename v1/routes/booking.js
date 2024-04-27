
const express = require('express');
const {createdNewSlot, bookingSlotDownloaded, updateSlot, bookedPuja ,temple_under_list_of_slots, bookedList, deleteSlot} = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const TempleAuth = require('../../middleware/guru.auth')


router.post('/createNewSlots' , TempleAuth , createdNewSlot)
router.get('/bookingSlotDownload/:bookingId' , bookingSlotDownloaded)
router.put('/updateSlot/:slotId' , TempleAuth , updateSlot);
router.put('/deleteSlot/:slotId' , TempleAuth , deleteSlot)
router.post('/bookedPuja' , authenticate , bookedPuja)
router.get('/temple_under_list_of_slots' , TempleAuth , temple_under_list_of_slots);
router.post('/bookedList' , bookedList)




module.exports = router;