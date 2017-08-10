var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;

var petcategoySchema = new Schema({
	categotied_name: String
})

// var petcategoryModel = db.model('petcategoy', petcategoySchema);

module.exports = petcategoySchema;