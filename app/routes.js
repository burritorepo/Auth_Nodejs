const dbconfig = require('../config/database');
const mysql = require('mysql');
const connection = mysql.createConnection(dbconfig.connection);
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

app.use(cookieParser());

module.exports = function (app, passport) {
    app.get('/', isLoggedIn, function (req, res) {
        const row = [];
        connection.query(`select * from accounts where id=${req.user.id}`, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (let i = 0, length = rows.length; i < length; i++) {
                        row[i] = rows[i]; //Check all the values of the row, and save the values in an array
                    }
                }
                console.log(row);
            }
            res.render('index.ejs', { rows: row }); // user data in an array, it is sent to our view index.ejs
        });
    });

    app.get('/login', function (req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.get('/signup', function (req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/login',
        failureRedirect: '/signup',
        failureFlash: true
    })); // with passport.authenticate we call our strategies

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }), function (req, res) {
        console.log("saving data to user's session");
        if (req.body.remember) {
            req.session.cookie.maxAge = 1000* 60 * 60 *24 * 365; // we are creating the cookie with some expiration time
        } else {
            res.session.cookie.expires = false; // Cookie expires at end of session
        }
        res.redirect('/');}
);
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};