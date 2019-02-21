// Set environment variables
require('dotenv').config();

var JwtStrategy = require('passport-jwt').Strategy;
var Users = require('../models').Users;

module.exports = function(passport) { // Set strategy for Passport

// Extract JWT
var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }
    return token;
};

var opts = {};
opts.jwtFromRequest = cookieExtractor; // JWT from cookie
opts.secretOrKey = process.env.SECRET;
passport.use(new JwtStrategy(opts, function(jwt_payload, done){
    Users.findOne({
        where: {
            username: jwt_payload.data.username
        }
    }).then(function (user) {
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));
}
