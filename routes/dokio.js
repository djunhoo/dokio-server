var express = require('express');
var router = express.Router();
var DokioModel = require('../models/dokio');
var DokioreviewModel = require('../models/dokioreview')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dokio/dokio', { title: 'Express' });
});

//도키오 검색 페이지
router.get('/search_list', function(req, res, next){
	DokioModel.find({}, null, {sort: {date:-1}}, function(err, docs){
		if(err) return next(err);
		console.log('dokio list = ', docs);
		res.render('dokio/search_list', {title:'도키오 리스트', docs: docs});
		// res.json({docs:docs});
	});
});

//도키오 조회 페이지 (상세 조회 - 리뷰까지)
router.get('/:dokio_id', function(req, res, next){
	var dokio_id = req.params.dokio_id;
	console.log('dokio_id = ', dokio_id)
	DokioModel.findOne({_id: dokio_id}, function(err, doc){
		// res.json({doc: doc});
		res.render('dokio/dokio_info', {title: '상세', doc: doc})
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
	console.log('review write dokio_id = ', dokio_id);
	res.render('dokio/review_write', {title: '리뷰 작성'})
});

//도키오 후기 작성 페이지	/dokio/:dokio_id/review/write	POST
router.post('/:dokio_id/review/write', function(req, res, next){
	// res.send("ok");

	// var review_no = req.body._no
	var dokio_id = req.params.dokio_id;
	var user_id = req.body.user;
	var content = req.body.content;
	var date = req.body.date;
	var review_img = req.body.review_img;

	var review = {
		// dokio_id: dokio_id,
		name: user_id,
		content: content,
		date: date,
		review_img: review_img
	};

	DokioModel.findByIdAndUpdate({_id: dokio_id}, {$push: {"reviews": review}}, {safe: true, upsert: true, new: true}, function(err, doc){
		if(err) return next(err);
		console.log('review update doc = ', doc);
		// res.json({doc: doc});
		res.redirect('/dokio/search_list');
	});
});

//도키오 후기 조회 페이지	/dokio/:dokio_id/review/:review_id	GET
router.get('/:dokio_id/review/:review_id', function(req, res, next){
	var dokio_id = req.params.dokio_id;
	var review_id = req.params.review_id;
	console.log('dokio_id = ', dokio_id, 'review_id = ', review_id);
	DokioModel.findById({_id: dokio_id}, function(err, doc){
		res.render('dokio/review_info', {title: '상세 리뷰', doc})
	});
});

// 도키오 후기 수정 페이지	/dokio/:dokio_id/review/update/:review_id	GET
router.get('/:dokio_id/review/update/:review_id', function(req, res, next){

});

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

module.exports = router;