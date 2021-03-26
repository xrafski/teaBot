const { MongoClient } = require("../functions/mongodb-connection");
const { eventFixedCodeModel } = require("../schema/event-codes-fixed");
const { eventPriorityCodeModel } = require("../schema/event-codes-priority");
const { eventSettingsModel } = require("../schema/event-settings");

const eventCodeCache = {}; // example: { code: { available: true, type: 'fixed', hint: 'my cool hint' } }
let eventStatus = { status: false }; // default: { status: false }
let blockEventCommand = { status: false }; // switch to disable event command while processing requests | default: { status: false }

/**
 * Return event cache data 'eventstatus'/'eventcodes'/'blockevent'.
 * @param {string} type - 'eventstatus' - returns boolean from eventStatus Object | 'eventcodes' returns eventCodeCache Object | 'blockevent' returns boolean from blockEventCommand Object
 */
function checkEventCache(type) {
    if (type === 'eventstatus') return eventStatus.status;
    else if (type === 'eventcodes') return eventCodeCache;
    else if (type === 'blockevent') return blockEventCommand.status;
}

/**
 * Update event status value in the eventStatus Object inside the tea-event-cache.js file.
 * @param {boolean} status - boolean - enable/disable event command while processing
 */
function blockEventWhileProcessing(status) {
    blockEventCommand = { status };
}

/**
 * Callback for updateEventStatus.
 *
 * @callback callbackInfo
 * @param {Object} err - Error Object.
 * @param {Object} res - Response from callback (res.message - String with results), res.doc - document from the database
 */

/**
 * Update event status value in the eventStatus Object inside the tea-event-cache.js file.
 * @param {boolean} status - boolean - enable/disable event system commands
 * @param {callbackInfo} callback - A callback to run.
 */
async function updateEventStatus(status, callback) {
    await MongoClient().then(async () => {

        await eventSettingsModel.findOneAndUpdate({ id: 'event-status' }, { id: 'event-status', status }, { upsert: true, new: true })
            .then(doc => {

                if (doc) {
                    eventStatus = { status: doc.status };
                    callback(null, { message: `Status set to '${status}' in the '${doc.id}' document.`, doc });
                } else callback(new Error(`'event-status' document was not found.`), null);
            }).catch(err => callback(err, null));
    });
}

/**
 * Callback for loadEventStatus.
 *
 * @callback callbackInfo
 * @param {Object} err - Error Object.
 * @param {Object} res - Response from callback (res.message - String with results), res.doc - document from the database
 */

/**
 * Load event status value from the MongoDB document and update eventStatus Object in the tea-event-cache.js file.
 * @param {callbackInfo} callback - A callback to run.
 */
async function loadEventStatus(callback) {
    await MongoClient().then(async () => { // connect to MongoDB

        await eventSettingsModel.findOne({ id: 'event-status' }).exec()
            .then(doc => {

                if (doc) {
                    eventStatus = { status: doc.status };
                    callback(null, { message: `Successfully loaded '${doc.id}' with '${doc.status}' status from the 'event-settings' collection.`, eventStatus });
                } else callback(new Error(`'event-status' document is not found.`), null);

            }).catch(err => callback(err, null));
    }).catch(err => callback(err, null));
}

/**
 * Update eventCodeCache Object.
 * @param {String} key - element ID in the Object.
 * @param {Object} data - data to put inside the Object (if data is not provided then it will delete the record from cache).
 * 
 * ### Example Data
 * { available: true, hint: 'some hint text', userID: '', claimed: false }
 */
function updateCodeCache(key, data) {
    if (!data) delete eventCodeCache[key];
    else eventCodeCache[key] = data;
}

/**
 * Callback for loadEventCodes.
 *
 * @callback callbackInfo
 * @param {Object} err - Error Object.
 * @param {Object} res - Response from callback (res.message - String with results), res.doc - document from the database
 */

/**
 * Load codes from the MongoDB document and update eventCodeCache Object in the tea-event-cache.js file.
 * @param {String} codeType - event code type: 'fixed'/'priority'.
 * @param {callbackInfo} callback - A callback to run.
 */
async function loadEventCodes(codeType, callback) {
    await MongoClient().then(async () => {

        switch (codeType?.toLowerCase()) {
            case 'fixed': {

                return await eventFixedCodeModel.find({ available: { $exists: true } }).exec()
                    .then(docs => {

                        let cacheNumber = 0;
                        for (const code of docs) {
                            cacheNumber++;
                            if (code.available === true) eventCodeCache[code.id] = { available: code.available, type: code.type, hint: code.hint };
                            else eventCodeCache[code.id] = { available: code.available };
                        }
                        callback(null, { message: `'eventCodeCache Object' successfully loaded '${cacheNumber}' codes from the 'event-codes-fixed' collection.`, eventCodeCache, length: cacheNumber });
                    }).catch(err => callback(err, null));
            }

            case 'priority': {

                return await eventPriorityCodeModel.find({ available: { $exists: true } }).exec()
                    .then(docs => {
                        
                        let cacheNumber = 0;
                        for (const code of docs) {
                            cacheNumber++;
                            if (code.available === true) eventCodeCache[code.id] = { available: code.available, type: code.type, hint: code.hint };
                            else eventCodeCache[code.id] = { available: code.available };
                        }
                        callback(null, { message: `'eventCodeCache Object' successfully loaded '${cacheNumber}' codes from the 'event-codes-priority' collection.`, eventCodeCache, length: cacheNumber });
                    })
                    .catch(err => callback(err, null));
            }

            default: return callback(new Error(`Unknown codeType provided(${codeType}) for the loadEventCodes() function.`), null);
        }

    }).catch(err => callback(err, null));
}

/**
 * Fuction to check remaining codes.
 * @returns Object { totalCodes, availableCodes, availableHints }.
 */
function remainingCodes() {
    let availableCodes = 0;
    let availableHints = '';
    const totalCodes = Object.keys(eventCodeCache).length;

    for (const code in eventCodeCache) {
        if (Object.hasOwnProperty.call(eventCodeCache, code)) {
            const element = eventCodeCache[code];
            if (element.available === true) {
                availableCodes++;
                if (element.hint) availableHints = availableHints + `\n${element.hint}`;
            }
        }
    }
    return { totalCodes, availableCodes, availableHints };
}

/**
 * Validate code with the cache.
 * 'missing_code'/'invalid_code'/'used_code'/'correct_code'
 * code: 'correct_code' type: fixed
 * @param {String} codeStr - Event code ID.
 * @returns object { code: 'status', type: 'codeType' }
 */
function codeValidation(codeStr) {
    if (!codeStr) return { code: 'missing_code' };
    else if (!eventCodeCache[codeStr]) return { code: 'invalid_code' };
    else if (eventCodeCache[codeStr].available === false) return { code: 'used_code' };
    else if (eventCodeCache[codeStr].available === true) return { code: 'correct_code', type: eventCodeCache[codeStr].type };
    else return { code: 'unknown_error' };
}

module.exports = {
    checkEventCache,
    updateEventStatus,
    updateCodeCache,
    loadEventStatus,
    loadEventCodes,

    remainingCodes,
    codeValidation,
    blockEventWhileProcessing
}