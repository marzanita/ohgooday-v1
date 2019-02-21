// Grab dependencies
var Users = require('../../database/models').Users;
var Reminders = require('../../database/models').Reminder;
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var nodemailer = require('nodemailer');
var validator = require('validator');

module.exports = {
    home: home,
    login: login,
    myplants: myplants,
    contact: contact,
    sendEmail: sendEmail,
    logout: logout,
    register: register,
    authenticate: authenticate,
    addReminder: addReminder,
    deleteReminder: deleteReminder,
    processReminder: processReminder
}

// Global variables
var loggedInUser;
var phoneList = [];
var reminderId = "";
var textFrequency = "";

function home (req, res) {
    if (loggedInUser) {
       res.render('./home', {
           layout: 'layout.hbs',
           username: loggedInUser
        }); 
    } else {
        res.render('./home', {
            layout: 'layout.hbs'
        });
    }
}

function login (req, res) {
    res.render('./login');
}

function myplants (req, res) {

    loggedInUser = req.user.username;

    Reminders.findAll({
        limit: 5,
        where: {
            username: loggedInUser
        }
    }).then(function(plantData) {   
        res.render('./myplants', {
        username: loggedInUser,
        plantName: plantData
        });
    });
}

function addReminder (req, res) {
    res.render('./addreminder', {
        username: loggedInUser
    });
}

function processReminder (req, res) {
    Reminders.findAll({
        where: {
            username: loggedInUser
        }
    }).then(function(plantData) { 
        if (plantData.length > 5 && loggedInUser !== undefined) {
            res.send('Sorry, you have reached the maximum number of entries!');
        } else {
            contProcess();
        }
    });

    var formData = req.body;
    var formatPhoneNum = formData.phoneNumber.replace(/-/g, ""); // Remove dashes from phone number so npm validator can validate it
    var phoneNumber = validator.isMobilePhone(formatPhoneNum, 'en-US');  
    var minutesNotify = validator.isNumeric(formData.time);
    var plantName = validator.isAlpha(formData.plant);
    var nextReminder = moment().tz('America/New_York').add(formData.time, 'days').format('MMMM Do YYYY [at] h:mm a');

    var contProcess = function() {
        if (phoneNumber && minutesNotify && plantName && loggedInUser !== undefined) {
            Reminders.create({
                username: loggedInUser,
                plantName: formData.plant,
                startDate: moment().tz('America/New_York').format('MMMM Do YYYY [at] h:mm a'),
                textDate: nextReminder,
                minutesNotify: formData.time,
                phoneNum: formatPhoneNum
            }).then(function(){ 
                twilioNewPlant();  
                res.redirect('/myplants');
            });

        // Twilio welcome text message
        function twilioNewPlant() {
            var accountSid = process.env.ACCOUNTSID;
            var authToken = process.env.AUTHTOKEN;
            var client = require('twilio')(accountSid, authToken);
            
            client.messages.create({
                body: "Great, " + loggedInUser + "!" + " We're now keeping track of your " + formData.plant + "." + " Your next reminder will be sent on " + nextReminder + ".",
                to: '+1' + formatPhoneNum,  // Text this number
                from: '+14075054428' // From a valid Twilio number
            },
                function(err, message){
                    if (err) {
                        console.log(err);
                    }
                });
        };
        } else {
            res.send('Sorry, your form contains invalid data!');
        }
    }
}

function deleteReminder (req, res) {
    Reminders.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(result){
        console.log("This is the result: ", result)
        result.destroy();
        res.redirect('/myplants');
    });
}

function contact (req, res) {
    res.render('./contact', {
        username: loggedInUser
    });
}

// Logout
function logout (req, res) {
    loggedInUser = ""; // Remove username from variable so Logout link is removed
    res.clearCookie('jwt'); // Delete cookie containing JWT
    res.redirect('/');
}

// Register the user and save hashed password
function register(req, res) {
    var user = [];
    if(!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please enter an user and password to register.'});
    } else {
            Users.findAll({
            where: {
                username: req.body.username
            }
        }).then(function(user){
            if (user.length === 0){
                // Create the user's hashed password
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        return next(err);
                    }
                    bcrypt.hash(req.body.password, salt, function(err, hash){
                        if (err) {
                            return next(err);
                        }
                        // Save username and hashed password to database
                        Users.create({
                            username: req.body.username,
                            password: hash
                        }).then(
                            res.json({success: true, message: 'Successfully created new user'})
                            )
                    });
                });
            } else {
                return res.json({success: false, message: 'That user already exists.'});
                }     
          });
    }
}

