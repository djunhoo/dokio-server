 // models/db.js
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('dotenv').config();
var database_uri = process.env.DATABASE_URI || '';
mongoose.connect(database_uri, { useMongoClient: true } );
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

module.exports = db;
