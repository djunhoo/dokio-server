// serviceseed.js
var db = require('../models/db');
var dokioservice = require('../models/dokioservice');
var mongoose = require('mongoose');

var services = [
	new dokioservice({
		service_name: "픽업"
	}),
	new dokioservice({
		service_name: "간식"
	}),
	new dokioservice({
		service_name: "목욕"
	}),
	new dokioservice({
		service_name: "미용"
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
		service_name: "훈련"
	}),
	new dokioservice({
		service_name: "예방접종"
	}),
	new dokioservice({
		service_name: "수영장"
	})
];

var done = 0;
for (var i=0; i<services.length; i++) {
	services[i].save(function(err, result){
		done++;
		if(done == services.length) {
			exit();
		}
	});
}

function exit() {
	mongoose.disconnect();
}
