const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const { update_profile_validator,
  login_validator,ValidatorResult , admin_login_validator
 } = require('../../validation/user.validator')
 const { upload } = require('../../middleware/multer')
const {
  signUp,
  login,
  logout,
  getUser , verifyOtp , updateProfile,  loginWithPassword
} = require('../controllers/user.controller');




/**
 * @swagger
 * /v1/users/login:
 *   post:
 *     summary: User Login
 *     description: Endpoint for user login.
 *     tags: [USER]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             mobile_number: "+1234567890"
 *             email: "examplePassword@gmail.com"
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User logged in successfully
 */

router.post('/login', login_validator, ValidatorResult,  login)

/**
 * @swagger
 * /v1/users/logout:
 *   get:
 *     summary: user Logout
 *     description: Endpoint for user logout.
 *     tags: [USER]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: user logged out successfully
 *         content:
 *           application/json:
 *             example:
 *               message: user logged out successfully
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer token to authenticate the user
 *         required: true
 *         type: string
 *         example: Bearer YOUR_JWT_TOKEN
 * 
 * securityDefinitions:
 *   BearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */

router.get('/logout', authenticate, logout);


/**
 * @swagger
 * /v1/users/otpverify/{userId}:
 *   get:
 *     summary: Verify OTP
 *     description: Endpoint for OTP verification.
 *     tags: [USER]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The ID of the user for OTP verification
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP verified successfully
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 * 
 */

router.get('/otpverify/:userId',  verifyOtp);


/**
 * @swagger
 * /v1/users/getProfile:
 *   get:
 *     summary: user get profile
 *     description: Endpoint for user profile.
 *     tags: [USER]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: user profile successfully get
 *         content:
 *           application/json:
 *             example:
 *               message: user profile successfully get
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer token to authenticate the user
 *         required: true
 *         type: string
 *         example: Bearer YOUR_JWT_TOKEN
 * 
 * securityDefinitions:
 *   BearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */

router.get('/getProfile' , authenticate , getUser);


/**
 * @swagger
 * v1/users/updateProfile/{userId}:
 *   put:
 *     summary: Update User Profile
 *     description: Endpoint to update user profile information.
 *     tags: [USER]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The ID of the user whose profile needs to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             full_name: "John Doe"
 *             email: "psamantaray77@gmail.com"
 *             gender: "Male"
 *             street: "123 Main St"
 *             city: "Cityville"
 *             state: "Stateville"
 *             country: "Countryland"
 *             pincode: "12345"
 *             dob: "1990-01-01"
 *             mobile_number: "6371704662"
 *     responses:
 *       '200':
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Profile updated successfully
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 * 
 */


router.put('/updateProfile/:userId' ,   updateProfile);


module.exports = router;
