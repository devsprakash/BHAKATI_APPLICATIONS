const express = require('express');
const { addNewPuja, getAllPuja, addPuja, ListOfPuja , pujs_by_temple } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth')
const upload  = require('../../middleware/multer');
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewRithuals, getAllRithuals } = require('../controller/rituals.controller');



router.post('/addNewPuja', upload.array('pujaImage'), verifyAccessToken , addNewPuja);
router.get('/pujaList', ListOfPuja)
router.get('/getAllpuja', getAllPuja);
router.post('/addpuja/:pujaId', TempleAuth, addPuja);
router.get('/TempleUnderAllpujaList' , pujs_by_temple)
router.post('/addNewRithuals', TempleAuth, addNewRithuals);
router.get('/getAllRithuals', getAllRithuals);





module.exports = router;