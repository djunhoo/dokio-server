var mongoose = require('mongoose');
var db = require('./db');
// var User = require('./users');

var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);

var memoSchema = new Schema({
	// userid: String,
	content: [String],
	date: String
});

memoSchema.plugin(autoIncrement.plugin, {model: 'memo', field: '_id', startAt: 1, incrementBy: 1});

var memoModel = db.model('memo', memoSchema);

module.exports = {memoModel: memoModel, memoSchema: memoSchema};