const express = require('express');
const { addNewPuja, getAllPuja, getAllUpcomingorLivePuja, updatePuja } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuthenticate = require('../../middleware/temple.auth')
const { upload } = require('../../middleware/multer');
const { verifyAccessToken } = require('../../middleware/admin.middleware')

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
 *       - name: AdminAuthorization
 *         in: header
 *         description: Admin access token for authentication
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

router.post('/addNewPuja', upload.array('pujaImage' , 50), verifyAccessToken, addNewPuja);

/**
 * @swagger
 * /guru/puja/getAllPuja:
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

router.get('/getAllpuja', getAllPuja);

/**
 * @swagger
 *  /guru/puja/updatepuja/{pujaId}:
 *   put:
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
 *             date:
 *               type: string
 *               format: date
 *             StartTime:
 *               type: string
 *               format: time
 *             EndTime:
 *               type: string
 *               format: time
 *             description:
 *               type: string
 *             pujaName:
 *               type: string
 *               description: Name of the puja
 *     security:
 *       - TempleBearerAuth: []
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

router.put('/updatepuja/:pujaId', TempleAuthenticate, updatePuja)


module.exports = router;