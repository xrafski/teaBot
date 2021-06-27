const { Schema, model } = require("mongoose");

const eventCodeModel = new Schema({
    id: { type: String, unique: true, required: true, lowercase: true },
    type: { type: String, required: true, lowercase: true },
    hint: { type: String },
    available: { type: Boolean, required: true },
    group: { type: String, default: 'global', lowercase: true },
    club: { type: String, default: '' },
    prize: {
        claimed: { type: Boolean, required: true },
        item: { type: String, default: '' },
        userID: { type: String, default: '' },
        userTag: { type: String, default: '' }
    }
}, {
    versionKey: false
});

module.exports.eventCodeModel = model('event-codes', eventCodeModel);