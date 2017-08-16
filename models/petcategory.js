var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;

var petcategorySchema = new Schema({
	category_name: String
})

var petcategorySchema = db.model('petcategory', petcategorySchema);

module.exports = petcategorySchema;