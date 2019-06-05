const dbconfig = require('./config/database');
const mysql = require('mysql');
const connection = mysql.createConnection(dbconfig.connection);
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

const port = process.env.PORT || 3000;

const passport = require('passport');
const flash = require('connect-flash');

require('./config/passport')(passport);


app.use(bodyParser.urlencoded({
    extended: true
})) // used to convert our server responses to JSON format

app.use(bodyParser.json()); // instantiating the json() method.
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

// require password

app.use(session({
    secret: 'hacode',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize()); // initialize passport' middleware
app.use(passport.session({
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    }})); // this helps us persist our login data in our session object
app.use(flash()); // flash messages

require('./app/routes')(app, passport); // to load routes and pass them to our main app

app.listen(port);

console.log(`server running on port ${port}`);


