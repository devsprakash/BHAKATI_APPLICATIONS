
const express = require('express');
const { addTemple, getAllTemples, SearchAllTemples } = require('../controllers/temple.controller');
const router = express.Router()
const {upload} = require('../../middleware/multer')
const {verifyAccessToken} = require('../../middleware/admin.middleware')


router.post('/addTemple' , upload.single('templeImage')  , verifyAccessToken ,  addTemple);
router.get('/getAllTemples' , getAllTemples)
router.get('/searchTemples' , SearchAllTemples)



module.exports = router