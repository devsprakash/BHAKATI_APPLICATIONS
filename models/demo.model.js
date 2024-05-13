
const mongoose = require('mongoose');

const demoSchema = new mongoose.Schema({

     type: { type: String, required: true },
     request_id: { type: String },
     object: {
          type: { type: String, required: true },
          id: { type: String, required: true }
     },
     id: { type: String, required: true },
     environment: {
          name: { type: String, required: true },
          id: { type: String, required: true }
     },
     data: {
          test: { type: Boolean, required: true },
          stream_key: { type: String, required: true },
          status: { type: String, required: true },
          srt_passphrase: { type: String, required: true },
          reconnect_window: { type: Number, required: true },
          playback_ids: [{ type: Object, required: true }],
          new_asset_settings: {
               playback_policies: [{ type: String, required: true }]
          },
          max_continuous_duration: { type: Number, required: true },
          latency_mode: { type: String, required: true },
          id: { type: String, required: true },
          created_at: { type: Date, required: true }
     },
     created_at: { type: Date, required: true },
     attempts: [{ type: Object }],
     accessor_source: { type: String },
     accessor: { type: String }
})


const demo = mongoose.model("data", demoSchema);
module.exports = demo;