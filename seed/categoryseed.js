// category.js
var db = require('../models/db');
var petcategory = require('../models/petcategory');
var mongoose = require('mongoose');

var categories = [
	new petcategory({
		category_name: "고든 세터"
	}),
	new petcategory({
		category_name: "골든 리트리버"
	})
];

var done = 0;
for (var i=0; i<categories.length; i++) {
	categories[i].save(function(err, result){
		done++;
		if(done == categories.length) {
			exit();
		}
	});
}

function exit() {
	mongoose.disconnect();
}
