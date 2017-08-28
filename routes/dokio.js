var express = require('express');
var router = express.Router();
var DokioModel = require('../models/dokio');
var DokioreviewModel = require('../models/dokioreview')
var DokioService = require('../models/dokioservice').dokioserviceModel;
var PetCategory = require('../models/petcategory').petcategoryModel;
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var memorystorage = multer.memoryStorage();
var upload = multer({ storage: memorystorage });
var request = require('request');
var async = require("async");

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

router.get('/sort/distance', function(req, res, next) {
    console.log('req.body=', req.body);
    console.log('req.params=', req.params);
    console.log('req=',req.query);
    var mylat = 37.465634;
    var mylon = 126.958563;

    var GeoPoint = require('geopoint');
    DokioModel.find({},'-__v -price -events -rule -like_count -reviews -times -services -petcategories -category').populate('services', '-_id -__v').populate('petcategories', '-_id -__v')
    .exec(function(err, dokios){
        if(err) next(err);
        var arr = [];
        async.eachSeries(dokios, function(dokio, callback) {
            var distance;
            console.log('먼저2');
            var client_id = 'BE0l52f9aEfCBb1pX_kH';
            var client_secret = '1P2WHA7qjT';
            var api_url = 'https://openapi.naver.com/v1/map/geocode?query=' + encodeURI(dokio.address); // json
            var options = {
                url: api_url,
                headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
            };
            request.get(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var obj = eval(("("+body+")"));
                    point1 = new GeoPoint(mylat, mylon);
                    point2 = new GeoPoint(obj.result.items[0].point.y, obj.result.items[0].point.x);
                    distance = point1.distanceTo(point2, true)//output in kilometers
                    console.log('disdis=', distance);
                } else {
                    console.log('error = ' + response.statusCode);
                }
            arr.push({
                _id: dokio._id,
                name: dokio.name,
                address: dokio.address,
                img_url: dokio.img_url[0],
                distance: distance
            })
            callback();
            });
            console.log('infunction arr=', arr);
        }, function(err) {
            console.log('먼저');
           // console.log('arr=', arr);

            res.json({
                result: arr.sort(dynamicSort("distance"))
            });
        });
    });

});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('dokio/dokio', { title: 'Express' });
});


router.get('/filter', function(req, res, next) {
    console.log('req.body=', req.body);
    console.log('req.params=', req.params);
    console.log('req=',req.query);
    DokioModel.find({},'-__v -price -events -rule -like_count -reviews -times -services -petcategories -category').populate('services', '-_id -__v').populate('petcategories', '-_id -__v')
    .exec(function(err, dokio){
            if(err) next(err);
            res.json({
                success_code:1,
                result: dokio
            });
    });
});



router.get('/sort/like', function(req, res, next) {
    DokioModel.find({}, '-_id -__v -price._id').sort({like_count: 1}).populate('services', '-_id -__v').populate('petcategories', '-_id -__v').exec(function(err, dokio) {
        if(err) next(err);
        if(dokio) {
            res.json({
                success_code: 1,
                result: dokio
            });
        } else {
            res.json({
                success_code: 0,
                message: "찾는 정보가 없습니다.",
                result: null
            })
        }
    });
})

router.get('/sort/price', function(req, res, next) {
    DokioModel.find({},'-_id -__v -price._id').sort({'price.weight:' : 1, 'price.price': 1}).populate('services', '-_id -__v').populate('petcategories', '-_id -__v').exec(function(err, dokio) {
        if(err) next(err);
        if(dokio) {
            res.json({
                success_code: 1,
                result: dokio
            });
        } else {
            res.json({
                success_code: 0,
                message: "찾는 정보가 없습니다.",
                result: null
            })
        }
    });
})


router.get('/add_dokio', function(req, res, next) {
    var service_category = null;
    PetCategory.find({}, function (err, doc) {
        if(err) next(err);
        DokioService.find({}, function(err, services) {
            if(err) next(err);
            console.log('service=', services);
            console.log('doc=', doc);
            res.render('dokio/add_dokio',
             {  title: '호텔 추가',
                categorys: doc,
                a: services
             }
            );
        });
    });
})

router.get('/:dokio_id', function(req, res, next) {
    var dokio_id = req.params.dokio_id;
    DokioModel.findOne({ _id: dokio_id }, '-_id -__v -price._id').populate('services', '-_id -__v').populate('petcategories', '-_id -__v').exec(function(err, dokio) {
        if(err) next(err);
        if(dokio) {
            res.json({
                success_code: 1,
                result: dokio
            });
        } else {
            res.json({
                success_code: 0,
                message: "찾는 정보가 없습니다.",
                result: null
            })
        }
    });
});


function changetheV(a) {
    var b = [];
    if(a) {
    if( Object.prototype.toString.call( a ) === '[object Array]' ) {
            for(var i=0; i<a.length; i++) {
                b.push(parseInt(a[i]));
            }
            return b;
    }
    }

}

router.post('/add_dokio',upload.array('dokiofile'), function(req, res, next) {
    console.log('req.body=', req.body);
    var doc_id;
    var newDokio = new DokioModel();
    newDokio.name = req.body.name;
    newDokio.category = req.body.dokio_category;
    newDokio.address = req.body.address;
    var first = changetheV(req.body.first);
    var last = changetheV(req.body.last);
    var price_info = changetheV(req.body.price_info);
    var price_data = [];
    console.log('first.legnth=', first.length);
    for(var i=0; i<first.length; i++) {
        for(var j=first[i]; j<=last[i]; j++){
            console.log('j=', j);
            price_data.push({
                weight: j,
                price: price_info[i]
            });
        }
        console.log('price_data=', price_data);
    }
    newDokio.price = price_data;
    var img_src = [];
    req.files.forEach(function (fileObj, index) {
        var s3_params = {
          Bucket: 'dokio2',
          Key: Date.now().toString() + "_" + fileObj.originalname,
          ACL: 'public-read',
          ContentType: fileObj.mimetype
        };

        var s3obj = new aws.S3({ params: s3_params });
        s3obj.upload({ Body: fileObj.buffer }).
          on('httpUploadProgress', function (evt) { console.log('evt=', evt); }).
          send(function (err, data) {
            img_src.push(data.Location);
             DokioModel.update({_id: doc_id}, {$push: { img_url: data.Location } }, function(err, doc){
                console.log('img doc=', doc);
             });
        });
    });
    newDokio.petcategories = req.body.pet_category;
    newDokio.phonenumber = req.body.phone_number;
    newDokio.rule = req.body.rule;
    newDokio.events = req.body.event;
    newDokio.services = changetheV(req.body.service);
    var time_data = {
        weekday: req.body.weekday,
        weekend: req.body.weekend,
        ectinfo: req.body.etc
    };
    newDokio.times = time_data;
    newDokio.save(function(err, doc) {
          if(err) console.log('err=', err);
          doc_id = doc._id;
          res.json({
            doc:doc
          })

    });

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

module.exports = router;
