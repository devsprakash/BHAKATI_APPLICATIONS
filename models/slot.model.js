

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Define user schema
const slotSchema = new Schema({

    start_time: {
        type: String
    },
    end_time: {
        type: String
    },
    slot_duration: {
        type: Number
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Guru',
        default: null
    },
    available: { type: Boolean, default: true },
    date: String,
    created_at: {
        type: String,
        default: null
    },
    updated_at: {
        type: String,
        default: null
    },
    deleted_at: {
        type: String,
        default: null,
    },
});


//Output data to JSON
slotSchema.methods.toJSON = function () {
    const slot = this;
    const slotObject = slot.toObject();
    return slotObject;
};



const Slot = mongoose.model('slots', slotSchema);
module.exports = Slot;