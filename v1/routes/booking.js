
const express = require('express');
const { createdNewSlot, bookingSlotDownloaded, updateSlot, bookedPuja, temple_under_list_of_slots, bookedList, deleteSlot, getAllTheSlots } = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const TempleAuth = require('../../middleware/guru.auth');
const { create_new_slot_validator, ValidatorResult, update_slot_validator, delete_slot_validator } = require('../../validation/booking.validator')




router.post('/createNewSlots', create_new_slot_validator, ValidatorResult, TempleAuth, createdNewSlot)
router.get('/bookingSlotDownload/:bookingId', bookingSlotDownloaded);
router.get('/getAlltheSlots', TempleAuth, getAllTheSlots)
router.put('/updateSlot/:slotId', update_slot_validator, ValidatorResult, TempleAuth, updateSlot);
router.delete('/deleteSlot/:slotId', delete_slot_validator, ValidatorResult, TempleAuth, deleteSlot)
router.post('/bookedPuja', authenticate, bookedPuja)
router.get('/temple_under_list_of_slots', TempleAuth, temple_under_list_of_slots);
router.post('/bookedList', bookedList)




module.exports = router;