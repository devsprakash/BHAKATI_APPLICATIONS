const express = require('express');
const router = express.Router();
const GuruAuth = require('../../middleware/guru.auth');
const { uploadNewVideo } = require('../controller/videoUpload.controller');
const upload = require('../../middleware/multer')


router.post('/addNewVideo' , upload.single('video') , GuruAuth , uploadNewVideo )



module.exports = router;