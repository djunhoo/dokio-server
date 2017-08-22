var express = require('express');
var router = express.Router();
var DokioModel = require('../models/dokio');
var DokioreviewModel = require('../models/dokioreview')
var DokioserviceModel = require('../models/dokioservice')



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('dokio/dokio', { title: 'Express' });
});

router.get('/add_dokio', function(req, res, next) {
    res.render('dokio/add_dokio', { title: '호텔 추가' })
})

//도키오 검색 페이지
router.get('/search_list', function(req, res, next) {
    DokioModel.find({}, null, { sort: { date: -1 } }, function(err, docs) {
        if (err) return next(err);
        // console.log('dokio list = ', docs);
        res.render('dokio/search_list', { title: '도키오 리스트', docs: docs });
        // res.json({docs:docs});
        // console.log('req.user = ', req.user)
    });
});

//도키오 조회 페이지 (상세 조회 - 리뷰까지)
router.get('/:dokio_id', function(req, res, next) {
    var dokio_id = req.params.dokio_id;
    // var username = req.reviews._id;
    // console.log('dokio_id = ', dokio_id)
    DokioModel.findOne({ _id: dokio_id }, function(err, doc) {
        // res.json({doc: doc});
        console.log('dokio_info doc = ', doc)
            // console.log('dokio_info doc _id = ', username)
        res.render('dokio/dokio_info', { title: '상세', doc: doc })
            // res.json({doc:doc})
    });
});


router.get('/:dokio_id/review/write', function(req, res, next) {
    var dokio_id = req.params.dokio_id;
    // console.log('review write dokio_id = ', dokio_id);
    res.render('dokio/review_write', { title: '리뷰 작성' })
});

//도키오 후기 작성 페이지	/dokio/:dokio_id/review/write	POST
router.post('/:dokio_id/review/write', function(req, res, next) {
    // res.send("ok");

    // var review_no = req.body._no
    var dokio_id = req.params.dokio_id;
    var review_id = req.body._id
    var username = req.user.name;
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
    // console.log('review = ', review)

    DokioModel.findByIdAndUpdate({ _id: dokio_id }, { $push: { "reviews": review } }, { safe: true, upsert: true, new: true }, function(err, rev) {
        if (err) return next(err);
        // console.log('review update rev = ',rev);	//dokio의 병원의 정보들 출력
        // console.log('username = ', username)
        // console.log('review_id = ', review_id)
        // res.json({doc: doc});
        res.redirect('/dokio/search_list');
    });
});

//도키오 후기 조회(상세) 페이지	/dokio/:dokio_id/review/:review_id	GET
router.get('/:dokio_id/review/:review_id', function(req, res, next) {
    var dokio_id = req.params.dokio_id;
    var review_id = req.params.review_id;
    console.log('dokio_id = ', dokio_id, 'review_id = ', review_id);
    DokioModel.find({ "reviews._id": { "$in": review_id } }, function(err, docs) {
        if (err) console.log('err = ', err)
            // for문 줄이기
        var arr = [];
        console.log('docs.length = ', docs.length)
        for (var i = 0; i < docs.length; i++) {
            var reviews = docs[i].reviews;
            // console.log('reviews = ', reviews);
            for (var j = 0; j < reviews.length; j++) {
                var data = reviews[j];
                console.log('data = ', data)
                if (data._id == review_id) {

                    arr.push({ content: data.content })
                    console.log('arr = ', arr)
                        // console.log('docs = ', docs)

                    res.render('dokio/review_info', { title: '후기', docs: data, arr: arr, dokio_id: dokio_id, review_id: review_id });
                    // console.log('docs = ', docs)
                    // res.json({docs: data, review_id:review_id, dokio_id: dokio_id})
                }
            }
        }

        // console.log('read find review doc = ', rev)	//[] 빈칸

        // res.send("ok")
    });
});


// 도키오 후기 수정 페이지	/dokio/:dokio_id/review/update/:review_id	GET
router.get('/:dokio_id/review/update/:review_id', function(req, res, next) {
    // console.log('req.body = ', req.body)
    var dokio_id = req.params.dokio_id;
    var review_id = req.params.review_id;
    var username = req.user.name;
    var arr = req.body.arr;

    DokioModel.find({ "reviews._id": { "$in": review_id } }, function(err, docs) {
        if (err) console.log('err = ', err)

        console.log('docs.length = ', docs.length)
        var arr = [];
        console.log('docs = ', docs)
        for (var i = 0; i < docs.length; i++) {
            var reviews = docs[i].reviews;
            console.log('reviews = ', reviews);
            for (var j = 0; j < reviews.length; j++) {
                var data = reviews[j];
                console.log('data = ', data);
                if (data._id == review_id) {

                    arr.push({ content: data.content, _id: data._id })
                    console.log('arr1 = ', arr);
                    console.log('arr1._id = ', arr._id);
                    console.log('data._id = ', data._id);

                }
            }
        }
            res.render('dokio/review_rewrite', { title: "리뷰 수정"})
    })
});

router.post('/:dokio_id/review/update/:review_id', function(req, res, next) {
        var dokio_id = req.params.dokio_id;
        var review_id = req.params.review_id;
        var username = req.user.name;
        var content = req.body.content;
        var date = req.body.date;
        var review_img = req.body.review_img;
        var arr = req.body.arr;
        console.log('arr12 = ', arr)


        var review = {
            dokio_id: dokio_id,
            review_id: review_id,
            username: username,
            content: content,
            date: date,
            review_img: review_img
        };

        console.log('content = ', content);
        console.log('review_id = ', review_id);
        console.log('reviews._id = ', "reviews._id");

        // DokioModel.find({_id: dokio_id}, {"reviews._id": true}, function(err, docs){
        //     console.log("review docs = ", docs)
        //     if (err) console.log('err = ', err)

        //     var arr = [];
        //     console.log('docs.length = ', docs.length)
        //     for (var i = 0; i < docs.length; i++) {
        //         var reviews = docs[i].reviews;

        //         for (var j = 0; j < reviews.length; j++) {
        //             var data = reviews[j];
        //             console.log('data = ', data)


        //     var reviews_id = data._id;
        //     console.log('reviews_id = ', reviews_id)

        //               // res.render('dokio/review_rewrite', { title: "리뷰 수정", reviews_id: reviews_id})

        //             }
        //         }

        // })



        DokioModel.update({ "_id":dokio_id, "reviews._id": review_id  }, {$set: { "reviews.$.content": content}}, function(err, docs) {
            // console.log('reviews_id = ', reviews_id)
            if (err) console.log('err = ', err);
                console.log('update docs = ', docs);

        });

            res.redirect('/dokio/search_list');

            // res.send("OK");
    });


//도키오 후기 삭제 페이지	/dokio/:dokio_id/review/delete_complete	POST
router.post('/:dokio_id/review/delete_complete', function(req, res, next) {
    var dokio_id = req.params.dokio_id;
    var username = req.user.name;

    DokioModel.remove({"_id": dokio_id, "username": username}, function(err, doc){
        console.log('remmove doc = ', doc);
        if(err) return next(err);
        if(doc.result.n == 1){
            res.redirect('/:dokio_id');
        } else {
            res.redirect('/:dokio_id')
        }

    })
});



//호텔 추가 페이지 삭제 가능
router.post('/dokio/add_dokio', function(req, res, next) {



})
module.exports = router;