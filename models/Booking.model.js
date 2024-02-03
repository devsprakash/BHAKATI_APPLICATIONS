
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Define user schema
const bookingSchema = new Schema({

    date: {
        type: String
    },
    Slot: {
        type: Number
    },
    time: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    ref_no:{
        type:String
    },
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    },
    deleted_at: {
        type: String,
        default: null,
    },
});


//Output data to JSON
bookingSchema.methods.toJSON = function () {
    const booking = this;
    const bookingObject = booking.toObject();
    return bookingObject;
};



const Booking = mongoose.model('bookings', bookingSchema);
module.exports = Booking;