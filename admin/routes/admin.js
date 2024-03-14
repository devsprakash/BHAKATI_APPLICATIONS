const express = require('express');
const router = express.Router();
const { admin_login_validator , ValidatorResult } = require('../../validation/user.validator')
const {
  login,
  logout,
  getAllUser,
  deleteProfile,
  getUser,
  getAllAdmin
} = require('../controllers/admin.controller');
const  { verifyAccessToken } = require('../../middleware/admin.middleware');


/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: admin Login
 *     description: Endpoint for admin login.
 *     tags: [ADMIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             password: "+1234567890"
 *             email: "examplePassword@gmail.com"
 *     responses:
 *       '200':
 *         description: admin logged in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: admin logged in successfully
 */

router.post('/login' , admin_login_validator , ValidatorResult , login)

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: admin Logout
 *     description: Endpoint for admin logout.
 *     tags: [ADMIN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             templeId: "1234567890"
 *     responses:
 *       '200':
 *         description: admin logout in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: admin logout in successfully
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */

router.get('/logout' , verifyAccessToken , logout)

/**
 * @swagger
 * /getAllUsers:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users.
 *     tags: [ADMIN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/User'
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal Server Error
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       email:
 *         type: string
 *         format: email
 */

router.get('/getAllUsers' , verifyAccessToken , getAllUser )

/**
 * @swagger
 * /admin/deleteUserAccount:
 *   delete:
 *     summary: Delete User Account
 *     description: Deletes a user account.
 *     tags: [ADMIN]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user account to be deleted.
 *     responses:
 *       '200':
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User account deleted successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal Server Error
 */

router.delete('/deleteUserAccount' , verifyAccessToken , deleteProfile);
router.get('/getProfile' , verifyAccessToken , getUser);
router.get('/getAllAdmin' , verifyAccessToken , getAllAdmin)



module.exports = router