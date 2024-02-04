const express = require('express');
const { generateRTCToken } = require('../controllers/livestream.controller');
const router = express.Router();



/**
 * @swagger
 * /live/rtc/{channel}/{role}/{tokentype}/{uid}:
 *   get:
 *     description: Generate Agora RTC Token
 *     tags: [LIVESTREAMING]
 *     parameters:
 *       - name: channel
 *         in: path
 *         required: true
 *         type: string
 *       - name: role
 *         in: path
 *         required: true
 *         type: string
 *       - name: tokentype
 *         in: path
 *         required: true
 *         type: string
 *       - name: uid
 *         in: path
 *         required: true
 *         type: string
 *       - name: expiry
 *         in: query
 *         type: integer
 *     responses:
 *       200:
 *         description: A successful response with the generated RTC token
 *         content:
 *           application/json:
 *             example:
 *               rtcToken: 'your_generated_token'
 *       500:
 *         description: An error response with the error details
 *         content:
 *           application/json:
 *             example:
 *               error: 'Error details'
 */


router.get('/rtc/:channel/:role/:tokentype/:uid',  generateRTCToken);



module.exports = router;