// Grab dependencies
var passport = require('passport');

// Middleware to make sure a user is logged in
module.exports = passport.authenticate('jwt', { 
                    session: false,
                    failureRedirect: '/login' // Redirect if authentication fails
                }); 