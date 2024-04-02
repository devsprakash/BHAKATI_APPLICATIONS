const express = require('express');
const router = express.Router();
const GuruAuth = require('../../middleware/guru.auth');
const { uploadNewVideo, getAllVideo, getVideo, getCountTotalViews } = require('../controller/videoUpload.controller');
const upload = require('../../middleware/multer');
const TempleAuth = require('../../middleware/guru.auth');


router.post('/addNewVideo' , upload.single('video') , TempleAuth , uploadNewVideo );
router.get('/getAllVideos' , getAllVideo);
router.get('/totalViews' , getCountTotalViews)


module.exports = router;