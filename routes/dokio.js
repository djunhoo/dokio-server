var express = require('express');
var router = express.Router();
var DokioModel = require('../models/dokio').dokioModel;
var DokioreviewModel = require('../models/dokioreview').dokioreviewModel;
var DokioService = require('../models/dokioservice').dokioserviceModel;
var PetCategory = require('../models/petcategory').petcategoryModel;
var User    = require('../models/users');
var CastModel = require('../models/cast').CastModel;
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var memorystorage = multer.memoryStorage();
var upload = multer({ storage: memorystorage });
var request = require('request');
var async = require("async");
var jwt = require('jwt-simple');
var configAuth = require('../config/auth');
var moment = require('moment-timezone');
var fs = require('fs');
var s3 = new aws.S3();
var upload2 = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'dokio2',
            key: function (req, file, cb) {
                console.log(file);
                cb(null, Date.now().toString() + file.originalname); //use Date.now() for unique file keys
            }
       })
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
const AmazonS3URI = require('amazon-s3-uri')

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
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('dokio/dokio', { title: 'Express' });
});

router.get('/cast', function(req, res, next){
    CastModel.find({}, '-__v -_id -url', function(err, casts){
        if(casts){
            res.json({
                success_code: 1,
                result: casts
            })
        }
        else {
            res.json({
                success_code: 0,
                message: "전송이 되지 않습니다.",
                result: null
            })
        }
    });
});

router.get('/marketing', function(req, res, next){
    DokioModel.findRandom({},'-_id -phonenumber -__v -price -wedo -events -rule -like_count -reviews -times -services -petcategories -category', {limit: 10}, function(err, results) {
      if (err) {
        console.log(err); // 5 elements
      }
      res.json({
        success_code:1,
        result : results
      });
    });
});

