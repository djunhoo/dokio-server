var mongoose = require('mongoose');
var db = require('./db');
var User = require('./users');
var DokioModel = require('./dokio');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId

var dokioreviewSchema = new Schema({
	_id: Number,
	user_id: [{type: Schema.Types.ObjectId, ref: 'User'}],
	content: String,
	date: {type: Date, default: Date.now},
	review_img: String
});

var dokioreviewModel = db.model('dokioreview', dokioreviewSchema);

module.exports = dokioreviewSchema;
