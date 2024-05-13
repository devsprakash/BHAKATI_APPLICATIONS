
const express = require('express');
const router = express.Router();
const { addNewRithuals, getAllRithuals, getRithualsByTemples, deleteRithuals, updateRithuals } = require('../controller/rituals.controller');
const TempleAuth = require('../../middleware/temple.auth')
const GuruAuth = require('../../middleware/guru.auth')
const { add_new_rithuals_validator, ValidatorResult, update_rithual_validator, delete_rithual_validator } = require('../../validation/rithual.validator')
const authenticate = require('../../middleware/authenticate')


router.post('/addNewRithuals', add_new_rithuals_validator, ValidatorResult, TempleAuth, addNewRithuals);
router.get('/getAllRithuals', GuruAuth, getAllRithuals);
router.get('/templesUnderAllTheRithuals', TempleAuth, getRithualsByTemples);
router.put('/updateRithual/:rithualId', update_rithual_validator, ValidatorResult, TempleAuth, updateRithuals)
router.delete('/deleteRithual/:rithualId', delete_rithual_validator, ValidatorResult, TempleAuth, deleteRithuals)


module.exports = router;