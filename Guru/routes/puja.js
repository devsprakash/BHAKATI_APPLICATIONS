const express = require('express');
const { addNewPuja, getAllPuja, addPuja, ListOfPuja, pujs_by_temple, deletePuja, deletePujaByAdmin } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth')
const upload = require('../../middleware/multer');
const authenticate = require('../../middleware/authenticate');
const { addNewRithuals, getAllRithuals, getRithualsByTemples, deleteRithuals } = require('../controller/rituals.controller');
const { add_puja_validator, Validator_Result, puja_add_by_temple_validator, delete_puja_validator } = require('../../validation/puja.validator');



router.post('/addNewPuja', upload.single('puja_image'), add_puja_validator, Validator_Result, authenticate, addNewPuja);
router.get('/getAllpuja', authenticate, getAllPuja);
router.post('/addpuja', puja_add_by_temple_validator, Validator_Result, TempleAuth, addPuja);
router.get('/MasterPuja', TempleAuth, ListOfPuja)
router.get('/TempleUnderAllpujaList', TempleAuth, pujs_by_temple)
router.post('/addNewRithuals', TempleAuth, addNewRithuals);
router.get('/getAllRithuals', getAllRithuals);
router.get('/getRithualsByTemples', getRithualsByTemples);
router.delete('/deleteRihuals/:rithualId', TempleAuth, deleteRithuals)
router.delete('/deletePuja', delete_puja_validator, Validator_Result, TempleAuth, deletePuja)
router.delete('/deletePujaByAdmin/:pujaId', authenticate, deletePujaByAdmin)




module.exports = router;