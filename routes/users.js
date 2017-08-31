module.exports= function (passport) {
	var express = require('express');
	var User    = require('../models/users');
	var formidable = require('formidable');
	var AWS = require('aws-sdk');
	var router = express.Router();
	var petModel = require('../models/pet').petModel;
	var PetCategory = require('../models/petcategory').petcategoryModel;
	var memoModel = require('../models/memo').memoModel;
	var jwt = require('jwt-simple');
	var configAuth = require('../config/auth');
	var multer = require('multer');
	var multerS3 = require('multer-s3');
	var fs = require('fs');
	var s3 = new AWS.S3();
	var moment = require('moment-timezone');
	var upload = multer({
	    storage: multerS3({
	        s3: s3,
	        bucket: 'dokio2',
	        key: function (req, file, cb) {
	            console.log(file);
	            cb(null, Date.now().toString() + file.originalname); //use Date.now() for unique file keys
	        }
	    })
	});

	function regDateTime(){
	    // lang:ko를 등록한다. 한번 지정하면 자동적으로 사용된다.
	    moment.locale('ko', {
	        weekdays: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
	        weekdaysShort: ["일","월","화","수","목","금","토"],
	    });

	    var m = moment().tz('Asia/Seoul');
	    var output = m.format("YYYY년MM월DD일 dddd HH:mm:ss ");
	    return output;
	}

	router.get('/', function(req, res) {
		res.render('index', {title: '메인페이지'});
	});
	router.get('/pet/:pet_id', function(req, res, next){
		console.log('token=', req.body.token);
		var decoded_email = jwt.decode(req.body.token, configAuth.jwt_secret);
		User.find({email: decoded_email},{pets: true}, function(err, user) {
			if(err) next(err);
			if(user) {
				res.json({
					success_code: 1,
					result: user
				});
			} else {
				res.json({
					success_code: 0,
					message: "사용자를 찾을수 없습니다.",
					result: null
				});
			}

		});
	});

	router.post('/pet/write', upload.single('pet_file') ,function(req, res, next) {
		console.log('token=', req.query.token);
		console.log('file=', req.file);
		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		console.log('decoded_email=', decoded_email);
		var location;
		if(req.file) {
			location = req.file.location;
		}
		User.findOne({email: decoded_email}, function(err, user) {
			var pet = new petModel({
				name: req.query.pet_name,
				age: req.query.pet_age,
				sex: req.query.pet_sex,
				weight: req.query.pet_weight,
				pet_img: location
			});
			user.pets.push(pet);
			user.save(function(err, user){
				if(err) next(err);
				if(user){
					res.json({
						success_code: 1,
						result: user
					})
				} else
				res.json({
					success_code: 0,
					message: "반려견 등록 실패",
					result: null
				});
			});
		})
	});

	router.post('/pet/delete', function(req, res, next) {
		console.log('token=', req.query.token);
		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		console.log('decoded_email=', decoded_email);
		User.update({email: decoded_email}, {$pull: {pets: {_id: req.query.pet_id}}}, function(err, user) {
				if(user) {
					res.json({
						success_code: 1,
						result: null
					});
				} else {
					res.json({
						success_code: 0,
						message: "반려견 삭제 실패",
						result: null
					});
				}

			});

	});

//pet update
	router.post('/pet/update', upload.single('pet_file'), function(req, res, next) {
		console.log('token=', req.query.token);
		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		console.log('decoded_email=', decoded_email);
		var location;
		if(req.file) {
			location = req.file.location;
		}
		var name = req.query.pet_name;
		var age = req.query.pet_age;
		var sex = req.query.pet_sex;
		var weight = req.query.pet_weight;


		User.update({email: decoded_email, "pets._id": req.query.pet_id}, {$set:{"pets.$.name": name, "pets.$.age": age, "pets.$.sex": sex, "pets.$.weight": weight, "pets.$.pet_img":location}}, function(err, user) {

				if(user) {
					res.json({
						success_code: 1,
						result: null
					});
				} else {
					res.json({
						success_code: 0,
						message: "반려견 삭제 실패",
						result: null
					});
				}
				// });
			});

	});


	router.post('/memo/write', function(req, res, next) {
		console.log('token=', req.query.token);
		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		console.log('decoded_email=', decoded_email);

		User.findOne({email: decoded_email}, function(err, user) {
				var memo = new memoModel({
					content: req.query.memo_content,
					date: regDateTime()
				});
				user.memos.push(memo);
						user.save(function(err, user){
							if(err) next(err);
							if(user) {
							res.json({
								success_code: 1,
								result: user
							});
						} else {
							res.json({
							    success_code: 0,
							    message: "메모 작성 실패",
							    result: null
						})

				}
				});
		});
	});

	router.post('/memo/delete', function(req, res, next) {
		console.log('token=', req.query.token);
		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		console.log('decoded_email=', decoded_email);
		User.update({email: decoded_email}, {$pull: {memos: {_id: req.query.memo_id}}}, function(err, user) {
			if(user) {
				res.json({
					success_code: 1,
					result: null
				});
			} else {
				res.json({
					success_code: 0,
					message: "메모 삭제 실패",
					result: null
				});
			}

			});

	});

	router.post('/memo/update', function(req, res, next) {
		console.log('token=', req.query.token);
		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		console.log('decoded_email=', decoded_email);

		var content = req.query.memo_content;

		User.update({email: decoded_email, "memos._id": req.query.memo_id}, {$set:{"memos.$.content": content}}, function(err, user) {

			if(user) {
				res.json({
					success_code: 1,
					result: null
				});
			} else {
				res.json({
					success_code: 0,
					message: "메모 삭제 실패",
					result: null
				});
			}
			});
	});

	router.get('/memo/list', function(req, res, next) {

		console.log('token=', req.query);
		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		User.find({email:decoded_email}, '-password -__v').populate('memos').exec(function(err, user) {
			if(err) next(err);
			console.log('user = ', user)
			if(user) {
				res.json({
					success_code: 1,
					result: user

				});
			} else {
				res.json({
					success_code: 0,
					message: "메모를 찾을수 없습니다.",
					result: null
				});
			}

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

    router.get('/login_success', function(req, res, next) {
        console.log('success_user=', req.user);
        res.json({

        });
    });

    router.get('/login_failed', function(req, res, next) {
       console.log('user=', req.user);
       res.json({
            success_code: 0,
            message: req.flash('loginMessage')[0],
            result: null
       });
    });

    router.post('/login', passport.authenticate('local-login', {
            failureRedirect: '/users/login_failed',
            failureFlash: true
          }), function(req, res) {
          if(!req.user) {
            console.log('실패');
            res.json({
                 about:1
            });
          } else {
          res.json({
             success_code:1,
             result: {
                token:req.user.token
             }
          });
          }
	});

	// 프로필 라우터

	router.get('/mypage/:token', function(req, res) {
		console.log('token=', req.params.token);
		var decoded_email = jwt.decode(req.params.token, configAuth.jwt_secret);
		console.log('decoded_email=', decoded_email);
		User.findOne({email: decoded_email}, function(err, user) {
			console.log('user=', user);
		        if (err)
				    console.log('err=', err);
				if (user) {
				    // 마이페이지 정보
				    res.json({
				    	success_code: 1,
				    	result: {
				    		user: user
                         }
				    });
				} else {
				    res.json({
				    	success_code: 0,
				    	message: "토큰이 잘못됬거나 User가 없습니다.",
				    	result: null
				    });
				}
		});
	});


	router.get('/mypage/update/:token', function(req, res) {
			console.log('token=', req.params.token);
			var decoded_email = jwt.decode(req.params.token, configAuth.jwt_secret);
			console.log('decoded_email=', decoded_email);
			User.findOne({email: decoded_email}, function(err, user) {
				console.log('user=', user);
			        if (err)
					    console.log('err=', err);
					if (user) {
					    // 마이페이지 정보
					    res.json({
					    	success_code: 1,
					    	result: {
					    		user: user
	                         }
					    });
					} else {
					    res.json({
					    	success_code: 0,
					    	message: "토큰이 잘못됬거나 User가 없습니다.",
					    	result: null
					    });
					}
			});
	});

	router.get('/mypage/:token/pet', function(req, res) {
			var decoded_email = jwt.decode(req.params.token, configAuth.jwt_secret);
			console.log('decoded_email=', decoded_email);
			User.findOne({email: decoded_email}, function(err, user) {
				console.log('user=', user);
			        if (err)
					    console.log('err=', err);
					if (user) {
					    // 마이페이지 정보
					    res.json({
					    	success_code: 1,
					    	result: {
					    		pet: user.pet
	                         }
					    });
					} else {
					    res.json({
					    	success_code: 0,
					    	message: "토큰이 잘못됬거나 User가 없습니다.",
					    	result: null
					    });
					}
			});
	});


	router.get('/signup', function (req, res) {
	    res.render('users/joinform', { message: req.flash('signupMessage'), title:'로그인' });
	});
	router.get('/newsignup', function (req, res) {
	    res.render('users/newsignup', { message: req.flash('signupMessage'), title:'회원가입' });
	});

    router.get('/success_signup', function(req, res, next) {
	    res.json({
            success_code:1,
            result: null
        });
	});

    router.get('/failed_signup', function(req, res, next) {
        res.json({
            success_code:0,
            message: req.flash('signupMessage')[0],
            result: null
        });
    });

    router.post('/signup', passport.authenticate('local-signup', {
	        successRedirect : '/users/success_signup',
	        failureRedirect : '/users/failed_signup',
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

/*
var params = {
	Bucket: 'dokio2',
	Key: files.petfile.name,
	ACL:'public-read',
	Body: require('fs').createReadStream(files.petfile.path)
};*/


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
		PetCategory.find({}, function (err, doc) {
			if(err) next(err);
			if (req.isAuthenticated())
			{
				user_id = req.params.user_id;
				User.findOne({_id: user_id}, function(err, user) {
					res.locals.login = req.isAuthenticated();
					console.log('user=', user);
					res.render('users/mypage', {title: "내 정보 조회", user:user, categorys: doc});
				});
			} else {
				res.redirect('/users/login');
			}
			});
	});

	router.post('/dokio/favorite', function(req, res, next) {

		console.log('token=', req.query.token);

		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		User.update({email: decoded_email}, {$addToSet: {favorites: req.query.dokio_id}}, function(err, user) {
			if(err) next(err);
			console.log('user = ', user)

			if(user) {
				res.json({
					success_code: 1,
					result: null
				});
			} else {
				res.json({
					success_code: 0,
					message: "즐겨찾기 추가 실패",
					result: null,
				});
			}

		});

	});

	router.get('/dokio/favorite_list', function(req, res, next) {

		console.log('token=', req.query);
		console.log('token=', req.body);
		// console.log('token=', req.body);


		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		User.find({email:decoded_email}, '-password').populate('favorites', '-__v -price -events -rule -like_count -reviews -times -services -petcategories -category').exec(function(err, user) {
			if(err) next(err);
			console.log('user = ', user)
			if(user) {
				res.json({
					success_code: 1,
					result: user

				});
			} else {
				res.json({
					success_code: 0,
					message: "즐겨찾기를 찾을수 없습니다.",
					result: null,
				});
			}

		});
	});

	router.post('/dokio/favorite_delete', function(req, res, next) {

		console.log('token=', req.query.token);

		var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
		User.update({email: decoded_email}, {$pull: {favorites: req.query.dokio_id}}, function(err, user) {
			if(err) next(err);
			console.log('user = ', user)

			if(user) {
				res.json({
					success_code: 1,
					result: null
				});
			} else {
				res.json({
					success_code: 0,
					message: "즐겨찾기 삭제 실패",
					result: null,
				});
			}

		});

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
