const express = require('express');
const { addNewPuja, getAllPuja, addPuja, getAllPujas } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuthenticate = require('../../middleware/temple.auth')
const upload  = require('../../middleware/multer');
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewRithuals, getAllRithuals } = require('../controller/rituals.controller');


/**
 * @swagger
 * /guru/puja/addNewPuja:
 *   post:
 *     summary: Add a new puja
 *     description: Endpoint to add a new puja with images, category, and templeId
 *     tags: [PUJA]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: pujaImage
 *         in: formData
 *         description: An array of images for the puja
 *         type: file
 *         required: true
 *         format: binary
 *         maxItems: 50
 *       - name: category
 *         in: formData
 *         description: An array of categories for the puja
 *         type: array
 *         items:
 *           type: string
 *         required: true
 *       - name: templeId
 *         in: formData
 *         description: ID of the temple for which the puja is being added
 *         type: string
 *         required: true
 *       - name: Authorization
 *         in: header
 *         description: User access token for authentication
 *         type: string
 *         required: true
 *     responses:
 *       '201':
 *         description: New puja added successfully
 *       '400':
 *         description: Bad request - Invalid input
 *       '401':
 *         description: Unauthorized - Access token is missing or invalid
 *       '403':
 *         description: Forbidden - Admin access token is missing or invalid
 *       '500':
 *         description: Internal server error - Something went wrong
 */

router.post('/addNewPuja', upload.array('pujaImage'), verifyAccessToken, addNewPuja);

/**
 * @swagger
 * /guru/puja/pujaList:
 *   get:
 *     summary: Get all pujas with optional status filter
 *     description: Endpoint to get all pujas with an optional status filter
 *     tags: [PUJA]
 *     parameters:
 *       - name: status
 *         in: query
 *         description: Filter pujas by status (upcoming, completed, in-progress)
 *         type: string
 *         enum: [upcoming, completed, in-progress]
 *     responses:
 *       '200':
 *         description: A list of pujas
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Puja'
 *       '400':
 *         description: Bad request - Invalid status value provided
 *       '500':
 *         description: Internal server error - Something went wrong
 */
router.get('/pujaList', getAllPujas)

/**
 * @swagger
 * /guru/puja/getAllpuja::
 *   get:
 *     summary: Get all pujas
 *     description: Retrieve a list of all pujas
 *     tags: [PUJA]
 *     responses:
 *       '200':
 *         description: A list of pujas
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Pujas not found
 *       '500':
 *         description: Server error
 */


router.get('/getAllpuja', getAllPuja);

/**
 * @swagger
 *  /guru/puja/addpuja/{pujaId}:
 *   post:
 *     summary: Update a puja by ID
 *     description: Endpoint to update a puja by its ID (only accessible to temple authorities)
 *     tags: [PUJA]
 *     parameters:
 *       - name: pujaId
 *         in: path
 *         description: ID of the puja to update
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: Updated puja data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             duration:
 *               type: string
 *               format: time
 *             price:
 *               type: number
 *               format: time
 *             pujaName:
 *               type: string
 *               description: Name of the puja
 *     security:
 *       - TempleBearerAuth: [] # Use TempleBearerAuth security scheme
 *     responses:
 *       '200':
 *         description: Puja updated successfully
 *       '400':
 *         description: Bad request - Invalid input
 *       '401':
 *         description: Unauthorized - Temple bearer token is missing or invalid
 *       '404':
 *         description: Not found - Puja with the specified ID not found
 *       '500':
 *         description: Internal server error - Something went wrong
 * securityDefinitions:
 *   TempleBearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 *     description: Temple bearer token for authentication
 */


router.post('/addpuja/:pujaId', TempleAuthenticate, addPuja);


/**
 * @swagger
 * /guru/puja/addNewRithuals:
 *   post:
 *     summary: Add new rituals
 *     description: Endpoint to add new rituals to the temple.
 *     tags:
 *       - Rituals
 *     security:
 *       - TempleAuthenticate: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ritualName:
 *                 type: string
 *                 example: "sakala aarati"
 *               StartTime:
 *                 type: string
 *                 format: time
 *                 example: "5:10 AM"
 *               EndTime:
 *                 type: string
 *                 format: time
 *                 example: "5:40 AM"
 *     responses:
 *       200:
 *         description: Rituals added successfully
 *       401:
 *         description: Unauthorized, authentication credentials were missing or incorrect
 *       500:
 *         description: Internal server error
 * securityDefinitions:
 *   TempleAuthenticate:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 *     description: Temple bearer token for authentication
 */


router.post('/addNewRithuals', TempleAuthenticate, addNewRithuals);

/**
 * @swagger
 * /guru/puja/getAllRithuals:
 *   get:
 *     summary: Get all rituals
 *     description: Endpoint to retrieve all rituals from the temple.
 *     tags:
 *       - Rituals
 *     responses:
 *       200:
 *         description: An array of all rituals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   templeId:
 *                     type: string
 *                     example: "65bc50d8cc899f2df475a95f"
 *                   ritualName:
 *                     type: string
 *                     example: "sakala aarati"
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "24-02-2024"
 *                   description:
 *                     type: string
 *                     example: "sakala aarati is starting now, please join"
 *                   StartTime:
 *                     type: string
 *                     format: time
 *                     example: "5:10 AM"
 *                   EndTime:
 *                     type: string
 *                     format: time
 *                     example: "5:40 AM"
 *       401:
 *         description: Unauthorized, authentication credentials were missing or incorrect
 *       500:
 *         description: Internal server error
 */

router.get('/getAllRithuals', getAllRithuals);



module.exports = router;