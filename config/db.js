/**
* Connect to the Mongoose DB and provide 'mongoose' and 'db' as globals
* Requires that config/index.js has already been loaded into global.config
*/
global.mongoose = require('mongoose');
console.log('Connecting to Mongo', config.mongo.uri);
mongoose.connect(config.mongo.uri);
global.db = global.mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error:'));
