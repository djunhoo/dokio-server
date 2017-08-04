var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;

var dokioSchema = new Schema({
	name: String,
	adress: String,
	img_url: String,
	category: String,
	content: String
});

var dokioModel = db.model('dokio', dokioSchema);

module.exports = dokioModel;