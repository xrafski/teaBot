const { MongoClient } = require("../functions/mongodb-connection");
const { eventModel } = require("../schema/event-codes"); // { id: 'testCode', hint: 'string', available: true, prize: { claimed: false, code: '', item: "ItemName", userID: '0', userTag: '' } }
const { eventSettingsModel } = require("../schema/event-settings");
const eventCache = {}; // { code: { available: true, userID: '', claimed: false } }
let eventStatus = { status: false } // { status: false }

async function addCode(codeStr, itemName, codeHint, redeemCode, callback) {

    if (!codeStr || !itemName) return callback(new Error(`codeStr or itemName is not suppled for addCode() function`), null);
    await MongoClient().then(async () => {

        const dataFormat = {
            id: codeStr,
            hint: codeHint,
            available: true,
            prize: {
                claimed: false, code: redeemCode = redeemCode || '', item: itemName, userID: '', userTag: ''
            }
        }
        const newDocument = new eventModel(dataFormat);
        await eventModel.create(newDocument)
            .then(doc => {

                if (doc._doc) {
                    eventCache[doc._doc.id] = { available: doc._doc.available, hint: doc._doc.hint, userID: '', claimed: false };
                    callback(null, { message: `added '${doc._doc.id}' code to the 'event-codes' collection successfully.`, doc: doc._doc });
                } else callback(new Error(`Insert document failed.`), null);
            })
            .catch(err => callback(err, null));
    }).catch(err => callback(err, null));

};

async function delCode(codeStr, callback) {

    if (!codeStr) return callback(new Error(`codeStr is not suppled for delCode() function`), null);
    await MongoClient().then(async () => {

        await eventModel.findOneAndDelete({ id: codeStr }, {}, (err, deletedDoc) => {
            if (err) return callback(err, null);

            if (deletedDoc) {
                delete eventCache[deletedDoc.id];
                callback(null, { message: `Successfully deleted document associated with '${deletedDoc.id}' code.`, deletedDoc });
            }
            else callback(new Error(`No document found for the '${codeStr}' code.`), null);
        }).lean();
    }).catch(err => callback(err, null));
};

async function loadCodes(callback) {
    await MongoClient().then(async () => {
        await eventModel.find({ available: { $exists: true } }, (err, docs) => {
            if (err) return callback(err, null);

            let cacheNumber = 0;
            for (const code of docs) {
                eventCache[code.id] = { available: code.available, hint: code.hint, userID: code.prize.userID, claimed: code.prize.claimed };
                cacheNumber++;
            }
            callback(null, { message: `'eventCache Object' successfully loaded '${cacheNumber}' codes from the 'event-codes' collection.`, eventCache, length: cacheNumber })
        }).lean();
    }).catch(err => callback(err, null));
};

async function updateCode(codeStr, updateData, callback) {
    if (!codeStr || !updateData) return callback(new Error('codeStr or updateData is not provided for the updateCode().'), null);

    // const updateData = { // update example
    //     "$set": {
    //         'available': false,
    //         'prize.userID': author.id,
    //         'prize.userTag': author.tag
    //     }
    // }

    await MongoClient().then(async () => {
        await eventModel.findOneAndUpdate({ id: codeStr }, updateData, { returnOriginal: false }, (err, doc) => {
            if (err) return callback(err, null);
            if (doc) {
                eventCache[doc.id] = { available: doc.available, hint: doc.hint, userID: doc.prize.userID, claimed: doc.prize.claimed };
                callback(null, { message: `code '${doc.id}' information has been updated in the 'event-codes' collection.`, doc });
            } else callback(new Error(`Document for '${codeStr}' code is not found.`), '');
        }).lean();
    }).catch(err => callback(err, null));
};

async function codeDetails(codeStr, callback) {

    await MongoClient().then(async () => {
        await eventModel.findOne({ id: codeStr }, (err, doc) => {
            if (err) return callback(err, null);

            if (doc) callback(null, { message: `'event-codes' collection has found '${doc.id}' successfully.`, doc });
            else callback(new Error(`No document found for '${codeStr}' code.`), null);
        }).lean();
    }).catch(err => callback(err, null));
};

function codeValidation(codeStr) {
    if (!codeStr) return { code: 'missing_code' };
    else if (!eventCache[codeStr]) return { code: 'invalid_code' };
    else if (eventCache[codeStr].available === false) return { code: 'used_code' };
    else if (eventCache[codeStr].available === true) return { code: 'correct_code' };
    else return { code: 'unknow_error' };
};

function claimValidation(codeStr, user) {
    if (!codeStr || !user) return { code: 'missing_arguments' };
    else if (eventCache[codeStr]?.userID === user.id && eventCache[codeStr]?.claimed === false) return { code: 'correct_claim_request' }
    else return { code: 'invalid_claim' };
};

function checkEventCache() {
    return eventCache;
};

function checkEventStatus() {
    return eventStatus;
};

async function setEventStatus(status, callback) {

    await MongoClient().then(async () => {
        await eventSettingsModel.findOneAndUpdate({ id: 'event-status' }, { id: 'event-status', status }, { upsert: true, returnOriginal: false }, (err, doc) => {
            if (err) return callback(err, null);

            if (doc) {
                eventStatus = { status: doc.status };
                callback(null, { message: `Status in the '${doc.id}' document has been updated inside the 'event-settings' collection.`, doc });
            } else callback(new Error(`'event-status' document was not found.`), null);
        }).lean();
    });
};

async function loadEventStatus(callback) {
    await MongoClient().then(async () => {

        await eventSettingsModel.findOne({ id: 'event-status' }, (err, doc) => {
            if (err) {
                eventStatus = { status: false };
                return callback(err, null);
            }

            if (doc) {
                eventStatus = { status: doc.status };
                callback(null, { message: `'eventStatus' successfully loaded '${doc.id}' from the 'event-status' collection.`, eventStatus })
            } else callback(new Error(`'event-status' document is not found.`), null);
        }).lean();
    }).catch(err => callback(err, null));
};

function remainingCodes() {
    let availableCodes = 0;
    let availableHints = '';
    const totalCodes = Object.keys(eventCache).length;

    for (const code in eventCache) {
        if (Object.hasOwnProperty.call(eventCache, code)) {
            const element = eventCache[code];
            if (element.available === true) {
                availableCodes++;
                if (element.hint) availableHints = availableHints + `\n${element.hint}`;
            }
        }
    }
    return { totalCodes, availableCodes, availableHints };
}

module.exports = {
    addCode,
    delCode,
    loadCodes,
    updateCode,
    codeValidation,
    codeDetails,
    checkEventCache,
    claimValidation,
    checkEventStatus,
    setEventStatus,
    loadEventStatus,
    remainingCodes
}