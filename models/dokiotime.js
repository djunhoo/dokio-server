var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;

var dokiotimeSchema = new Schema({
	time: {weekday: String, weekend: String}
});

// var dokiotimeModel = db.model('dokiotime', dokiotimeSchema);

module.exports = dokiotimeSchema;