router.get('/filter', function(req, res, next) {
    console.log('req=',req.query);
    sort = req.query.sort;
    var filter_services = req.query.service
    console.log('filter_serivces=', filter_services)

    console.log('sort=', sort);
    var arrayfilter = changetheV(filter_services);
    if(!sort) {
        DokioModel.find({
            category: req.query.thema,
            services: { $in: arrayfilter },
            "price[0].price":{$gt:15000,
                              $lt:20000}
                        },
            '-__v -price -wedo -events -rule -like_count -reviews -times -services -petcategories -category').populate('services', '-_id -__v').populate('petcategories', '-_id -__v')
        .exec(function(err, dokio){
                if(err) console.log(err);
                res.json({
                    success_code:1,
                    result: dokio
                });
        });
    } else {
        if(sort == "price")
        {
            DokioModel.find({
            category: req.query.thema,
            services: { $in: arrayfilter }
                             },'-__v -price -wedo -events -rule -like_count -reviews -times -services -petcategories -category').sort({'price.weight:' : 1, 'price.price': 1}).populate('services', '-_id -__v').populate('petcategories', '-_id -__v').exec(function(err, dokio) {
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
        }
        else if(sort == "distance"){
            var mylat;
            var mylon;
            console.log('req.lat=', req.query.lat);
            console.log('req.lon=', req.query.lon);
            if(req.query.lat) {
                mylat = parseFloat(req.query.lat);
                mylon = parseFloat(req.query.lon);
            } else {
                mylat = 37.465634;
                mylon = 126.958563;
            }
            var GeoPoint = require('geopoint');
            DokioModel.find({
            category: req.query.thema,
            services: { $in: arrayfilter }
                             }, '-__v -price -events -rule -like_count -reviews -times -services -petcategories -category').populate('services', '-_id -__v').populate('petcategories', '-_id -__v')
            .exec(function(err, dokios){
                if(err) console.log(err);
                var arr = [];
                async.eachSeries(dokios, function(dokio, callback) {
                    var distance;
                    point1 = new GeoPoint(mylat, mylon);
                    point2 = new GeoPoint(dokio.wedo.lat, dokio.wedo.lon);
                    distance = point1.distanceTo(point2, true);
                    arr.push({
                        _id: dokio._id,
                        phonenumber: dokio.phonenumber,
                        address: dokio.address,
                        name: dokio.name,
                        img_url: dokio.img_url,
                        distance: distance
                    })
                    callback();
                }, function(err) {
                   // console.log('arr=', arr);
                    res.json({
                        success_code: 1,
                        result: arr.sort(dynamicSort("distance"))
                    });
                });
            });
        }
        else if(sort == "like"){
            DokioModel.find({
            category: req.query.thema,
            services: { $in: arrayfilter }
                             },'-__v -price -wedo -events -rule -like_count -reviews -times -services -petcategories -category').sort({like_count: 1}).populate('services', '-_id -__v').populate('petcategories', '-_id -__v').exec(function(err, dokio) {
                    if(err) console.log(err);
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
        }

    }
});


router.post('/update/wedo', function(req, res, next) {
    DokioModel.find({},'-__v -price -events -rule -like_count -reviews -times -services -petcategories -category').populate('services', '-_id -__v').populate('petcategories', '-_id -__v')
    .exec(function(err, dokios){
        if(err) next(err);
        var arr = [];
        async.eachSeries(dokios, function(dokio, callback) {
            var x, y;
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
                    // obj.result.items[0].point.y
                    // obj.result.items[0].point.x
                    x = obj.result.items[0].point.y;
                    y = obj.result.items[0].point.x;
                } else {
                    console.log('error = ' + response.statusCode);
                }
            var wedo_data = {
                lat: x,
                lon: y
            }
            DokioModel.update(
                {_id: dokio._id},
                {wedo: wedo_data},
                function(err, doc) {

                }
            );
            callback();
            });
        }, function(err) {
           // console.log('arr=', arr);
            res.json({
                success_code: 1,
                result: null
            });
        });
    });
});

router.get('/category', function(req, res, next) {
    console.log('req.params=', req.query.category);
    var mylat;
    var mylon;
    console.log('req.lat=', req.query.lat);
    console.log('req.lon=', req.query.lon);
    if(req.query.lat) {
        mylat = parseFloat(req.query.lat);
        mylon = parseFloat(req.query.lon);
    } else {
        mylat = 37.465634;
        mylon = 126.958563;
    }
    DokioModel.find({category: req.query.category},'-__v -price -events -rule -like_count -reviews -times -services -petcategories -category').populate('services', '-_id -__v').populate('petcategories', '-_id -__v')
                .exec(function(err, dokios){
                    if(err) next(err);
                    var arr = [];
                    var GeoPoint = require('geopoint');
                    async.eachSeries(dokios, function(dokio, callback) {
                        var distance;
                        point1 = new GeoPoint(mylat, mylon);
                        point2 = new GeoPoint(dokio.wedo.lat, dokio.wedo.lon);
                        distance = point1.distanceTo(point2, true);
                        if( distance < 10 ) {
                            arr.push({
                                _id: dokio._id,
                                phonenumber: dokio.phonenumber,
                                address: dokio.address,
                                name: dokio.name,
                                img_url: dokio.img_url,
                                distance: distance,
                                wedo: dokio.wedo
                            })
                        }
                        callback();
                    }, function(err) {
                       // console.log('arr=', arr);
                        res.json({
                            success_code: 1,
                            result: arr.sort(dynamicSort("distance"))
                        });
                    });
    });
});

router.get('/name', function(req, res, next) {
    console.log('req.params=', req.query.name);
    var name = req.query.name;
    var search = new RegExp(name);
    DokioModel.find({ name: { $in: search } },'-__v -price -events -rule -like_count -reviews -times -services -petcategories -category').populate('services', '-_id -__v').populate('petcategories', '-_id -__v')
    .exec(function(err, dokio){
            if(err) next(err);
            res.json({
                success_code:1,
                result: dokio
            });
    });
});

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
    DokioModel.findOne({ _id: dokio_id }, '-_id -__v -price._id').populate('services', '-_id -__v').populate('petcategories', '-_id -__v').populate('reviews.user_id', '-__v -password -token -_id -memos -favorites -pets').exec(function(err, dokio) {
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

router.post('/:dokio_id/review/write', upload2.single('review_file'), function(req, res, next){
    console.log('dokio_id=', req.params.dokio_id);
    var dokio_id = req.params.dokio_id;
    console.log('token=', req.body.token);
    var decoded_email = jwt.decode(req.body.token, configAuth.jwt_secret);
    var location;
    if(req.file) {
        location = req.file.location;
    }

    DokioModel.findOne({_id: req.params.dokio_id}, function(err, dokio) {
        User.findOne({email: decoded_email}, function(err, user) {
            console.log('user=', user);
            console.log('dokio=', dokio);
            if(err) console.log(err);
            if(!user) {
                res.json({
                    success_code: 0,
                    message: "토큰이 잘못되어있습니다.",
                    result: null
                });
            }
            else {
              var review = new DokioreviewModel({
                  user_id: user._id,
                  dokio_id: dokio._id,
                  content: req.body.content,
                  regdate: regDateTime(),
                  review_img: location
              });
              dokio.reviews.push(review);
              dokio.save(function(err) {
                  if(err) console.log(err);
                  res.json({
                      success_code: 1,
                      result: {
                          email: user.email,
                          content: review.content,
                          regdate: review.regdate
                      }
                  });
              })
            }
        });
    });
});

router.post('/:dokio_id/review/delete', function(req, res, next) {
    console.log('token=', req.query.token);
    var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
    console.log('decoded_email=', decoded_email);
    DokioModel.findOne({_id: req.params.dokio_id}, function(err, dokio) {
        if (err) console.log('err=', err);
        if (!dokio) {
            res.json({
                success_code: 0,
                message: "유저 아이디 값이 맞지않습니다.",
                result: null
            })
        } else {
            var review_id = req.query.review_id;
            var rev = dokio.reviews.id(review_id);
            var review_url = rev.review_img;
            if(review_url) { // 댓글에 이미 이미지가 있다면,
                try { // 이미지 삭제
                    const { region, bucket, key } = AmazonS3URI(review_url)
                    console.log('key=', key);
                    console.log('bucket=', bucket);
                    var delete_params = { Bucket: "dokio2", Key: key };
                    s3.deleteObject(delete_params, function(err, data) {
                        if(err) console.log(err);
                        else {
                            console.log(data);
                        }
                    });
                } catch(err) {
                  console.warn(`${review_url} is not a valid S3 uri`) // should not happen because `uri` is valid in that example
                }
            }
            dokio.reviews.pull({_id: req.query.review_id});
            dokio.save(function(err, doc){
                if(err) next(err);
                if(doc){
                    res.json({
                        success_code: 1,
                        result: null
                    })
                } else
                res.json({
                    success_code: 0,
                    message: "리뷰 삭제 실패",
                    result: null
                });
            });
        }
    })
});

router.post('/:dokio_id/review/update', upload2.single('review_file'), function(req, res, next) {
    console.log('token=', req.query.token);
    var decoded_email = jwt.decode(req.query.token, configAuth.jwt_secret);
    console.log('decoded_email=', decoded_email);
    DokioModel.findOne({_id: req.params.dokio_id}, function(err, dokio) {
        if (err) console.log('err=', err);
        if (!dokio) {
            res.json({
                success_code: 0,
                message: "유저 아이디 값이 맞지않습니다.",
                result: null
            })
        } else {
            var review_id = req.query.review_id;
            var rev = dokio.reviews.id(review_id);
            if(req.file) { // 파일이 있다면
                try {
                  var review_url = rev.review_img;
                  console.log('review=', review_url)
                  if(review_url) { // 댓글에 이미 이미지가 있다면,
                        const { region, bucket, key } = AmazonS3URI(review_url)
                        console.log('key=', key);
                        console.log('bucket=', bucket);
                        var delete_params = { Bucket: "dokio2", Key: key };
                        s3.deleteObject(delete_params, function(err, data) {
                            if(err) console.log(err);
                            else {
                                console.log(data);
                            }
                        });
                  }
                } catch(err) {
                  console.warn(`${review_url} is not a valid S3 uri`) // should not happen because `uri` is valid in that example
                }
                rev.review_img = req.file.location;
            }
            rev.content = req.query.content;
            dokio.save(function(err, doc){
                if(err) next(err);
                if(doc){
                    res.json({
                        success_code: 1,
                        result: null
                    })
                } else
                res.json({
                    success_code: 0,
                    message: "리뷰 수정 실패",
                    result: null
                });
            });
        }
    })
});

module.exports = router;
