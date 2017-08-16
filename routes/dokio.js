var express = require('express');
var router = express.Router();
var DokioModel = require('../models/dokio');
var DokioreviewModel = require('../models/dokioreview')
var DokioserviceModel = require('../models/dokioservice')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dokio/dokio', { title: 'Express' });
});

//도키오 검색 페이지
router.get('/search_list', function(req, res, next){
	DokioModel.find({}, null, {sort: {date:-1}}, function(err, docs){
		if(err) return next(err);
		// console.log('dokio list = ', docs);
		res.render('dokio/search_list', {title:'도키오 리스트', docs: docs});
		// res.json({docs:docs});
		console.log('req.user = ', req.user)
	});
});

//도키오 조회 페이지 (상세 조회 - 리뷰까지)
router.get('/:dokio_id', function(req, res, next){
	var dokio_id = req.params.dokio_id;
	// var username = req.reviews._id;
	// console.log('dokio_id = ', dokio_id)
		DokioModel.findOne({_id: dokio_id}, function(err, doc){
		// res.json({doc: doc});
		console.log('dokio_info doc = ', doc)
		// console.log('dokio_info doc _id = ', username)
		res.render('dokio/dokio_info', {title: '상세', doc: doc})
		// res.json({doc:doc})
	});
});

//도키오 즐겨찾기 페이지

//도키오 추천하는 페이지	/dokio/like POST

//리뷰 리스트
// router.get('/:dokio/review', function(req, res, next){
// 	var dokio_id = req.params.dokio_id;
// 	// console.log('review dokio_id = ', dokio_id);
// 	DokioModel.find({}, null, {sort: {date: -1}}, function(err, docs){
// 		if(err) return next(err);
// 		console.log('dokio list = ', docs);
// 		res.render('dokio/review_list', {title:'리뷰 리스트', docs:docs});
// 	// res.send("OK");
// })

router.get('/:dokio_id/review/write', function(req, res, next){
	var dokio_id = req.params.dokio_id;
	// console.log('review write dokio_id = ', dokio_id);
	res.render('dokio/review_write', {title: '리뷰 작성'})
});

//도키오 후기 작성 페이지	/dokio/:dokio_id/review/write	POST
router.post('/:dokio_id/review/write', function(req, res, next){
	// res.send("ok");

	// var review_no = req.body._no
	var dokio_id = req.params.dokio_id;
	var review_id = req.body._id
	var username = req.user.local.name;
	var content = req.body.content;
	var date = req.body.date;
	var review_img = req.body.review_img;


	var review = {
		dokio_id: dokio_id,
		// _id: review_id,
		username: username,
		content: content,
		date: date,
		review_img: review_img
	};
	console.log('review = ', review)

	DokioModel.findByIdAndUpdate({_id: dokio_id}, {$push: {"reviews": review}}, {safe: true, upsert: true, new: true}, function(err, rev){
		if(err) return next(err);
		console.log('review update rev = ',rev);	//dokio의 병원의 정보들 출력
	// console.log('username = ', username)
	// console.log('review_id = ', review_id)
		// res.json({doc: doc});
		res.redirect('/dokio/search_list');
	});
});

//도키오 후기 조회(상세) 페이지	/dokio/:dokio_id/review/:review_id	GET
router.get('/:dokio_id/review/:review_id', function(req, res, next){
	var dokio_id = req.params.dokio_id;
	var review_id = req.params.review_id;
	console.log('dokio_id = ', dokio_id, 'review_id = ', review_id);
	DokioModel.findOne({"reviews._id": review_id}, {"reviews.$": 1}, function(err, rev){
		console.log('read find review doc = ', rev)	//[] 빈칸
		res.render('dokio/review_info', {title: '후기', rev:rev, dokio_id:dokio_id, review_id: review_id});

		// res.json({rev: rev, review_id:review_id, dokio_id: dokio_id})
		// res.send("ok")
	});
});


// 도키오 후기 수정 페이지	/dokio/:dokio_id/review/update/:review_id	GET
router.get('/:dokio_id/review/update/:review_id', function(req, res, next){
	console.log('req.body = ', req.body)
	var dokio_id = req.params.dokio_id;
	var review_id = req.params.review_id;
	var username = req.user.local.name;
	console.log('dokio_id = ', dokio_id, 'review_id = ', review_id, 'username = ', username);
	DokioModel.findOne({"reviews._id": review_id, "reviews.username": username}, {"reviews.$": 1}, function(err, doc){
		console.log('update doc = ', doc);
		// res.send("OK");
		res.render('dokio/review_rewrite', {title: "리뷰 수정", doc: doc})
	})
});

