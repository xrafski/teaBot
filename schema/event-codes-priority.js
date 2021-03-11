const { Schema, model } = require("mongoose");

const eventPriorityCodeModel = new Schema({
    id: { type: String, unique: true, required: true, lowercase: true },
    available: { type: Boolean, required: true },
    type: { type: String, required: true },
    hint: { type: String },
    timestamp: { type: String },
    userID: { type: String },
    userTag: { type: String },
    prizeID: { type: String },
    claimed: { type: Boolean }
}, {
    // versionKey: false
});

module.exports.eventPriorityCodeModel = model('event-codes-priority', eventPriorityCodeModel);