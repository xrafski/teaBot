const { Schema, model } = require("mongoose");

const prefixModel = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    prefix: { type: String, required: true }
}, {
    // versionKey: false
});

module.exports.prefixModel = model('prefixes', prefixModel);