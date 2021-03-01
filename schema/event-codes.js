const { Schema, model } = require("mongoose");

const eventModel = new Schema({
    id: { type: String, unique: true, required: true, lowercase: true },
    available: { type: Boolean, required: true },
    prize: {
        claimed: { type: Boolean, required: true },
        code: { type: String },
        item: { type: String, required: true },
        userID: { type: String },
        userTag: { type: String }
    }
}, {
    // versionKey: false
});

module.exports.eventModel = model('event-codes', eventModel);