const { Schema, model } = require("mongoose");

const eventRaffleTier2 = new Schema({
    id: { type: String, required: true },
    tag: { type: String, required: true },
    entry: { type: String, required: true, lowercase: true, unique: true }
}, {
    versionKey: false
});

module.exports.eventRaffleTier2 = model('event-raffle-tier2', eventRaffleTier2);