const express = require('express')
const maincontroller = require('../controllers/mainController');
const tradecontroller = require('../controllers/tradeController');
const router = express.Router();

router.get('/about',maincontroller.about);

router.get('/contact',maincontroller.contact);



module.exports = router;