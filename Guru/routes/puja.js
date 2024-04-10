const express = require('express');
const { addNewPuja, getAllPuja, addPuja, ListOfPuja, pujs_by_temple, deletePuja } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth')
const upload = require('../../middleware/multer');
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewRithuals, getAllRithuals, getRithualsByTemples, deleteRithuals } = require('../controller/rituals.controller');



router.post('/addNewPuja', upload.array('pujaImage'), verifyAccessToken, addNewPuja);
router.get('/pujaList', ListOfPuja)
router.get('/getAllpuja', getAllPuja);
router.post('/addpuja/:pujaId', TempleAuth, addPuja);
router.get('/TempleUnderAllpujaList', pujs_by_temple)
router.post('/addNewRithuals', TempleAuth, addNewRithuals);
router.get('/getAllRithuals', getAllRithuals);
router.get('/getRithualsByTemples', getRithualsByTemples);
router.delete('/deleteRihuals/:templeId/:rithualId', deleteRithuals)
router.delete('/deletePuja/:templeId/:pujaId', deletePuja)





module.exports = router;