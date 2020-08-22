const config = require("../bot-settings.json");
const fs = require('fs');

module.exports.help = {
    name: "certification",
    description: "Shows if the guild is a certified TEA member.",
    type: "public",
    usage: `**${config.BotPrefix}certification** owner(optional)`
};

module.exports.run = async (bot, message, args) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           cert                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    const TEAemoji = bot.guilds.cache.get(config.TEAserverID).emojis.cache.find(emoji => emoji.name === 'TEA');
    const TEAverified = bot.guilds.cache.get(config.TEAserverID).emojis.cache.find(emoji => emoji.name === 'verified');

    if (TEAemoji && TEAverified) {
        if (message.guild.id === config.TEAserverID) {
            return message.channel.send(`${TEAverified} **${message.guild.name}** is a primary server of the ${TEAemoji} Trove Ethics Alliance.`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
        }

        const cert = fs.readFileSync("./certification.json", "utf8");
        const certification = JSON.parse(cert);

        if (args[0] === 'owner') {
            if (certification[message.guild.id]) {
                return message.channel.send(`${TEAverified} Certification owner **${certification[message.guild.id].representative.name}** (${certification[message.guild.id].representative.id}).`)
                    .then(message => message.delete({ timeout: 30000 })).catch(() => { return });
            } else return message.channel.send(`❌ This guild is not a certified member of the ${TEAemoji} **Trove Ethics Alliance**.`)
                .then(message => message.delete({ timeout: 30000 })).catch(() => { return });
        }

        if (certification[message.guild.id]) {
            return message.channel.send(`${TEAverified} **${message.guild.name}** is a certified member of the ${TEAemoji} Trove Ethics Alliance.`)
                .then(message => message.delete({ timeout: 30000 })).catch(() => { return });
        } else return message.channel.send(`❌ This guild is not a certified member of the ${TEAemoji} **Trove Ethics Alliance**.`)
            .then(message => message.delete({ timeout: 30000 })).catch(() => { return });
    }
}