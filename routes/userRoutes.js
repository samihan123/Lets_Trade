const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn,isNotAuthor} = require('../middlewares/auth');
const {logInLimiter} = require('../middlewares/rateLimiters')
const {validateSignUp,validateLogIn,validateResult} = require('../middlewares/validator')
const router = express.Router();

//GET /users/new: send html form for creating a new user account
router.get('/new', isGuest, controller.new);

//POST /users: create a new user account

router.post('/',isGuest,validateSignUp,validateResult, controller.create);

//GET /users/login: send html for logging in
router.get('/login',isGuest, controller.getUserLogin);

//POST /users/login: authenticate user's login
router.post('/login',logInLimiter, isGuest,validateLogIn,validateResult, controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

//POST /users/logout: logout a user
router.get('/logout', isLoggedIn, controller.logout);

//POST /users/:id/watch: add to watchlist
router.post('/:id/watch',isLoggedIn,isNotAuthor,controller.addToWatch);

//POST /users/:id/watch: add to watchlist
router.post('/:id/unwatch',isLoggedIn,isNotAuthor,controller.removeFromWatch);

module.exports = router;