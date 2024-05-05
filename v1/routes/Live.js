const express = require('express');
const { createNewLiveStream, getAllLiveStreamByPuja, deleteLiveStream, LiveStreamingEnd, getAllLiveStreamByRithuals, createNewLiveStreamByRithuls } = require('../controllers/livestream.controller');
const router = express.Router();
const { create_liveStream_validator, createNewLiveStreamByRithuls_validator, ValidatorResult, deleteLiveStreaming_validator } = require('../../validation/liveStream.validator')






router.post('/createNewLiveStream', create_liveStream_validator, ValidatorResult, createNewLiveStream);
router.get('/getAllLiveStreamByPuja', getAllLiveStreamByPuja);
router.put('/LiveStreamEnd/:LIVE_STREAM_ID/:id', deleteLiveStreaming_validator, ValidatorResult, LiveStreamingEnd);
router.delete('/deleteLiveStreams/:LIVE_STREAM_ID/:id', deleteLiveStreaming_validator, ValidatorResult, deleteLiveStream)



module.exports = router;