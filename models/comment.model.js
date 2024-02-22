
const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({

    comment: {
        type: String
    },
    date: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Videos'
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})


const comment = mongoose.model('comments', commentSchema);
module.exports = comment;