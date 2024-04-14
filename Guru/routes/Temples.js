const express = require('express');
const { templeLogin, logout, getTempleProfile,
    addBankDetails, getBankDetails, updateBankDetails, addpanditDetails, getpanditDetails, UpdatepanditDetails,
    CreateNewLiveStreamByTemple, getTempleLiveStream, generate_refresh_tokens, temple_suggested_videos, getTempleProfileByAdmin,
    deleteBankDetails, deletePanditDetails,
    getAllpanditList,
    updateTempleProfile,
    addBankDetailsByAdmin, 
    AllBankList} = require('../controller/Temple.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth');
const authenticate = require('../../middleware/authenticate')
const upload = require('../../middleware/multer')



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
router.get('/BankList' , AllBankList)



module.exports = router;


