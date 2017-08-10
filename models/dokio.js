var mongoose = require('mongoose');
var db = require('./db');
var Petcategories = require('./petcategory');
var Dokioservice = require('./dokioservice');
var Dokiotime = require('./dokiotime');
var Dokioreview = require('./dokioreview');


var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var dokioSchema = new Schema({
	_id: Number,
	name: String,
	category: String,
	address: String,
	content: String,
	price: String,
	img_url: String,
	petcategories: [ Petcategories ],
	phonenumber: String,
	rule: String,
	events: String,
	services: [Dokioservice],
	times: [Dokiotime],
	reviews: [Dokioreview],
	like_count: {type: Number, default: 0}

});

var dokioModel = db.model('dokio', dokioSchema);

module.exports = dokioModel;