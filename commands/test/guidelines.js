const config = require('../../bot-settings.json');
const fs = require('fs');

module.exports.help = {
    name: "guidelines",
    description: "Setup guidelines channel.",
    type: "public",
    usage: `Type **${config.BotPrefix}guildelines #channel** to set channel to send guidelines message.`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                        guidelines                                        //
    //////////////////////////////////////////////////////////////////////////////////////////////
    // command only for server admins + representative role (TEA) 

    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`You have insufficient permissions!‏‏‎\nOnly **server admins** can use **${config.BotPrefix}${module.exports.help.name}** command!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });

    if (!args.length) return message.reply(`PLACEHOLDER - Missing arguments`)
        .then(message => message.delete({ timeout: 5000 })).catch(() => { return; });

    if (args[0].toLowerCase() === 'disable') {
        let guildGuidelinesDB = JSON.parse(fs.readFileSync("./guild-guidelines.json", "utf8"));

        if (guildGuidelinesDB[message.guild.id]) {
            delete guildGuidelinesDB[message.guild.id];
            fs.writeFileSync("./guild-guidelines.json", JSON.stringify(guildGuidelinesDB), "utf8");
            return message.reply(`Guidelines channel has disabled.`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
        } else return message.reply(`There is no active channel set to receive guidelines.\nFeel free to set one with **${config.BotPrefix}${module.exports.help.name} #channel** command.`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
    }

    if (args[0] && args[0].startsWith('<#') && args[0].endsWith('>')) {
        const replaceMentionToID = args[0].toString().replace(/[\\<>@#&!]/g, ""); // replace mention to an ID
        const guidelinesChannel = await message.guild.channels.cache.get(replaceMentionToID);
        if (!guidelinesChannel) return message.reply(`PLACEHOLDER - I can't find the channel`)
            .then(message => message.delete({ timeout: 5000 })).catch(() => { return; });

        const TEAmember = await bot.guilds.cache.get(config.TEAserverID).members.cache.get(message.author.id);
        if (!TEAmember) return message.reply(`PLACEHOLDER - You are not in TEA server.`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });

        const TEArepresentative = TEAmember.roles.cache.some(role => role.id === config.TEArepresentativeRoleID);
        if (!TEArepresentative) return message.reply(`PLACEHOLDER - You are not TEA Representative.`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });

        let guildGuidelinesDB = JSON.parse(fs.readFileSync("./guild-guidelines.json", "utf8"));

        if (!guildGuidelinesDB[message.guild.id]) {

            // guildGuidelinesDB = JSON.stringify(guildGuidelinesDB, null, 2);
            guildGuidelinesDB = JSON.stringify(guildGuidelinesDB);
            guildGuidelinesDB = guildGuidelinesDB.substring(0, guildGuidelinesDB.length - 1)
            guildGuidelinesDB = guildGuidelinesDB + `,"${message.guild.id}":"${guidelinesChannel.id}"}`;
            fs.writeFileSync("./guild-guidelines.json", guildGuidelinesDB, "utf8");
            return message.reply(`${guidelinesChannel} has been set to receive guidelines.`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
        } else {

            if (guildGuidelinesDB[message.guild.id] != guidelinesChannel.id) {
                guildGuidelinesDB[message.guild.id] = guidelinesChannel.id;
                fs.writeFileSync("./guild-guidelines.json", JSON.stringify(guildGuidelinesDB), "utf8");
                return message.reply(`The channel for guidelines has been updated to ${guidelinesChannel}.`)
                    .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
            }
            return message.reply(`There is nothing to add/update!\n${guidelinesChannel} is currently set to receive guidelines.`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
        }
    } else return message.reply(`PLACEHOLDER - You have to mention a channel.`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return; });
}