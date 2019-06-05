// Save strategy in a local variable
const LocalStrategy = require('passport-local').Strategy;
// To access our database
const mysql = require('mysql');
// To encrypt our password
const bcrypt = require('bcrypt-nodejs');
// Load our database config
const dbconfig = require('./database');
// variable to connect our database, we pass our dbconfig object with our database details
const connection = mysql.createConnection(dbconfig.connection);

// use database, this is an sql statement
connection.query('use ' + dbconfig.database);

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id)
    });
    passport.deserializeUser(function (id, done) {
        connection.query(`select * from accounts where id ='${id}'`, function (err, rows) {
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-signup', //endpoint to create a new user
        new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            connection.query(`select * from accounts where username='${username}'`, function (err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('mensaje registro', 'this user already exists!'));
                } else {
                    // Here we save a new user to our database
                    let newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null) //we encrypt our password using bcrypt-hashSync
                    };
                    let insertQuery = "insert into accounts (username,password) values (?,?)";
                    connection.query(insertQuery, [newUserMysql.username, newUserMysql.password], function (err, rows) {
                        newUserMysql.id = rows.insertId;
                        return done(null, newUserMysql);
        
                    });
                };
            });
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            connection.query(`select * from accounts where username='${username}'`, function (err, rows) {
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('mensaje login', "This user doesn't exist"));
                }
                if (!bcrypt.compareSync(password, rows[0].password)) // compare the entered password and the encrypted password saved in our database
                    return done(null, false, req.flash('mensaje login', "The password you've entered is wrong"))
                return done(null, rows[0]);
            })
        })
    );
};

