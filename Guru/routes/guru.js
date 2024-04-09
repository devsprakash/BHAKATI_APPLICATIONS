
const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewGuru, SearchAllGuru, getGuruProfile, GuruCreateNewLiveStream, getLiveStreamByGuru, guru_suggested_videos , getGuruProfileByAdmin } = require('../controller/guru.controller');
const upload = require('../../middleware/multer')
const TempleAuth = require('../../middleware/guru.auth');



router.post('/addNewGuru', upload.array('image', 2), addNewGuru);
router.get('/getProfile', getGuruProfile);
router.post('/GuruCreatedLiveStream', TempleAuth, GuruCreateNewLiveStream);
router.get('/getGuruLiveStream', getLiveStreamByGuru)
router.get('/SearchAllGuru', SearchAllGuru);
router.get('/guruSuggestedVideos' , guru_suggested_videos);
router.post('/getGuruProfileByAdmin' , getGuruProfileByAdmin)


module.exports = router;
