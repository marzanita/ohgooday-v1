// Dev dependencies
var browserSync = require('browser-sync');

// Dependencies
var express = require('express');
var sassMiddleware = require('node-sass-middleware');
var app = express();
var exphbs = require('express-handlebars');
var path = require('path'); // This package ships with Node.js
var port = process.env.PORT || 3200;
var dev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined; // dev is true on development environment and false in production environment
var morgan = require('morgan');
app.use(morgan('dev'));

// Auth code
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// Use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Initialize passport
app.use(passport.initialize());
// Bring passport strategy
require('./database/config/passport.config')(passport); // Pass Passport configuration
app.use(cookieParser(process.env.USERCOOKIESECRET));

// Setup SASS. Recompile .sass files automatically
app.use(sassMiddleware({
    // Options
    src: path.join(__dirname, './public/sass'),
    dest: path.join(__dirname, './public/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

// Set public dir
app.use(express.static(path.join(__dirname,'./public')));
// Configure handlebars (view engine)
app.engine('.hbs', exphbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
// Routes dir
app.use(require('./app/routes'));

app.listen(port, listening);

if (dev) {
    console.log('The app is currently running in ' + 'development' + ' mode.');
} else {
    console.log('The app is currently running in ' + 'production' + ' mode.');
}

function listening() {
    if (dev) {
        // Setup browser-sync
        browserSync ({
            proxy: 'localhost:' + port,
            files: ['public/pages', 'public/sass', 'views'],
            open: false // Do not open a new tab on browser after reloading    
        });
    } else {
        console.log('App is listening on port:', port);
    }
}