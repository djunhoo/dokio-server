module.exports= function (passport) {
	var express = require('express');
	var User    = require('../models/users');
	var router = express.Router();


	router.get('/', function(req, res) {
		res.render('index', {title: '메인페이지'});
	});

	router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

	  // handle the callback after facebook has authenticated the user
	router.get('/auth/facebook/callback',
	        passport.authenticate('facebook', {
	        	successRedirect : '/users/profile',
	        	failureRedirect : '/'
	}));

	router.get('/login', function (req, res) {
	    res.render('users/newlogin', { message: req.flash('loginMessage'), title:'로그인' });
	});

	router.get('/profile', isLoggedIn, function(req, res) {
		console.log('req.user=', req.user);
		User.findOne({_id: req.user._id}, function(err, doc) {
			if(err) console.log(err);
			console.log('doc_user=', doc);
			res.render('users/profile', {
			    user : doc
			});
		});
	});

	router.post('/login', passport.authenticate('local-login', {
	        successRedirect : '/users/profile',
	        failureRedirect : '/users/login',
	        failureFlash : true // allow flash messages
	}));

	router.get('/signup', function (req, res) {
	    res.render('users/joinform', { message: req.flash('signupMessage'), title:'로그인' });
	});
	router.get('/newsignup', function (req, res) {
	    res.render('users/newsignup', { message: req.flash('signupMessage'), title:'회원가입' });
	});

	router.post('/signup', passport.authenticate('local-signup', {
	        successRedirect : '/users/login',
	        failureRedirect : '/users/newsignup',
	        failureFlash : true
	}));
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}

	return router;
}
