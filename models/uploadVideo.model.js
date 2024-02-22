

const mongoose = require('mongoose');


const videoSchema = new mongoose.Schema({

    filename: { 
        type: String
    },
    size: { 
        type: Number, required: true 
    },
    mimeType: { 
        type: String
    },
    uploadDate: { 
        type: String, default: Date.now 
    },
    muxAssetId: { 
        type: String, 
    }, 
    guruId: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'Guru' 
    },
    description: { 
        type: String 
    },
    tags: [
        { type: String }
    ],
    totalViews: { 
        type: Number, default: 0 
    },
    totalWatchingTime: { 
        type: Number, default: 0 
    },
    likes: { 
        type: Number, default: 0 
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]

});


const Video = mongoose.model('Videos', videoSchema);

module.exports = Video;
