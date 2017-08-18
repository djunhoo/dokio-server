var mongoose = require('mongoose');
var db = require('./db');

var Schema = mongoose.Schema;

var petcategorySchema = new Schema({
	category_name: String
})

var petcategoryModel = db.model('petcategory', petcategorySchema);

module.exports = { petcategoryModel: petcategoryModel, petcategorySchema: petcategorySchema};