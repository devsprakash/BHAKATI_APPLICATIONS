
const mongoose = require('mongoose');


const SlotSchema = new mongoose.Schema({
    slotNumber: Number,
    created_at:String,
    updated_at:String
})


const Slot = mongoose.model('slots' , SlotSchema);
module.exports = Slot