const express = require('express');
const { addNewPuja , getAllPuja, getAllUpcomingorLivePuja, updatePuja } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuthenticate = require('../../middleware/temple.auth')



router.post('/addNewPuja' , TempleAuthenticate , addNewPuja);
router.get('/getAllpuja' , getAllPuja);
router.get('/getAllUpcomingorLivePuja' , getAllUpcomingorLivePuja);
router.put('/updatepuja/:pujaId' , TempleAuthenticate , updatePuja)


module.exports = router;