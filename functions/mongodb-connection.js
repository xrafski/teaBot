// mongodb-connection.js
// ================================

const mongoose = require('mongoose');
mongoose.pluralize(null);
const { mongodb } = require('../bot-settings.json');

async function MongoClient() {
    await mongoose.connect(mongodb.path, {
        poolSize: 10,
        keepAlive: true,
        socketTimeoutMS: 30000,

        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
        serverSelectionTimeoutMS: 10000
    });
    return mongoose;
}


module.exports.MongoClient = MongoClient;