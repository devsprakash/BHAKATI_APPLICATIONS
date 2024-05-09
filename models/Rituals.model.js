
const mongoose = require('mongoose');


const ritualSchema = new mongoose.Schema({

    ritual_name: {
        type: String
    },
    start_time: {
        type: String
    },
    end_time: {
        type: String
    },
    templeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'temple'
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