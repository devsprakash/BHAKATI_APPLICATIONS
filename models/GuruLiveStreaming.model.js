

const mongoose = require('mongoose')


const LiveStreamSchema = new mongoose.Schema({

    guruId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guru',
        default: null
    },
    title: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    stream_key: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: null
    },
    reconnect_window: {
        type: String,
        default: null
    },
    max_continuous_duration: {
        type: String,
        default: null
    },
    latency_mode: {
        type: String,
        default: null
    },
    playback_id: {
        type: String,
        default: null
    },
    live_stream_id: {
        type: String,
        default: null
    },
    created_at: {
        type: String,
        default: null
    },
})


const GuruLiveStreaming = mongoose.model('GuruLiveStreaming', LiveStreamSchema);
module.exports = GuruLiveStreaming