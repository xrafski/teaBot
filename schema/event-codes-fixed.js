const { Schema, model } = require("mongoose");

const eventFixedCodeModel = new Schema({
    id: { type: String, unique: true, required: true, lowercase: true },
    type: { type: String, required: true, lowercase: true },
    timestamp: { type: String },
    hint: { type: String },
    available: { type: Boolean, required: true },
    prize: {
        claimed: { type: Boolean, required: true },
        item: { type: String, required: true },
        userID: { type: String },
        userTag: { type: String }
    }
}, {
    // versionKey: false
});

module.exports.eventFixedCodeModel = model('event-codes-fixed', eventFixedCodeModel);