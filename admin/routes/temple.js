
const express = require('express');
const { addTemple, SearchAllTemples, templeDelete } = require('../controllers/temple.controller');
const router = express.Router()
const upload = require('../../middleware/multer')
const { verifyAccessToken } = require('../../middleware/admin.middleware')



//router.post('/addTemple', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), verifyAccessToken, addTemple);
router.get('/searchTemples', SearchAllTemples);
router.delete('/deleteTemple', verifyAccessToken, templeDelete)


module.exports = router