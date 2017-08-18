var mongoose = require('mongoose');
var db = require('./db');
var PetCategory = require('./petcategory').petcategorySchema;

var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);

var petSchema = new Schema({
	_id: Number,
	name: String,
	age: Number,
	sex: {
		type: String,
        enum : ['남자', '여자', '중성'],
        default: '중성'
	},
	weight: Number,
	category: {
		type: Schema.Types.ObjectId, 
		ref:'petcategory'
	},
	pet_img: String,

});

petSchema.plugin(autoIncrement.plugin, {model: 'pet', field: '_id', startAt: 1, incrementBy: 1});
var petModel = db.model('pet', petSchema);


module.exports = {petModel:petModel, petSchema: petSchema};
