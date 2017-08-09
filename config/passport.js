// config/passport.js

// 인증 정보
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// 사용자 모델
var User            = require('../models/users');

var configAuth = require('./auth');

// App.Exports
module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // 페이스북 로그인
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id', 'name', 'email'],
        },
    function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    var newUser            = new User();
                    newUser.facebook.id    = profile.id;
                    newUser.facebook.token = token;
                    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.facebook.email = profile.emails[0].value || null;
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    // 로컬 로그인
    passport.use('local-login', new LocalStrategy({
           usernameField : 'email',
           passwordField : 'password',
           passReqToCallback : true
       },
       function(req, email, password, done) {
           User.findOne({ 'local.email' :  email }, function(err, user) {

               if (err)
                   return done(err);

               if (!user)
                   return done(null, false, req.flash('loginMessage', '아이디가 없습니다.'));


               if (!user.validPassword(password))
                   return done(null, false, req.flash('loginMessage', '비밀번호가 틀렸습니다.'));

               return done(null, user);
           });

       }));


    passport.use('local-signup', new LocalStrategy({

        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        process.nextTick(function() {
        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err);
            if (user) {
                return done(null, false, req.flash('signupMessage', '회원가입이 되어 있는 이메일입니다.'));
            } else {
                var newUser            = new User();
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.address        = req.body.address;
                newUser.name           = req.body.name;
                console.log('newUser=', newUser);
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

        });

    }));

};
