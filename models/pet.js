var mongoose = require('mongoose');
var db = require('./db');
var PetCategory = require('./petcategory')

var Schema = mongoose.Schema;

var petSchema = new Schema({
	name: String,
	age: String,
	// sex: String,
	weight: String,
	categories: [{type:String, ref:'PetCategory'}],
	pet_img_url: String,

});

// var petModel = db.model('pet', petSchema);

module.exports = petSchema;
