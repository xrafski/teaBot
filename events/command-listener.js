const { bot, botReply, ownerDM } = require('../teaBot');
const config = require("../bot-settings.json");
const { logger } = require('../functions/logger');

bot.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.botPrefix)) return;

    const args = message.content.slice(config.botPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmdFile = bot.commands.get(command);
    if (cmdFile) {
        // removeUserLastMessage(message);
        logger('info', `command-listener.js:1 | '${message.author.tag}' used '${(message.content.length > 40 ? `${message.content.slice(0, 40)}...` : `${message.content}`)}' on the ${(message.channel?.name ? `#${message.channel.name} channel` : 'direct message')}${(message.guild?.name ? ` in '${message.guild.name}' server` : '')}.`)
        switch (cmdFile.help.type?.toLowerCase()) {
            case 'botowner': {
                if (message.channel.type != "dm") {
                    if (message.author === message.guild.owner.user) return cmdFile.run(bot, message, args);
                    else return botReply(`Insufficient permissions!\nOnly the bot owner can use **${config.botPrefix}${cmdFile.help.name}** command!`, message);
                } else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case 'serverowner': {
                if (message.channel.type != "dm") {
                    if (message.author === message.guild.owner.user) return cmdFile.run(bot, message, args);
                    else return botReply(`Insufficient permissions!\nOnly the server owner can use **${config.botPrefix}${cmdFile.help.name}** command!`, message);
                } else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "administrator": {
                if (message.channel.type != "dm") {
                    if (message.guild.id === config.TEAserverID && message.member.hasPermission("ADMINISTRATOR")) return cmdFile.run(bot, message, args);
                    else return botReply(`You don't have access to run **${config.botPrefix}${cmdFile.help.name}**!`, message);
                } else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "dm": if (message.channel.type === "dm") return cmdFile.run(bot, message, args);
            else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is only available via direct message.`, message);

            case "public": if (message.channel.type != "dm") return cmdFile.run(bot, message, args)
            else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is not available on DM!`, message);

            case "disabled": if (message.channel.type != "dm") return botReply(`**${config.botPrefix}${cmdFile.help.name}** is currently **disabled**!`, message);
            else return botReply(`**${config.botPrefix}${cmdFile.help.name}** is currently **disabled**!`, message);

            default: {
                botReply(`**${config.botPrefix}${cmdFile.help.name}** Command error, try again later!`, message);
                ownerDM(`Error with ${bot.user} application\n command-listener.js () One of the commands has incorrect type, check out console for more info.`);
                return logger('warn', `command-listener.js:2 command switch() default - incorrect type set for the '${config.botPrefix}${cmdFile.help.name}' command.`);
            }
        }
    }
});