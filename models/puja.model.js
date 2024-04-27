
const mongoose = require('mongoose');


const pujaSchema = new mongoose.Schema({

    puja_image: {
        type: String
    },
    puja_name: {
        type: String,
        default: null
    },
    description: {
        type: String
    },
    date: {
        type: String
    },
    category: {
        type: String
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