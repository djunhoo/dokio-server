var mongoose = require('mongoose');
var db = require('./db');
var Petcategories = require('./petcategory').petcategorySchema;
var Dokioservice = require('./dokioservice').dokioserviceSchema;
var Dokioreview = require('./dokioreview').dokioreviewSchema;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);


var dokioSchema = new Schema({
	_id: Number,
	name: String,
	category: {
		type: String,
        enum : ['호텔', '병원', '카페'],
        default: '호텔'
	},
	address: String,
	wedo: {
		lat: Number,
		lon: Number
	},
	content: String,
	price: [{
		weight: Number,
		price: Number
	}],
	img_url: [String],
	petcategories: [{
		type: Schema.Types.ObjectId,
		ref:'petcategory'
	}],
	phonenumber: String,
	rule: String,
	events: String,
	services: [{
		type: Number,
		ref:'dokioservices'
	}],
	times: {
		weekday: String,
		weekend: String,
		ectinfo: String
	},
	reviews: [Dokioreview],
	like_count: {type: Number, default: 0}

});

dokioSchema.plugin(autoIncrement.plugin, {model: 'dokio', field: '_id', startAt:1, incrementBy: 1})

var dokioModel = db.model('dokio', dokioSchema);

module.exports = {dokioModel:dokioModel, dokioSchema:dokioSchema};