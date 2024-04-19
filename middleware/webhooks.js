const Mux = require('@mux/mux-node');
const express = require('express');
const router = express.Router();
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, WEBHOOKSCRETKEY } = require('../keys/development.keys');

const mux = new Mux({
  tokenId: MUX_TOKEN_ID,
  tokenSecret: MUX_TOKEN_SECRET,
  webhookSecret: WEBHOOKSCRETKEY,
});




router.post('/webhooks', async (req, res) => {

  try {
    
    mux.webhooks.verifyMuxSignature('{"some":"data"}', 'Mux-Signature: t=1565220904,v1=20c75c1180c701ee8a796e81507cfd5c932fc17cf63a4a55566fd38da3a2d3d2`', WEBHOOKSCRETKEY)

    const event = mux.webhooks.unwrap(req.body, req.headers);

    switch (event.type) {
      case 'video.live_stream.active':
      case 'video.live_stream.idle':
      case 'video.live_stream.disabled':
        if (event.data.id === 'MySpecialTVLiveStreamID') {
          // Handle specific event
        }
        break;
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
