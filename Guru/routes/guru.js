
const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewGuru, SearchAllGuru, getGuruProfile, GuruCreateNewLiveStream,
    getLiveStreamByGuru, guru_suggested_videos, getGuruProfileByAdmin, guruDelete, updateGuruProfile, Webhook } = require('../controller/guru.controller');
const authenticate = require('../../middleware/authenticate');
const upload = require('../../middleware/multer')
const TempleAuth = require('../../middleware/guru.auth');
const { add_guru_validator, Guru_Validator_Result, get_guru_profile_admin_validator, create_live_validator , guru_suggested_video_validator } = require('../../validation/guru.validator')




router.post('/addNewGuru', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), add_guru_validator, Guru_Validator_Result, addNewGuru);
router.get('/getProfile', TempleAuth, getGuruProfile);
router.post('/GuruCreatedLiveStream', create_live_validator, Guru_Validator_Result, TempleAuth, GuruCreateNewLiveStream);
router.get('/getGuruLiveStream', getLiveStreamByGuru)
router.get('/SearchAllGuru', SearchAllGuru);
router.get('/guruSuggestedVideos', guru_suggested_video_validator, Guru_Validator_Result, guru_suggested_videos);
router.post('/getGuruProfileByAdmin', getGuruProfileByAdmin);
router.put('/updateGuruProfile', TempleAuth, updateGuruProfile)
router.delete('/deleteguru', verifyAccessToken, guruDelete);
router.post('/webhook', Webhook)
router.post('/getGuruProfileByAdmin', get_guru_profile_admin_validator, Guru_Validator_Result, authenticate, getGuruProfileByAdmin);
router.put('/updateGuruProfile', TempleAuth, updateGuruProfile)
router.delete('/deleteguru', authenticate, guruDelete)




module.exports = router;
