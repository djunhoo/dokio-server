var mongoose = require('mongoose');
var db = require('./db');
var User = require('./users');
var Dokio = require('./dokio');

var Schema = mongoose.Schema;

var dokiolikedSchema = new Schema({
	user_id: [{type: Schema.Types.ObjectId, ref: 'User'}],
	dokio_id: [{tpye: Schema.Types.ObjectId, ref: 'Dokio'}] ,
	liked: boolean
});

var dokiolikedModel = db.model('dokioliked', dokiolikedSchema);

module.exports = dokiolikedModel;
