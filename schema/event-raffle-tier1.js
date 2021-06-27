const { Schema, model } = require("mongoose");

const eventRaffleTier1 = new Schema({
    id: { type: String, required: true },
    tag: { type: String, required: true },
    club: { type: String, required: true },
    entry: { type: String, required: true, lowercase: true, unique: true }
}, {
    versionKey: false
});

module.exports.eventRaffleTier1 = model('event-raffle-tier1', eventRaffleTier1);