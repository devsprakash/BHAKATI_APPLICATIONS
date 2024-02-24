
const mongoose = require('mongoose');


const ritualSchema = new mongoose.Schema({

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
    templeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'temples'
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})



const Rituals = mongoose.model('rituals', ritualSchema);
module.exports = Rituals;