const express = require('express');
const router = express.Router();
const { admin_login_validator , ValidatorResult } = require('../../validation/user.validator')
const {
  login,
  logout,
  getAllUser,
  deleteProfile
} = require('../controllers/admin.controller');
const  { verifyAccessToken } = require('../../middleware/admin.middleware');



router.post('/login' , admin_login_validator , ValidatorResult , login)
router.get('/logout' , verifyAccessToken , logout)
router.get('/getAllUsers' , verifyAccessToken , getAllUser )
router.delete('/deleteUserAccount' , verifyAccessToken , deleteProfile);

module.exports = router