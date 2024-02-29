

const mongoose = require('mongoose');


const videoSchema = new mongoose.Schema({


    guruId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Guru'
    },
    description: {
        type: String
    },
    totalViews: {
        type: Number, default: 0
    },
    totalWatchingTime: {
        type: Number, default: 0
    },
    videoUrl:{
        type:String,
    },
    muxData: {
        mp4_support: String,
        master_access: String,
        encoding_tier: String,
        assetId: String,
        created_at: String
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
