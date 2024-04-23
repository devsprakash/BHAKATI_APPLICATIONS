
const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const { addNewGuru, SearchAllGuru, getGuruProfile, GuruCreateNewLiveStream,
    getLiveStreamByGuru, guru_suggested_videos, getGuruProfileByAdmin, guruDelete,
    updateGuruProfile } = require('../controller/guru.controller');
const upload = require('../../middleware/multer')
const TempleAuth = require('../../middleware/guru.auth');
const { add_guru_validator, Guru_Validator_Result } = require('../../validation/guru.validator')



router.post('/addNewGuru', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), add_guru_validator, Guru_Validator_Result, addNewGuru);
router.get('/getProfile', TempleAuth, getGuruProfile);
router.post('/GuruCreatedLiveStream', TempleAuth, GuruCreateNewLiveStream);
router.get('/getGuruLiveStream', getLiveStreamByGuru)
router.get('/SearchAllGuru', SearchAllGuru);
router.get('/guruSuggestedVideos', guru_suggested_videos);
router.post('/getGuruProfileByAdmin', authenticate, getGuruProfileByAdmin);
router.put('/updateGuruProfile', TempleAuth, updateGuruProfile)
router.delete('/deleteguru', authenticate, guruDelete)



module.exports = router;
