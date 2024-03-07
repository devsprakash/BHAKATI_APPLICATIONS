const express = require('express');
const { templeLogin, logout , getTempleProfile } = require('../controller/Temple.controller');
const router = express.Router();



/**
 * @swagger
 * /guru/temple/login:
 *   post:
 *     summary: Temple Login
 *     description: Endpoint for temple login.
 *     tags: [TEMPLE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             password: "+1234567890"
 *             email: "examplePassword@gmail.com"
 *     responses:
 *       '200':
 *         description: Temple logged in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Temple logged in successfully
 */

router.post('/login' , templeLogin);

/**
 * @swagger
 * /guru/temple/logout:
 *   post:
 *     summary: Temple Logout
 *     description: Endpoint for temple login.
 *     tags: [TEMPLE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             templeId: "1234567890"
 *     responses:
 *       '200':
 *         description: Temple logout in successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Temple logout in successfully
 */

router.post('/logout' , logout);
router.get('/getTempleProfile/:templeId' , getTempleProfile)



module.exports = router;


