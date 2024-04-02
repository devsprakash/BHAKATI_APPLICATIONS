const express = require('express');
const { templeLogin, logout, getTempleProfile, 
    addBankDetails, getBankDetails, addpanditDetails, getpanditDetails, UpdatepanditDetails,
     CreateNewLiveStreamByTemple, getTempleLiveStream , generate_refresh_tokens, temple_suggested_videos } = require('../controller/Temple.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth')
const bodyParser = require('body-parser');
const { muxWebhookMiddleware } = require('../../middleware/Livestream.webHooks')



router.post('/login', templeLogin);
router.get('/logout', TempleAuth, logout);
router.get('/getTempleProfile', getTempleProfile);
router.post('/createLiveStreamingByTemple', TempleAuth, CreateNewLiveStreamByTemple);
router.get('/getTempleLiveStream', getTempleLiveStream)
router.post('/addBankDetails', TempleAuth, addBankDetails)
router.get('/getBankDetails/:bankId', TempleAuth, getBankDetails)
router.post('/addPanditDetails', TempleAuth, addpanditDetails)
router.get('/getpanditDetails/:panditId', TempleAuth, getpanditDetails);
router.put('/updatepanditDetails/:panditId', TempleAuth, UpdatepanditDetails)
router.post('/generatedNewToken' , generate_refresh_tokens);
router.get('/templeSuggestedVideos' , temple_suggested_videos)


module.exports = router;


