var mongoose = require('mongoose');
var db = require('./db');
var User = require('./users');
var DokioModel = require('./dokio');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);


var dokioreviewSchema = new Schema({
	_id: Number,
	user_id: {
 		type: Number,
 		ref: 'userModel'
	},
	dokio_id: {
		type: Number,
		ref:'dokio'
	},
	content: String,
	regdate: String,
	review_img: String
});

dokioreviewSchema.plugin(autoIncrement.plugin, {model: 'dokioreview', field: '_id', startAt:1, incrementBy: 1})

var dokioreviewModel = db.model('dokioreview', dokioreviewSchema);

module.exports = {dokioreviewSchema: dokioreviewSchema, dokioreviewModel: dokioreviewModel};
