
const mongoose = require('mongoose');


const pujaSchema = new mongoose.Schema({

    category: [{
        type: String
    }],
    pujaImage: [{
        type: String
    }],
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
    StartTime: {
        type: String,
        default: null
    },
    EndTime: {
        type: String,
        default: null
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