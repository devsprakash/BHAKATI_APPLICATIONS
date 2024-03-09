
const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewGuru, guruLogin, gurulogout, getAllGuru, getGuruProfile, GuruCreateNewLiveStream, getAllLiveStreamByGuru } = require('../controller/guru.controller');
const  upload  = require('../../middleware/multer')
const GuruAuth = require('../../middleware/guru.auth')

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


router.post('/addNewGuru', upload.single('guruImage'), verifyAccessToken, addNewGuru);


/**
 * @swagger
 * /temple/guru/getAllGurus:
 *   get:
 *     summary: Get all gurus
 *     description: Retrieve a list of all gurus.
 *     tags:
 *       - GURU
 *     responses:
 *       200:
 *         description: A list of all gurus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 total_gurus:
 *                   type: integer
 *                   description: Total number of gurus
 *                 gurus:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Guru'
 *       404:
 *         description: No gurus found
 *       500:
 *         description: Internal server error
 */

router.get('/getAllGurus', getAllGuru);

/**
 * @swagger
 * /temple/guru/getProfile/{guruId}:
 *   get:
 *     summary: Get guru profile
 *     description: Retrieve the profile of a specific guru.
 *     tags:
 *       - GURU
 *     parameters:
 *       - in: path
 *         name: guruId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the guru to retrieve profile for
 *     responses:
 *       200:
 *         description: Guru profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuruProfile'
 *       404:
 *         description: Guru not found
 *       500:
 *         description: Internal server error
 */

router.get('/getProfile' , GuruAuth , getGuruProfile);

/**
 * @swagger
 * /temple/guru/GuruCreatedLiveStream/{guruId}:
 *   post:
 *     summary: Create new live stream by guru
 *     description: Create a new live stream initiated by a guru.
 *     tags:
 *       - GURU
 *     parameters:
 *       - in: path
 *         name: guruId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the guru creating the live stream
 *     responses:
 *       201:
 *         description: New live stream created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveStream'
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       404:
 *         description: Guru not found
 *       500:
 *         description: Internal server error
 */

router.post('/GuruCreatedLiveStream' , GuruAuth , GuruCreateNewLiveStream);

/**
 * @swagger
 * /temple/guru/getAllGuruLiveStream:
 *   get:
 *     summary: Get all live streams by guru
 *     description: Retrieve a list of all live streams created by gurus.
 *     tags:
 *       - GURU
 *     responses:
 *       200:
 *         description: A list of all live streams created by gurus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LiveStream'
 *       404:
 *         description: No live streams found
 *       500:
 *         description: Internal server error
 */

router.get('/getAllGuruLiveStream' , getAllLiveStreamByGuru)




module.exports = router;