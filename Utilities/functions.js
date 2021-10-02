const dateFormat = require("dateformat");
const client = require('../teaBot');

/**
 * logger system!
 * @param {string} type - debug/log/info/warn/error/event/mongo/trace/update
 * @param {string} text - any text with to include with the log
 * @param {string} error - error string or object to include with the log
 * @returns console log with current date and message.
 */
function logger(type, text, error) {
    if (type?.toLowerCase() === 'debug' && client.config.bot.debug === false) return; // check if debug is enabled
    text = text?.replace(/\s+/g, ' ');

    const logDate = dateFormat(new Date(), "UTC:dd/mm/yyyy - hh:MM:ss TT");
    if (!type) return logger('trace', 'logger.js:1 logger() Missing type for command in this trace');

    switch (type.toLowerCase()) {
        case 'debug': return console.debug(`[${logDate} UTC] [DEBUG] 🟣 ${text}${(error ? ` | ${error}` : '')}`);
        case 'log': return console.log(`[${logDate} UTC] [LOG] 🟢 ${text}${(error ? ` | ${error}` : '')}`);
        case 'info': return console.info(`[${logDate} UTC] [INFO] 🔵 ${text}${(error ? ` | ${error}` : '')}`);
        case 'warn': return console.warn(`[${logDate} UTC] [WARN] 🟠 ${text}${(error ? ` | ${error}` : '')}`);
        case 'error': return console.error(`[${logDate} UTC] [ERROR] 🔴 ${text}${(error ? ` | ${error}` : '')}`);
        case 'event': return console.log(`[${logDate} UTC] [EVENT] ⚪ ${text}${(error ? ` | ${error}` : '')}`);
        case 'mongo': return console.log(`[${logDate} UTC] [MONGODB] 📝 ${text}${(error ? ` | ${error}` : '')}`);
        case 'trace': return console.trace(`[${logDate} UTC] [TRACE] 🟡 ${text}${(error ? ` | ${error}` : '')}`);
        case 'update': return console.log(`[${logDate} UTC] [UPDATE] 🟤 ${text}${(error ? ` | ${error}` : '')}`);
        default: return console.log(`[${logDate} UTC] [DEFAULT] ⚫ ${type} | ${text} | ${error}`);
    }
}

/**
 * Function to set guild commands and its required permissions.
 * @param {Object} guildObject - Object with the guild information.
 * @param {Array} slashCommandsArray - Array with slash commands collector
 * @returns message on success, and error on failure.
 */
function registerGuildCommands(guildObject, slashCommandsArray) {

    return new Promise(async (resolve, reject) => {

        if (typeof guildObject !== 'object') return reject(new Error('Invalid guild object is provided'));
        if (typeof slashCommandsArray !== 'object') return reject(new Error('Invalid slashCommandsArray is provided'));
        // const guildObject = client.guilds.cache.get(guildID);
        // if (!guildObject) return reject(`Error to get the guild Object from provided ID '${guildID}'.`);

        guildObject.commands.set(slashCommandsArray)
            .then(command => {
                const Roles = commandName => {
                    const cmdPerms = slashCommandsArray.find(c => c.name === commandName).perms;
                    if (!cmdPerms) return null;
                    return guildObject.roles.cache.filter(r => r.permissions.has(cmdPerms) && !r.managed);
                };

                const fullPermissions = command.reduce((ac, x) => {
                    const roles = Roles(x.name);
                    if (!roles) return ac;

                    const permissions = roles.reduce((a, v) => {
                        return [...a, { id: v.id, type: "ROLE", permission: true }];
                    }, []);

                    return [...ac, { id: x.id, permissions }];
                }, []);

                guildObject.commands.permissions.set({ fullPermissions })
                    .then(resolve(`🆗 Registered and set permissions of '${guildObject.name}' Slash Commands successfully!`))
                    .catch(reject);
                // .then(console.log(`🆗 Handlers/Commands.js (2) Slash command permissions set for '${selectedGuild.name}' successfully!`))
                // .catch(error => console.log(`❌ Handlers/Commands.js (3) Error to set guild slash commands permissions`, error));
            })
            .catch(reject);
    });


}



module.exports = {
    logger,
    registerGuildCommands,

    /**
     * Find and return emoji by its name
     * @param {number} serverID 
     * @param {string} emojiName 
     * @returns emoji object data
     */
    getEmoji: function (serverID, emojiName) {
        let getEmoji = client.guilds.cache.get(serverID)?.emojis.cache.find(emoji => emoji.name === emojiName);
        if (getEmoji) return getEmoji;
        else return getEmoji = '🐛';
        // else return undefined;
    },
}