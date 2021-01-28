const { bot, removeUserLastMessage, errorLog, botReply } = require('../teaBot');
const config = require("../bot-settings.json");

bot.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.botPrefix)) return;

    const args = message.content.slice(config.botPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmdFile = bot.commands.get(command);
    if (cmdFile) {
        removeUserLastMessage(message);
        console.info(`command-listener.js:1 (ℹ) '${message.author.tag}' used '${message.content}' on the #${message.channel.name} channel in '${message.guild.name}' server.`);

        switch (cmdFile.help.type) {
            case "administrator": {
                if (message.channel.type != "dm") {
                    if (message.guild.id === config.TEAserverID && message.member.hasPermission("ADMINISTRATOR")) return cmdFile.run(bot, message, args);
                    else return botReply(`You don't have access to run **${config.botPrefix}${cmdFile.help.name}**!`, message, 10000);
                } else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "dm": if (message.channel.type === "dm") return cmdFile.run(bot, message, args);
            else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is only available via direct message.`, message, 10000);

            case "public": if (message.channel.type != "dm") return cmdFile.run(bot, message, args)
            else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is not available on DM!`, message);

            case "disabled": if (message.channel.type != "dm") return botReply(`**${config.botPrefix}${cmdFile.help.name}** is currently **disabled**!`, message, 10000);
            else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is currently **disabled**!`, message);

            default: {
                if (message.channel.type != "dm") botReply(`**${config.botPrefix}${cmdFile.help.name}** ERROR, try again later!`, message, 10000);
                else botReply(`**${config.botPrefix}${cmdFile.help.name}** ERROR, try again later!`, message);
                return errorLog(`command-listener.js:1 command switch() default - no type was found for the ${cmdFile.help.name} command.`);
            }
        }
    }
});