const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const { user_validator,
  login_validator,ValidatorResult , admin_login_validator
 } = require('../../validation/user.validator')
 const { upload } = require('../../middleware/multer')
const {
  signUp,
  login,
  logout,
  getUser , verifyOtp , updateProfile,  loginWithPassword
} = require('../controllers/user.controller');



router.post('/signUp', user_validator , ValidatorResult ,   signUp)
router.post('/login', login_validator, ValidatorResult,  login)
router.post('/loginwithpassword' , admin_login_validator , ValidatorResult ,  loginWithPassword)
router.get('/logout', authenticate, logout);
router.post('/accountVerify' , authenticate , verifyOtp)
router.get('/getProfile' , authenticate , getUser);
router.put('/updateProfile' , upload.single('file') ,  authenticate , updateProfile);


module.exports = router;
