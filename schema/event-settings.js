const { Schema, model } = require("mongoose");

const eventSettingsModel = new Schema({
    id: { type: String, unique: true, required: true },
    status: { type: Boolean, required: true },
}, {
    // versionKey: false
});

module.exports.eventSettingsModel = model('event-settings', eventSettingsModel);