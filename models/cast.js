//cast.js

var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;

var CastSchema = new Schema({
	title: String,
	castimg: String,
	url: String
})

var CastModel = db.model('cast', CastSchema);

module.exports = { CastModel: CastModel, CastSchema: CastSchema};

