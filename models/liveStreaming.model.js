const mongoose = require('mongoose');


const liveStreamSchema = new mongoose.Schema({

    pujaId: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'pujas' , default:null
    },
    startTime:{
        type:String
    },
    endTime:{
        type:String,
        default:null
    },
    status: { 
        type: String, enum: ['LIVE', 'END']
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temples'
    },
    ritualId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rituals',
        default:null
    },
    playBackId:{
        type:String
    },
    created_at:{
        type:String
    },
    updated_at:{
        type:String
    },
});

const LiveStream = mongoose.model('LiveStreams', liveStreamSchema);
module.exports = LiveStream;