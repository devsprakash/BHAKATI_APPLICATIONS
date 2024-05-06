const express = require('express');
const { templeLogin, logout, getTempleProfile,
    addBankDetails, getBankDetails, updateBankDetails, addpanditDetails, getpanditDetails, UpdatepanditDetails,
    CreateNewLiveStreamByTemple, getTempleLiveStream, generate_refresh_tokens, temple_suggested_videos, getTempleProfileByAdmin,
    deleteBankDetails, deletePanditDetails,
    getAllpanditList,
    updateTempleProfile,
    addBankDetailsByAdmin,
    AllBankList, updateProfileImage,
    webhooks,
    signUp,
    uploadTempleImage } = require('../controller/Temple.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth');
const authenticate = require('../../middleware/authenticate')
const upload = require('../../middleware/multer');
const { signup_validator, ValidatorResult, temple_upload_image_validator } = require('../../validation/temple.validator')




router.post('/signUp', signup_validator, ValidatorResult, signUp);
router.post('/uploadTempleImage/:templeId', temple_upload_image_validator, upload.fields([{ name: 'temple_image', maxCount: 1 }]), uploadTempleImage)
router.post('/login', templeLogin);
router.get('/logout', TempleAuth, logout);
router.get('/getTempleProfile', getTempleProfile);
router.post('/createLiveStreamingByTemple', TempleAuth, CreateNewLiveStreamByTemple);
router.get('/getTempleLiveStream', getTempleLiveStream)
router.post('/addBankDetails', TempleAuth, addBankDetails)
router.get('/getBankDetails/:templeId', getBankDetails)
router.put('/updateBankDetails/:templeId', updateBankDetails);
router.delete('/deleteBankDetails/:templeId', deleteBankDetails)
router.post('/addPanditDetails', TempleAuth, addpanditDetails)
router.get('/getpanditDetails/:panditId', TempleAuth, getpanditDetails);
router.get('/getAllpanditList/:templeId', getAllpanditList)
router.put('/updatepanditDetails/:panditId', TempleAuth, UpdatepanditDetails);
router.delete('/deletePanditDetails/:panditId', TempleAuth, deletePanditDetails)
router.post('/generatedNewToken', generate_refresh_tokens);
router.get('/templeSuggestedVideos', temple_suggested_videos);
router.post('/getTempleProfileByAdmin', getTempleProfileByAdmin);
router.put('/updateTempleProfile', TempleAuth, updateTempleProfile)
router.post('/addBankDetailsByAdmin', upload.single('logo'), authenticate, addBankDetailsByAdmin);
router.get('/BankList', AllBankList);
router.post('/updateProfileImage', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), TempleAuth, updateProfileImage);






module.exports = router;


