const { Schema, model } = require("mongoose");

const eventRaffleTier0 = new Schema({
    id: { type: String, required: true },
    tag: { type: String, required: true },
    code: { type: String, required: true },
    club: { type: String, required: true },
    entry: { type: String, required: true, lowercase: true, unique: true }
}, {
    versionKey: false
});

module.exports.eventRaffleTier0 = model('event-raffle-tier0', eventRaffleTier0);