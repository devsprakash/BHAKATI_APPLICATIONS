
const express = require('express');
const { addTemple, getAllTemples, SearchAllTemples, templeDelete, getTempleProfile } = require('../controllers/temple.controller');
const router = express.Router()
const upload = require('../../middleware/multer')
const {verifyAccessToken} = require('../../middleware/admin.middleware')



router.post('/addTemple' , upload.single('templeImage')  , verifyAccessToken ,  addTemple);
router.get('/searchTemples' , SearchAllTemples);
router.delete('/deleteTemple' , verifyAccessToken , templeDelete)
router.get('/templeProfile' , verifyAccessToken , getTempleProfile)


module.exports = router