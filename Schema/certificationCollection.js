const { Schema, model } = require('mongoose');

const certificationModel = new Schema({
    // _id: { type: String, required: true },
    club: { type: String, required: true, index: true, unique: true, dropDups: true, },
    description: { type: String, default: null },
    world: { type: String, default: null },
    requirements: { type: String, default: null },
    representative: { type: String, default: null },
    discord: {
        invite: { type: String, default: null },
        id: { type: String, default: null },

    }
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'certification'
});

// define indexes to be create
// certificationModel.index({ id: 1 });

module.exports.certificationModel = model('certification', certificationModel);