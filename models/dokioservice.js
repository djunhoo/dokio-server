var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;

var dokioserviceSchema = new Schema({
	service_name: String
})

// var dokioserviceModel = db.model('dokioservice', dokioserviceSchema);

module.exports = dokioserviceSchema;