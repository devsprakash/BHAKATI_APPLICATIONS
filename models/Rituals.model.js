

const mongoose = require('mongoose');


const pujaSchema = new mongoose.Schema({

    ritualName: {
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


const Rituals = mongoose.model('rituals', pujaSchema);
module.exports = Rituals;