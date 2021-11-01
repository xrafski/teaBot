const { Schema, model } = require('mongoose');

const threatModel = new Schema({
    // _id: { type: String, required: true },
    name: { type: String, required: true, index: true, unique: true, dropDups: true, },
    warning: { type: String, default: null },
    reason: { type: String, required: true },
    status: { type: String, default: null },
    evidence: { type: String, default: null },
    alternates: { type: String, default: null },
    discord: { type: String, default: null },
    notes: { type: String, default: null },
    personal: { type: String, default: null }
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'threat'
});

// define indexes to be create
// threatModel.index({ id: 1 });

module.exports.threatModel = model('threat', threatModel);