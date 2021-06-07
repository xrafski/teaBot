const { Schema, model } = require("mongoose");

const eventRaffleList = new Schema({
    id: { type: String, required: true },
    tag: { type: String, required: true },
    code: { type: String, required: true },
    club: { type: String, required: true },
    entry: { type: String, required: true, lowercase: true, unique: true },
    timestamp: { type: String, required: true }
}, {
    versionKey: false
});

module.exports.eventRaffleList = model('event-raffle-list', eventRaffleList);