
const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewGuru, SearchAllGuru, getGuruProfile, GuruCreateNewLiveStream, getAllLiveStreamByGuru } = require('../controller/guru.controller');
const  upload  = require('../../middleware/multer')
const TempleAuth  = require('../../middleware/guru.auth')




router.post('/addNewGuru', upload.single('guruImage'), addNewGuru);
router.get('/getProfile' , TempleAuth ,  getGuruProfile);
router.post('/GuruCreatedLiveStream' , TempleAuth , GuruCreateNewLiveStream);
router.get('/getAllGuruLiveStream' , getAllLiveStreamByGuru)
router.get('/SearchAllGuru' , SearchAllGuru);



module.exports = router;
