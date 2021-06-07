const { Schema, model } = require("mongoose");

const eventCodeModel = new Schema({
    id: { type: String, unique: true, required: true, lowercase: true },
    type: { type: String, required: true, lowercase: true },
    hint: { type: String },
    available: { type: Boolean, required: true },
    prize: {
        claimed: { type: Boolean, required: true },
        item: { type: String },
        userID: { type: String },
        userTag: { type: String }
    }
}, {
    versionKey: false
});

module.exports.eventCodeModel = model('event-codes', eventCodeModel);