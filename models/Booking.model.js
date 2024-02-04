
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
    StartTime: {
        type: String
    },
    EndTime: {
        type: String
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temples'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    Name:{
        type:String
    },
    email:{
        type:String
    },
    mobile_number:{
        type:String
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