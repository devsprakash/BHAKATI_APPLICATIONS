
const mongoose = require('mongoose');


const pujaSchema = new mongoose.Schema({

    pujaImage: {
        type: String
    },
    pujaName:{
        type:String,
        default:null
    },
    description: {
        type: String
    },
    date: {
        type: String
    },
    duration: {
        type: String,
        default: null
    },
    price:{
        type:Number,
        default:null
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temples'
    },
    status: {
        type: String,
        enum: ['upcoming', 'in_progress', 'completed'],
        default: 'upcoming'
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})


const Puja = mongoose.model('pujas', pujaSchema);
module.exports = Puja;