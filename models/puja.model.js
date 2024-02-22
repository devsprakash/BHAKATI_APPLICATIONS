
const mongoose = require('mongoose');


const pujaSchema = new mongoose.Schema({

    pujaName: {
        type: String
    },
    pujaImage: {
        type: String
    },
    description: {
        type: String
    },
    date: {
        type: String
    },
    StartTime: {
        type: String
    },
    EndTime: {
        type: String
    },
    tag: {
        type: String
    },
    status: {
        type: String,
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