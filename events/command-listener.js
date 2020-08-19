const { bot, removeUserLastMessage, errorLog } = require('../tea');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                                     COMMANDS HANDLER                                     //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (!message.content.startsWith(config.BotPrefix)) return;

    const args = message.content.slice(config.BotPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let cmdFile = bot.commands.get(command);
    if (cmdFile) {
        removeUserLastMessage(message.author);

        switch (cmdFile.help.type) {
            case "administrator": {
                if (message.guild.id === config.TEAserverID && message.member.hasPermission("ADMINISTRATOR")) return cmdFile.run(bot, message, args);
                else return message.reply(`You don't have access to run **${config.BotPrefix}${cmdFile.help.name}** command!`)
                .then(message => { message.delete({ timeout: 10000 }).catch(() => { return; }) });
            }
            case "public": return cmdFile.run(bot, message, args);
            case "disabled": return message.reply(`**${config.BotPrefix}${cmdFile.help.name}** command is currently **disabled**!`)
                .then(message => { message.delete({ timeout: 10000 }).catch(() => { return; }) });
            default: return errorLog(`command-listener.js:1 command switch() default - no type was found for the ${cmdFile.help.name} command.`);
        }
    }
});