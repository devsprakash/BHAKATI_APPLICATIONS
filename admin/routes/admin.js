const express = require('express');
const router = express.Router();
const { admin_login_validator, ValidatorResult } = require('../../validation/user.validator')
const {
  login,
  logout,
  getAllUser,
  deleteProfile,
  getUser,
  getAllAdmin
} = require('../controllers/admin.controller');
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { login_validator, ValidatorResult, delete_user_account_validator } = require('../../validation/admin.validator')




router.post('/login', login_validator, ValidatorResult, login)
router.get('/logout', verifyAccessToken, logout)
router.get('/getAllUsers', verifyAccessToken, getAllUser)
router.delete('/deleteUserAccount', delete_user_account_validator, ValidatorResult, verifyAccessToken, deleteProfile);
router.get('/getProfile', verifyAccessToken, getUser);
router.get('/getAllAdmin', verifyAccessToken, getAllAdmin)



module.exports = router