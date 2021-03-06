var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var PetModelSchema = require('./pet').petSchema;
var PetModel = require('./pet').petModel;
var DokioModelSchema = require('./dokio').dokioSchema;
var MemoModelSchema = require('./memo').memoSchema;
var MemoModel = require('./memo').memoModel;
var db = require('./db');

var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);

var userSchema = mongoose.Schema({
    //_id              : Number,
    userid           : String,
    password         : String,
    token            : String,
    email            : String,
    name             : String,
    phone_number     : String,
    myprof_img       : String,
    pets: [PetModelSchema],
    favorites: [{
        type: Number,
        ref:'dokio'
    }],
    memos: [MemoModelSchema]
});

// 해쉬 암호화
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.plugin(autoIncrement.plugin, {model: 'userModel', field: '_id', startAt: 1, incrementBy: 1});

var User = db.model('userModel', userSchema);

module.exports = User;