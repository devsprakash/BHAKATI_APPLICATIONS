const express = require('express');
const router = express.Router();
const GuruAuth = require('../../middleware/guru.auth');
const { uploadNewVideo, getAllVideo, getVideo, getCountTotalViews } = require('../controller/videoUpload.controller');
const upload = require('../../middleware/multer')


router.post('/addNewVideo' , upload.single('video') , GuruAuth , uploadNewVideo );
router.get('/getAllVideos' , getAllVideo);
router.get('/getVideo/:assetId' , getVideo)
//router.get('/totalViews' , getCountTotalViews)


module.exports = router;