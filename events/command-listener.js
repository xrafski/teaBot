const { bot, removeUserLastMessage, errorLog, botReply } = require('../teaBot');
const config = require("../bot-settings.json");

bot.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.BotPrefix)) return;

    const args = message.content.slice(config.BotPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmdFile = bot.commands.get(command);
    if (cmdFile) {
        removeUserLastMessage(message.author);

        switch (cmdFile.help.type) {
            case "administrator": {
                if (message.channel.type != "dm") {
                    if (message.guild.id === config.TEAserverID && message.member.hasPermission("ADMINISTRATOR")) return cmdFile.run(bot, message, args);
                    else botReply(`You don't have access to run **${config.BotPrefix}${cmdFile.help.name}**!`, message, 10000, true, false, false);
                } else return botReply(`**${config.BotPrefix}${cmdFile.help.name}** is not available on DM!`, message, 0, false, false, false);
            }
            case "dm": if (message.channel.type === "dm") return cmdFile.run(bot, message, args);
            else return botReply(`**${config.BotPrefix}${cmdFile.help.name}** is only available via direct message.`, message, 10000, true, false, false);

            case "public": if (message.channel.type != "dm") return cmdFile.run(bot, message, args)
            else return botReply(`**${config.BotPrefix}${cmdFile.help.name}** is not available on DM!`, message, 0, false, false, false);

            case "disabled": if (message.channel.type != "dm") return botReply(`**${config.BotPrefix}${cmdFile.help.name}** is currently **disabled**!`, message, 10000, true, false, false);
            else return botReply(`**${config.BotPrefix}${cmdFile.help.name}** is currently **disabled**!`, message, 0, false, false, false);

            default: {
                if (message.channel.type != "dm") botReply(`**${config.BotPrefix}${cmdFile.help.name}** ERROR, try again later!`, message, 10000, true, false, false);
                else botReply(`**${config.BotPrefix}${cmdFile.help.name}** ERROR, try again later!`, message, 0, false, false, false,);
                return errorLog(`command-listener.js:1 command switch() default - no type was found for the ${cmdFile.help.name} command.`);
            }
        }
    }
});