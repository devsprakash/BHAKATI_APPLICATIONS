
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Define user schema
const bookingSchema = new Schema({

    StartTime: {
        type: String
    },
    EndTime: {
        type: String
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guru'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default:null
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'slots',
        default:null
    },
    ritualId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rituals',
        default: null
    },
    pujaId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'pujas', 
        default: null
    },
    Name:{
        type:String,
        default:null
    },
    email:{
        type:String,
        default:null
    },
    mobile_number:{
        type:String,
        default:null
    },
    ref_no:{
        type:String,
        default:null
    },
    available: { type: Boolean, default:true },
    created_at: {
        type: String,
        default:null
    },
    updated_at: {
        type: String,
        default:null
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