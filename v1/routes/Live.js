const express = require('express');
const { createNewLiveStream, getAllLiveStream, getLiveStream, updateLiveStream } = require('../controllers/livestream.controller');
const router = express.Router();



/**
 * @swagger
 * /LiveStream/createNewLiveStream:
 *   post:
 *     summary: Create a new live stream
 *     description: Endpoint to create a new live stream.
 *     tags: [USER]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the live stream.
 *     responses:
 *       '201':
 *         description: Successfully created a new live stream
 *       '400':
 *         description: Bad request, missing required fields
 */

router.post('/createNewLiveStream',  createNewLiveStream);

/**
 * @swagger
 * /LiveStream/getAllLiveStreams:
 *   get:
 *     summary: Get all live streams
 *     description: Endpoint to fetch all live streams.
 *     tags: [USER]
 *     responses:
 *       '200':
 *         description: A list of live streams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   streamName:
 *                     type: string
 *                     description: The name of the live stream.
 *                   description:
 *                     type: string
 *                     description: Description of the live stream.
 *       '404':
 *         description: No live streams found
 */

router.get('/getAllLiveStreams' , getAllLiveStream);

/**
 * @swagger
 * /LiveStream/getLiveStreams/{LIVE_STREAM_ID}:
 *   get:
 *     summary: Get a live stream by ID
 *     description: Endpoint to fetch a live stream by its ID.
 *     tags: [USER]
 *     parameters:
 *       - in: path
 *         name: LIVE_STREAM_ID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the live stream to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the live stream
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 streamName:
 *                   type: string
 *                   description: The name of the live stream.
 *                 description:
 *                   type: string
 *                   description: Description of the live stream.
 *       '404':
 *         description: Live stream not found
 */


router.get('/getLiveStreams/:LIVE_STREAM_ID' , getLiveStream)

/**
 * @swagger
 * /LiveStream/updateLiveStreams/{LIVE_STREAM_ID}:
 *   patch:
 *     summary: Update a live stream by ID
 *     description: Endpoint to update a live stream by its ID.
 *     tags: [USER]
 *     parameters:
 *       - in: path
 *         name: LIVE_STREAM_ID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the live stream to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latency_mode:
 *                 type: string
 *                 description: Latency mode of the live stream.
 *               reconnect_window:
 *                 type: number
 *                 description: Reconnect window in seconds.
 *               max_continuous_duration:
 *                 type: number
 *                 description: Maximum continuous duration in seconds.
 *     responses:
 *       '200':
 *         description: Successfully updated the live stream
 *       '404':
 *         description: Live stream not found
 */

router.patch('/updateLiveStreams/:LIVE_STREAM_ID' , updateLiveStream)



module.exports = router;