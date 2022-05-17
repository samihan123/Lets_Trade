const express = require('express')
const maincontroller = require('../controllers/mainController');
const tradecontroller = require('../controllers/tradeController');
const router = express.Router();

const {isLoggedIn,isAuthor,isNotAuthor} = require('../middlewares/auth');
const {validateId,validateTrade,validateResult} = require('../middlewares/validator');

router.get('/newTrade',isLoggedIn,tradecontroller.newTrade);


router.get('/trade',tradecontroller.trade);


router.get('/trades',tradecontroller.trades);

//create a new item
router.post('/trades',isLoggedIn,validateTrade,validateResult,tradecontroller.create)

//create filter
router.get('/trades-filter',tradecontroller.filter)


//GET /stories/:id send detail of item indentified by id
router.get('/:id',validateId,tradecontroller.show);

//GET /trade/:id/edit: send html form for editting an existing item
router.get('/:id/edit',validateId,isLoggedIn, isAuthor, tradecontroller.edit);

//PUT /trade/:id update the item identified by id
router.put('/:id',validateId,isLoggedIn, isAuthor,validateTrade,validateResult, tradecontroller.update);

//delete /stories/:id , delete the item identified by id
router.delete('/:id',validateId, isLoggedIn, isAuthor,tradecontroller.delete);

//id would be of trader
router.post('/:id/giveoffer',validateId,isLoggedIn,isNotAuthor,tradecontroller.giveoffer)

//give the trade offer
router.post('/:id/tradeoffer',validateId,isLoggedIn,isAuthor,tradecontroller.tradeoffer)

//give the manage trade offer
router.post('/:id/managetrade',validateId,isLoggedIn,isAuthor,tradecontroller.managetrade)

//give the accept trade offer
router.post('/:id/accepttrade',validateId,isLoggedIn,isAuthor,tradecontroller.accepttrade)

//give the cancel trade offer
router.post('/:id/rejecttrade',validateId,isLoggedIn,isAuthor,tradecontroller.rejecttrade)

//give the trade offer
router.post('/:id/canceloffer',validateId,isLoggedIn,tradecontroller.cancelOffer)
module.exports = router;