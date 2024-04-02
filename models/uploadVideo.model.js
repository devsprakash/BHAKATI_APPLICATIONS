

const mongoose = require('mongoose');


const videoSchema = new mongoose.Schema({

    guruId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Guru'
    },
    description: {
        type: String
    },
    title: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    muxData: {
        playback_id: String,
        mp4_support: String,
        master_access: String,
        encoding_tier: String,
        asset_id: String,
        created_at: String
    },
    views: {
        type: Number,
        default:null
    },
    duration:{
        type:Number,
        default:null
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
});


const Video = mongoose.model('Videos', videoSchema);

module.exports = Video;
