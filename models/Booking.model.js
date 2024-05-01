
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Define user schema
const bookingSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    TemplepujaId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'templepujas',
        default: null
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Guru',
        default: null
    },
    pujaId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pujas',
        default: null
    },
    name: {
        type: String,
        default: null
    },
    date:String,
    email: {
        type: String,
        default: null
    },
    mobile_number: {
        type: String,
        default: null
    },
    available: { type: Boolean, default: false },
    start_time: { type: String, default: null },
    end_time: { type: String, default: null },
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
bookingSchema.methods.toJSON = function () {
    const booking = this;
    const bookingObject = booking.toObject();
    return bookingObject;
};



const Booking = mongoose.model('bookings', bookingSchema);
module.exports = Booking;