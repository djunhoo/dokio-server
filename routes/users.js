module.exports= function (passport) {
	var express = require('express');
	var User    = require('../models/users');
	var formidable = require('formidable');
	var AWS = require('aws-sdk');
	var router = express.Router();
	var s3 = new AWS.S3();




	router.get('/', function(req, res) {
		res.render('index', {title: '메인페이지'});
	});

	router.get('/memo/write', function(req, res, next) {
		res.locals.login = req.isAuthenticated();
		console.log('req.user=', req.user);
		res.render('users/memowrite', {title: '메모 작성', user: req.user });
	});

	router.post('/memo/write', function(req, res, next) {
		user_id = req.body.user_id;
		var content = req.body.content;
		var memoObj = {
			content: content,
			regdate: Date.now()
		};
		User.findByIdAndUpdate({_id:user_id}, {$push: {"memos": memoObj}}, {safe: true, upsert: true, new: true}, function(err, doc) {
				if(err) return next(err);
				res.locals.login = req.isAuthenticated();
				console.log('user=', doc);
				res.render('users/memo', {title: "메모 조회", user:req.user});
		});
	});

	// 카카오 인증
	router.get('/auth/kakao', passport.authenticate('kakao', function(req, res) {
		console.log('/auth/kakao failed, stopped');
	}));
	router.get('/auth/kakao/callback',
	        passport.authenticate('kakao', {
	        	successRedirect : '/',
	        	failureRedirect : '/users/login',
	}));

	// 네이버 인증
	router.get('/auth/naver',
		passport.authenticate('naver', null), function(req, res) { // @todo Additional handler is necessary. Remove?
	    	console.log('/auth/naver failed, stopped');
	    });

	// creates an account if no account of the new user
	router.get('/auth/naver/callback',
		passport.authenticate('naver', {
	        failureRedirect: '#!/auth/login'
	    }), function(req, res) {
	    	res.redirect('/');
	    });

	// 페이스북 인증 라우터

	router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));
	router.get('/auth/facebook/callback',
	        passport.authenticate('facebook', {
	        	successRedirect : '/',
	        	failureRedirect : '/users/login',
	}));

	// 로컬-로그인 인증 라우터

	router.get('/login', function (req, res) {
	    res.render('users/newlogin', { message: req.flash('loginMessage'), title:'로그인' });
	});

	router.post('/login', passport.authenticate('local-login', {
	        successRedirect : '/',
	        failureRedirect : '/users/login',
	        failureFlash : true // allow flash messages
	}));

	// 프로필 라우터

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

	router.post('/edit', function(req, res, next) {
		console.log('수정 파라미터=', req.body);
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			console.log('files=', files)
			var params = {
				Bucket: 'dokio2',
				Key: files.userfile.name,
				ACL:'public-read',
				Body: require('fs').createReadStream(files.userfile.path)
			};
			s3.upload(params, function(err, data) {
				if(err) {
					console.log('err=', err);
				}
				else {
					var form_data = {
						phone_number     : fields.phone_number,
						myprof_img       : data.Location
					};
					console.log('form_data=', form_data);
					User.update({ _id: req.user._id }, form_data, function(err, doc) {
							if(err) return next(err);
							res.locals.login = req.isAuthenticated();
							console.log('user=', doc);
							res.render('users/mypage', {title: "내 정보 조회", user:req.user});
					});
				}
			});
		});
	});

	router.get('/edit/:user_id', function(req, res, next) {
		console.log('hi li');
		if (req.isAuthenticated())
		{
			user_id = req.params.user_id;
			User.findOne({_id: user_id}, function(err, user) {
				res.locals.login = req.isAuthenticated();
				console.log('user=', user);
				res.render('users/edit', {title: "내 정보 수정", user:user});
			});
		} else {
			res.redirect('/users/login');
		}
	});



	router.get('/memo', function(req, res, next) {
		if (req.isAuthenticated())
		{
			console.log('req.user=', req.user);
			res.locals.login = req.isAuthenticated();
			res.render('users/memo', {title: "메모", user:req.user});
		} else {
			res.redirect('/users/login');
		}
	});


	router.get('/:user_id', function(req, res, next) {
		if (req.isAuthenticated())
		{
			user_id = req.params.user_id;
			User.findOne({_id: user_id}, function(err, user) {
				res.locals.login = req.isAuthenticated();
				console.log('user=', user);
				res.render('users/mypage', {title: "내 정보 조회", user:user});
			});
		} else {
			res.redirect('/users/login');
		}
	});

	router.get('/json/:user_id', function(req, res, next) {
		if (req.isAuthenticated())
		{
			user_id = req.params.user_id;
			User.findOne({_id: user_id}, function(err, user) {
				res.locals.login = req.isAuthenticated();
				console.log('user=', user);
				res.json({
					success_code: 1,
					message: "성공",
					result: {
						user: user
					}
				});
			});
		} else {
			res.redirect('/users/login');
		}
	});



	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/users/login');
	}

	return router;
}
