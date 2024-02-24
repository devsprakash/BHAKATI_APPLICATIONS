
const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewGuru, guruLogin, gurulogout } = require('../controller/guru.controller');
const { upload } = require('../../middleware/multer')


/**
 * @swagger
 * /temple/guru/addNewGuru:
 *   post:
 *     summary: Add a new Guru
 *     description: Endpoint to add a new Guru with their details.
 *     tags:
 *       - GURU
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: guruImage
 *         type: file
 *         description: Image of the Guru
 *       - in: formData
 *         name: GuruName
 *         type: string
 *         description: Name of the Guru
 *       - in: formData
 *         name: email
 *         type: string
 *         description: Email of the Guru
 *       - in: formData
 *         name: mobile_number
 *         type: string
 *         description: Mobile number of the Guru
 *       - in: formData
 *         name: password
 *         type: string
 *         description: Password of the Guru
 *       - in: formData
 *         name: expertise
 *         type: string
 *         description: Expertise of the Guru
 *       - in: formData
 *         name: templeId
 *         type: string
 *         description: ID of the temple associated with the Guru
 *       - in: formData
 *         name: aadharacardNumber
 *         type: string
 *         description: Aadhar card number of the Guru
 *       - in: formData
 *         name: pancardNumber
 *         type: string
 *         description: Pan card number of the Guru
 *     responses:
 *       201:
 *         description: New Guru added successfully
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       401:
 *         description: Unauthorized, authentication credentials were missing or incorrect
 *       500:
 *         description: Internal server error
 */


router.post('/addNewGuru' , upload.single('guruImage') , verifyAccessToken , addNewGuru);

/**
 * @swagger
 * /temple/guru/gurulogin:
 *   post:
 *     summary: Guru Login
 *     description: Endpoint for Guru authentication.
 *     tags:
 *       - GURU
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: guru@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       401:
 *         description: Unauthorized, incorrect email or password
 *       500:
 *         description: Internal server error
 */
router.post('/gurulogin', guruLogin);

/**
 * @swagger
 * /temple/guru/guruLogout:
 *   post:
 *     summary: Guru Logout
 *     description: Endpoint for Guru logout.
 *     tags:
 *       - GURU
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guruId:
 *                 type: string
 *                 example: "65bc50d8cc899f2df475a95f"
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       401:
 *         description: Unauthorized, authentication credentials were missing or incorrect
 *       500:
 *         description: Internal server error
 */
router.post('/guruLogout', gurulogout);



module.exports = router;