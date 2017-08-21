// config/passport.js

// 인증 정보
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var NaverStrategy    = require('passport-naver').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var jwt = require('jwt-simple');


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

    // 카카오 로그인
    passport.use(new KakaoStrategy({
            clientID: configAuth.kakaoAuth.clientID,
            callbackURL: configAuth.kakaoAuth.callbackURL,
          //  profileFields   : ['id', 'name', 'email'],
        },
        function(token, refreshToken, profile, done) {
            User.findOne({'userid': profile.id}, function(err, user) {
                if (err)
                      return done(err);
                if (user) {
                      return done(null, user); // user found, return that user
                } else {
                      console.log('kakao profile=', profile);
                      console.log('kakao profile=', profile._json.properties.profile_image);
                      var newUser         = new User();
                      newUser.userid    = profile.id;
                      newUser.token     = token;
                      newUser.name      = profile.username;
                      newUser.myprof_img = profile._json.properties.profile_image;
                      newUser.save(function(err) {
                          if (err)
                              throw err;
                          return done(null, newUser);
                      });
                }
            });
        }
    ));

    // 네이버 로그인
    passport.use(new NaverStrategy({
            clientID: configAuth.naverAuth.clientID,
            clientSecret: configAuth.naverAuth.clientSecret,
            callbackURL: configAuth.naverAuth.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                // @todo Remove necessary comment
                console.log("profile=");
                //console.log(profile);
                // data to be saved in DB
                user = {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.displayName,
                    provider: 'naver',
                    naver: profile._json
                };
                console.log("user=", user);
                //console.log(user);
                return done(null, profile);
            });
        }));

    // 페이스북 로그인
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id', 'name', 'email', 'photos'],
        },
    function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOne({ 'userid' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    console.log('facebook profile=', profile);
                    var newUser            = new User();
                    newUser.userid    = profile.id;
                    newUser.token = token;
                    newUser.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.email = profile.emails[0].value || null;
                    newUser.myprof_img = profile.photos[0].value;
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
           User.findOne({ 'email' :  email }, function(err, user) {

               if (err)
                   return done(err);

               if (!user)
                   return done(null, false, req.flash('loginMessage', '아이디가 없습니다.'));


               if (!user.validPassword(password))
                   return done(null, false, req.flash('loginMessage', '비밀번호가 틀렸습니다.'));

               return done(null, user);
           });

       }));

    // 회원가입
    passport.use('local-signup', new LocalStrategy({

        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        process.nextTick(function() {
        User.findOne({ 'email' :  email }, function(err, user) {
            if (err)
                return done(err);
            if (user) {
                return done(null, false, req.flash('signupMessage', '회원가입이 되어 있는 이메일입니다.'));
            } else {
                var newUser      = new User();
                newUser.email    = email;
                newUser.password = newUser.generateHash(password);
                newUser.phone_number   = req.body.phone_number;
                newUser.name     = req.body.name;
                newUser.token    = jwt.encode(email, configAuth.jwt_secret);
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