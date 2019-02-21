var express = require('express');
var router = express.Router();
var mainController = require('./controllers/main.controller');
var isLoggedIn = require('./middleware/checklogin');
var notFound404 = require('./middleware/notfound404');

module.exports = router;

// Setup routes
router.get('/', mainController.home);
router.get('/login', mainController.login);
router.get('/logout', mainController.logout);
router.get('/myplants', isLoggedIn, mainController.myplants);
router.route('/addreminder')
    .get(isLoggedIn, mainController.addReminder)
    .post(isLoggedIn, mainController.processReminder);
router.get('/delete/:id', isLoggedIn, mainController.deleteReminder);
router.route('/contact')
    .get(mainController.contact)
    .post(mainController.sendEmail);
router.post('/register', mainController.register); // Register new user and store hashed password
router.post('/authenticate', mainController.authenticate); // Authenticate user
router.use(notFound404);