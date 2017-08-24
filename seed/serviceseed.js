// serviceseed.js
var db = require('../models/db');
var dokioservice = require('../models/dokioservice').dokioserviceModel;
var mongoose = require('mongoose');

var services = [
	new dokioservice({
		service_name: "픽업"
	}),
	new dokioservice({
		service_name: "간식제공"
	}),
	new dokioservice({
		service_name: "목욕/스파"
	}),
	new dokioservice({
		service_name: "미용/염색"
	}),
	new dokioservice({
		service_name: "수영"
	}),
	new dokioservice({
		service_name: "CCTV"
	}),
	new dokioservice({
		service_name: "사진/동영상"
	}),
	new dokioservice({
		service_name: "산책"
	}),
	new dokioservice({
		service_name: "훈련/교육"
	}),
	new dokioservice({
		service_name: "예방접종"
	})
];
console.log('services=', services)
var done = 0;
for (var i=0; i<services.length; i++) {
	services[i].save(function(err, result){
		console.log('result=', result);
		done++;
		if(done == services.length) {
			exit();
		}
	});
}

function exit() {
	mongoose.disconnect();
}
