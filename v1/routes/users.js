const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const { login_validator, ValidatorResult, verifyOtp_validator, update_validator } = require('../../validation/user.validator')
const upload = require('../../middleware/multer')
const {
  login,
  logout,
  getUser, verifyOtp, updateProfile, updateDeviceToken, generate_refresh_tokens , signUp,
  updateProfileImage
} = require('../controllers/user.controller');



router.post('/signUp' , signUp)
router.post('/login',  login)
router.get('/logout', authenticate, logout);
router.get('/otpverify/:userId', verifyOtp);
router.get('/getProfile', authenticate, getUser);
router.put('/updateProfile/:userId', updateProfile)
router.post('/updateDeviceToken', authenticate, updateDeviceToken);
router.post('/generated_new_Tokens', generate_refresh_tokens)
router.post('/updateUserProfileImage' , upload.single('profile_image') , authenticate , updateProfileImage)

module.exports = router;
