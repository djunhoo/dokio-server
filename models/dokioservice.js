var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);

var dokioserviceSchema = new Schema({
	_id: Number,
	service_name: String
});


dokioserviceSchema.plugin(autoIncrement.plugin, {model: 'dokioservices', field: '_id', startAt: 1, incrementBy: 1});


var dokioserviceModel = db.model('dokioservices', dokioserviceSchema);

module.exports = {dokioserviceModel: dokioserviceModel, dokioserviceSchema: dokioserviceSchema};