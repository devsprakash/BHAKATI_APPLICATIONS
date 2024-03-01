const { Mux } = require('@mux/mux-node');
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, myIdType, signingKeyId, privateKeyBase64 } = require('../keys/development.keys')
const mux = new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET
});


exports.getViewerCountsToken = async (assetId) => {
    return await mux.jwt.signViewerCounts(assetId, {
        expiration: '1 day',
        type: myIdType,
        keyId: signingKeyId,
        keySecret: privateKeyBase64,
    });
};