// Create a JWT if the user exists and password match is ok
function authenticate(req, res) {
    Users.findOne({
        // Check if username matches
        where: { 
            username: req.body.username
        }
    }).then(function (user) {
        if (!user) { // Checks for user type error
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else {
            // Check if password matches
            bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
                // If there is a match and there is no error then create token
                if (isMatch && !err) {
                    var token = jwt.sign( {data: user}, process.env.SECRET, { // encode with SECRET
                        expiresIn: 3600000 // Expires in 1 hour
                    });
                    res.cookie('jwt', token, { maxAge: 3600000, httpOnly: true });   // Expires in 1 hr
                                                                                     // Add 'secure: true' when ready to deploy. Express will only send cookie to HTTPS endpoints.
                    res.redirect('/myplants');
                } else {
                    res.send({ success: false, message: 'Authentication failed. Passwords did not match.'});
                }
            });
        }
    });
}

// Continuously check for text messages to send
setInterval(function sendTexts() {
    Reminders.findAll({
        where: {
            textDate: moment().tz('America/New_York').format('MMMM Do YYYY [at] h:mm a')
        }
    }).then(function(phoneNumber){   
        for(let i = 0; i < phoneNumber.length; i++) {
            let toSendPhone = phoneNumber[i].dataValues.phoneNum;
            let toSendUser = phoneNumber[i].dataValues.username;
            let toSendPlant = phoneNumber[i].dataValues.plantName;
            reminderId = phoneNumber[i].dataValues.id;
            textFrequency = phoneNumber[i].dataValues.minutesNotify;
            phoneList.unshift([toSendPhone, toSendUser, toSendPlant, reminderId]);
            twilio();
        }
    });
}, 3600000); // Run every 1 hour

// Twilio reminders
function twilio() {
    var accountSid = process.env.ACCOUNTSID;
    var authToken = process.env.AUTHTOKEN;
    var client = require('twilio')(accountSid, authToken);
    
    client.messages.create({
        body: "Hello, " + phoneList[0][1] + "! " + "Please water your " + phoneList[0][2] + ".",
        to: '+1' + phoneList[0][0],  // Text this number
        from: '+14075054428' // Twilio number
    },
        function(err, message){
            if (err) {
                console.log(err);
            } else {
                // Remove first item in the array
                phoneList.shift();
                updateTime();
            }
        });
}

// Update next text time after sending current text message
function updateTime() {
    Reminders.update(
        {textDate: moment().tz('America/New_York').add(textFrequency, 'days').format('MMMM Do YYYY [at] h:mm a')},
        {where: { id: reminderId }}
        ).then(function(){   
    });
}

function sendEmail (req, res) {
    var formData = req.body;
    var formatPhoneNum = formData.phone.replace(/-/g, ""); // Remove dashes from phone number so npm validator can validate it

    (function checkValidation() {
        // Validate
        var firstName = validator.isAlpha(formData.first_name) && validator.isLength(formData.first_name, {min: 1, max: 50}); // Validate text and length
        var lastName = validator.isAlpha(formData.last_name) && validator.isLength(formData.last_name, {min: 1, max: 50}); // Validate text and length
        var emailAddr = validator.isEmail(formData.email) && validator.isLength(formData.last_name, {min: 1, max: 50}); // Validate email and length
        var phoneNum = validator.isMobilePhone(formatPhoneNum, 'en-US'); // Validate phone
        var messageCust = validator.escape(formData.message) && validator.isLength(formData.message, {min: 1, max: 10000}); // Validate ASCII and length

        if (firstName && lastName && emailAddr && phoneNum && messageCust) {
            var transporter = nodemailer.createTransport({
                service: 'zoho',
                port: 465,
                secure: true,
                auth: {
                user: 'contact@annmartinez.me',
                pass: process.env.NODEMAILERPASSWORD
                }
            });
            transporter.sendMail({
                from: '"OHGOODAY" <contact@annmartinez.me>',
                to: 'contact@annmartinez.me',
                subject: 'OHGOODAY Contact Form',
                html: '<p>' + 'Name: ' + formData.first_name + ' ' + formData.last_name + '</p>' + '<br>' + 
                    '<p>' + 'Email: ' + formData.email + '</p>' + '<br>' +
                    '<p>' + 'Phone: ' + formData.phone + '</p>' + '<br>' +
                    '<p>' + 'Message: ' + formData.message + '</p>'
            }, function(err) {
                if(err){
                    console.log(err);
                } else {
                    // console.log("The email was sent.");
                    res.sendStatus(200);
                }
            });
            res.sendStatus(200);
        } else {
            res.send('Sorry, your form contains invalid data!');
        }
    }());
}