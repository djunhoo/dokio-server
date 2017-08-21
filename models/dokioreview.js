var mongoose = require('mongoose');
var db = require('./db');
var User = require('./users');
var DokioModel = require('./dokio');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId

// var autoIncrement = require('mongoose-auto-increment');
// autoIncrement.initialize(db);


var dokioreviewSchema = new Schema({
	// _id: Number,
	username: String,
	content: String,
	date: {type: Date, default: Date.now},
	review_img: String
});

// dokioreviewSchema.plugin(autoIncrement.plugin, {model: 'dokioreview', field: '_id', startAt:1, incrementBy: 1})

var dokioreview = db.model('dokioreview', dokioreviewSchema);

module.exports = {dokioreviewSchema: dokioreviewSchema, dokioreview: dokioreview};
