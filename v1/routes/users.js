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

/**
 * @swagger
 * /v1/users/signUp:
 *   post:
 *     summary: Customer Signup
 *     description: Endpoint for user registration.
 *     tags: [USER]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "example@example.com"
 *             full_name: "John Doe"
 *             mobile_number: "+1234567890"
 *             password: "examplePassword"
 *             dob: "12-07-1998"
 *             gender: "male"
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User created successfully
 */


router.post('/signUp',   signUp)

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
 * /v1/users/otpverify:
 *   post:
 *     summary: Verify OTP
 *     description: Endpoint for OTP verification.
 *     tags: [USER]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             otp: "123456"
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


router.post('/otpverify' , authenticate , verifyOtp)

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
 * /v1/users/updateProfile:
 *   put:
 *     summary: Update User Profile
 *     description: Endpoint to update user profile.
 *     tags: [USER]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               pincode:
 *                 type: string
 *               dob:
 *                 type: string
 *           example:
 *             file: binary-data   # Your file data here
 *             full_name: John Doe
 *             email: example@example.com
 *             gender: male
 *             street: Example Street
 *             city: Example City
 *             state: Example State
 *             country: Example Country
 *             pincode: 12345
 *             dob: 1990-01-01
 *     responses:
 *       '200':
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User profile updated successfully
 *     consumes:
 *       - multipart/form-data
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

router.put('/updateProfile' , upload.single('file') ,  authenticate , updateProfile);


module.exports = router;
