const { Schema, model } = require("mongoose");

const eventRaffleCodeModel = new Schema({
    id: { type: String, unique: true, required: true, lowercase: true },
    available: { type: Boolean, required: true },
    type: { type: String, required: true, lowercase: true },
    hint: { type: String },
    club: { type: String, required: true },
    timestamp: { type: String }
}, {
    versionKey: false
});

module.exports.eventRaffleCodeModel = model('event-codes-raffle', eventRaffleCodeModel);