
const mongoose = require('mongoose');


const TemplePujaSchema = new mongoose.Schema({

    puja_name: {
        type: String,
        default: null
    },
    duration: {
        type: Number,
        default: null
    },
    price: {
        type: Number,
        default: null
    },
    date: {
        type: String
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temple',
        default: null
    },
    pujaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pujas',
        default: null
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})


const TemplePuja = mongoose.model('templepujas', TemplePujaSchema);
module.exports = TemplePuja;