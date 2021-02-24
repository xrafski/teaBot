// mongoose@5.11.15
const mongoose = require('mongoose');
const { mongodb } = require('../bot-settings.json');
const { logger } = require('../teaBot');

async function mongoConnect() {
    await mongoose.connect(mongodb.path, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        serverSelectionTimeoutMS: 15000
    }).then(() => logger('debug', `mongodb-connection.js:1 () Connected to the database.`));
    return mongoose;
}

module.exports.mongoConnect = mongoConnect;