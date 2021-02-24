const { mongoConnect } = require("../functions/mongodb-connection");
const { prefixModel } = require("../schema/prefixes");
const { logger } = require("../teaBot");
const { botPrefix } = require('../bot-settings.json');


const guildPrefixesCache = {}; // {'guildID': 'prefix'}

async function loadPrefixes(bot) {
    return new Promise(async (resolve, reject) => {
        await mongoConnect().then(async mongoose => {
            try {
                await prefixModel.find({ prefix: { $exists: true } }, (err, docs) => {
                    if (err) return reject(err);

                    let cacheNumber = 0;
                    for (const guild of bot.guilds.cache) {
                        const guildDocument = docs.find(doc => doc._id === guild[0]);
                        if (guildDocument) {
                            guildPrefixesCache[guild[0]] = guildDocument.prefix;
                            cacheNumber++;
                        }
                    }
                    resolve({ message: `'prefixes' collection has loaded successfully.`, data: guildPrefixesCache, length: cacheNumber });
                }).lean();
            } finally {
                mongoose.connection.close().then(() => logger('debug', `guild-prefixes.js:3 loadPrefixes() Connection closed.`));
            }

        }).catch(reject);
    });
};

async function savePrefix(guild, prefix) {
    return new Promise(async (resolve, reject) => {
        await mongoConnect().then(async mongoose => {
            try {
                await prefixModel.findOneAndUpdate({ _id: guild.id }, { _id: guild.id, name: guild.name, prefix }, { upsert: true, returnOriginal: false }, (err, doc, res) => {
                    if (err) return reject(err);
                    guildPrefixesCache[guild.id] = prefix; // Set/Update the cache value
                    resolve({ message: `'prefixes' collection has updated '${guild.name}' guild prefix successfully.`, data: { guild: doc.name, prefix: doc.prefix } });
                }).lean();
            } finally {
                mongoose.connection.close().then(() => logger('debug', `guild-prefixes.js:1 savePrefix() Connection closed.`));
            }
        }).catch(reject);
    });
};

async function removePrefix(guild) {
    return new Promise(async (resolve, reject) => {
        await mongoConnect().then(async mongoose => {
            try {
                await prefixModel.deleteOne({ _id: guild.id }, {}, err => {
                    if (err) return reject(err);
                    delete guildPrefixesCache[guild.id];
                    resolve({ message: `document has been removed from the 'prefixes' collection if it existed.` });
                });
            } finally {
                mongoose.connection.close().then(() => logger('debug', `guild-prefixes.js:1 removePrefix() Connection closed.`));
            }
        }).catch(reject);
    });
};

function guildPrefix(guild) {
    if (guild?.id) return guildPrefixesCache[guild.id]; // return a specific key
    else return botPrefix; // return default prefix if incorrect guild
};

module.exports = {
    loadPrefixes,
    savePrefix,
    removePrefix,
    guildPrefix
}