const express = require('express');
const { addNewPuja, getAllPuja, addPuja, ListOfPuja, pujs_by_temple, deletePuja, deletePujaByAdmin } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth')
const upload = require('../../middleware/multer');
const authenticate = require('../../middleware/authenticate');
const { addNewRithuals, getAllRithuals, getRithualsByTemples, deleteRithuals } = require('../controller/rituals.controller');



router.post('/addNewPuja', upload.array('pujaImage'), authenticate, addNewPuja);
router.get('/pujaList', ListOfPuja)
router.get('/getAllpuja', getAllPuja);
router.post('/addpuja/:pujaId', TempleAuth, addPuja);
router.get('/TempleUnderAllpujaList', pujs_by_temple)
router.post('/addNewRithuals', TempleAuth, addNewRithuals);
router.get('/getAllRithuals', getAllRithuals);
router.get('/getRithualsByTemples', getRithualsByTemples);
router.delete('/deleteRihuals/:rithualId', TempleAuth, deleteRithuals)
router.delete('/deletePuja/:pujaId', TempleAuth, deletePuja)
router.delete('/deletePujaByAdmin/:pujaId', authenticate, deletePujaByAdmin)




module.exports = router;