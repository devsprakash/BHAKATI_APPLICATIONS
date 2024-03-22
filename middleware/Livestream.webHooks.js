
const Mux = require('@mux/mux-node');
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, WEBHOOK_SECRET } = require('../keys/development.keys')
const mux = new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET
});
const webhookSecret = WEBHOOK_SECRET;



// Define custom middleware function for handling Mux webhooks
exports.muxWebhookMiddleware = (req, res, next) => {

    try {

        mux.webhooks.verifySignature(req.body, req.headers, webhookSecret);

        const body = req.body.toString();
        const headers = req.headers;
        const event = mux.webhooks.unwrap(body, headers);

        switch (event.type) {
            case 'video.live_stream.active':
            case 'video.live_stream.idle':
            case 'video.live_stream.disabled':

                if (event.data.id === 'MySpecialTVLiveStreamID') {
                    revalidatePath('/tv');
                }
                break;
            default:
                break;
        }

        next();
    } catch (err) {

        console.error('Webhook Verification Error:', err.message);
        res.status(400).send(`Webhook Verification Error: ${err.message}`);
    }
}



