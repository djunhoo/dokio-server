var express = require('express');
var router = express.Router();
var dokioModel = require('../models/dokio');
var formidable = require('formidable');
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');


AWS.config.update({
    secretAccessKey: 'ntq+T3jCqsMFkheq9AMsI0pDkRMdF5crS6fkaX1x',
    accessKeyId: 'AKIAIWVJ56GWXHH4BUTA',
    region: 'ap-northeast-2'
});

var s3 = new AWS.S3();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/form', function(req, res, next) {
  res.render('form', { title: 'Express' });
});

router.get('/mobile_dokio', function(req, res, next) {
	dokioModel.find({}, null, function(err, docs) {
		if(err) return next(err);
		console.log('docs=', docs);
		//res.json({docs: docs});
		res.json({docs});
	});
});

router.post('/upload', function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		console.log('files=', fields)
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
				var data = new dokioModel({
					name: fields.name,
					adress: fields.adress,
					content: fields.content,
					img_url: data.Location
				});
				console.log('data=', data);
				data.save(function(err, row){
					if(err) return next(err);
					console.log(row);
					res.json({row});
				});
			}
		});
	});
});
module.exports = router;