router.post('/:dokio_id/review/update/:review_id', function(req, res, next){
	var dokio_id = req.params.dokio_id;
	var review_id = req.params.review_id;
	var username = req.user.local.name;
	var content = req.body.content;
	var date = req.body.date;
	var review_img = req.body.review_img;


		var review = {
			dokio_id: dokio_id,
			review_id: review_id,
			username: username,
			content: content,
			date: date,
			review_img: review_img
		};
	console.log('dokio_id = ', dokio_id, 'review_id = ', review_id)
	console.log('review2 = ', review)
	DokioModel.update({"reviews._id": review_id},{push:{"reviews": review}}, function(err, doc){
		console.log("update doc = ", doc)
		if(err) console.log('update err = ', err);
		res.redirect('/dokio/search_list')
		// res.send("OK");
	})
})
// //도키오 후기 수정 완료 페이지	/dokio/:dokio_id/review/update/update_complete	POST
// router.post('/:dokio_id/review/update/update_complete', function(req, res, next){
// 	var dokio_id = req.params._id;
// 	var user_id = req.body.name;
// 	var content = req.body.content;
// 	var date = req.body.date
// 	var review_img = req.body.review_img;

// 	var review = {
// 		user_id: user_id,
// 		content: content,
// 		date: date,
// 		review_img: review_img
// 	};
// 	// DokioreviewModel.findByIdAndUpdate({_id: dokio_id}, {$push: {"reviews": review}}, {safe: true, upsert: true, new: true}, function(err, doc){
// 	// 	if(err) return next(err);
// 	// 	console.log('review update doc = ', doc);
// 	// 	res.json({doc: doc});
// 	});
// });

//도키오 후기 삭제 페이지	/dokio/:dokio_id/review/delete_complete	POST
router.post('/:dokio_id/review/delete_complete', function(req, res, next){

});

router.get('/dokio/add_dokio', function(req, res, next){
	res.render('dokio/add_dokio', {title: '호텔 추가'})
})

//호텔 추가 페이지 삭제 가능
router.post('/dokio/add_dokio', function(req, res, next){
	// var dokio_id = req.body._id;
	var dokio_name = req.body.name;
	var dokio_category = req.body.category;
	var dokio_address = req.body.address;
	var dokio_content = req.body.content;
	var dokio_price = req.body.price;
	var dokio_img_url = req.body.img_url;
	var dokio_petcategory = req.body.petcategory;
	var dokio_phonenumber = req.body.phonenumber;
	var dokio_rule = req.body.rule;
	var dokio_events = req.body.events;
	var dokio_services = req.body.services;
	var dokio_times = req.body.times;
	// var dokio_reviews = req.body.reviews;
	var dokio_like_count = req.body.like_count;

	var data = {
		// _id: dokio_id,
		name: dokio_name,
		category: dokio_category,
		address: dokio_address,
		content: dokio_content,
		price: dokio_price,
		img_url: dokio_img_url,
		petcategory: dokio_petcategory,
		phonenumber: dokio_phonenumber,
		rule: dokio_rule,
		events: dokio_events,
		services: dokio_services,
		times: dokio_times,
		// reviews: dokio_reviews,
		like_count: dokio_like_count,
	}

	var dokio = new DokioModel(data);
	dokio.save(function(err, doc){
		if(err) console.log('add_dokio err = ', err);
		// res.json(data)
		res.redirect('/dokio/search_list')
	})

})

//도키오 서비스 추가 화면
// router.get('/dokio/add_dokio_service', function(req, res, next){
// 	res.render('add_dokio_service', {title: 'service 추가'})
// })

// router.post('/dokio/add_dokio_service', function(req, res, next){
// 	// var dokio_id = req.body._id;
// 	var service_name = req.body.service_name;

// 	var data = {
// 		service_name: service_name
// 	}

// 	var dokioservice = new DokioserviceModel(data);
// 	dokioservice.save(function(err, doc){
// 		if(err) console.log('add_dokio_service err = ', err);
// 		// res.json(data)
// 		res.redirect('/dokio/search_list')
// 	})

// })
module.exports = router;