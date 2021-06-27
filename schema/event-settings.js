const { Schema, model } = require("mongoose");

const eventSettingsModel = new Schema({
    id: { type: String, unique: true, required: true, default: 'event-status' },
    status: { type: Boolean, required: true, default: false },
    raffleEndAt: { type: String, required: true, default: '0000-00-00' },
    raffleMessageID: { type: String, required: true, default: '0'}
}, {
    versionKey: false
});

module.exports.eventSettingsModel = model('event-settings', eventSettingsModel);