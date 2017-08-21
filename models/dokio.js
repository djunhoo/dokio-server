var mongoose = require('mongoose');
var db = require('./db');
var Petcategories = require('./petcategory');
var Dokioservice = require('./dokioservice');
var Dokiotime = require('./dokiotime');
var Dokioreview = require('./dokioreview').dokioreviewSchema;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);


var dokioSchema = new Schema({
	_id: Number,
	name: String,
	category: String,
	address: String,
	content: String,
	price: String,
	img_url: String,
	petcategories: String,
	phonenumber: String,
	rule: String,
	events: String,
	services: [Dokioservice],
	times: [Dokiotime],
	reviews: [Dokioreview],
	like_count: {type: Number, default: 0}

});

dokioSchema.plugin(autoIncrement.plugin, {model: 'dokio', field: '_id', startAt:1, incrementBy: 1})

// Dokioreview.plugin(autoIncrement.plugin, {model: 'Dokioreview', field: '_id', startAt:1, incrementBy: 1})

var dokioModel = db.model('dokio', dokioSchema);

module.exports = dokioModel;