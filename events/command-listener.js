const { bot, botReply, ownerDM, logger } = require('../teaBot');
const config = require('../bot-settings.json');

bot.on("message", async message => {
    const { content, channel, guild, author } = message;
    if (!content.toLowerCase().startsWith(config.botDetails.prefix)) return;
    if (author.bot) return;

    const args = content.slice(config.botDetails.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmdFile = bot.commands.get(command);
    if (cmdFile) {
        // removeUserLastMessage(message)
        logger('info', `command-listener.js:1 () '${author.tag}' used '${(content.length > 40 ? `${content.slice(0, 40)}...` : `${content}`)}' on the ${(channel?.name ? `#${channel.name} channel` : 'direct message')}${(guild?.name ? ` in '${guild.name}' server` : '')}.`);
        switch (cmdFile.help.type?.toLowerCase()) {
            case 'botowner': { // only me
                if (channel.type != "dm") {
                    if (author.id === config.botDetails.owner.id || guild.members.cache.get(author.id)?.roles.cache.some(role => role.id === config.roles.projectDirectorID)) return cmdFile.run(bot, message, args);
                    else return botReply(`Insufficient permissions!\nOnly the bot owner/director can use **${config.botDetails.prefix}${cmdFile.help.name}** command!`, message);
                } else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "administrator": { // TEA Main Server user with ADMINISTRATOR permission
                if (channel.type != "dm") {
                    if (guild.id === config.botDetails.TEAserverID && message.member.hasPermission('ADMINISTRATOR')) return cmdFile.run(bot, message, args);
                    else return botReply(`You don't have access to run **${config.botDetails.prefix}${cmdFile.help.name}**!`, message);
                } else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "eventmanager": { // TEA Event Manager Access
                if (channel.type != "dm") {
                    if (guild.id === config.botDetails.TEAserverID && guild.members.cache.get(author.id)?.roles.cache.some(role => role.id === config.roles.eventManagerID)) return cmdFile.run(bot, message, args);
                    else return botReply(`You don't have access to run **${config.botDetails.prefix}${cmdFile.help.name}**!`, message);
                } else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case 'serverowner': { // TEA member server owner
                if (channel.type != "dm") {
                    if (author === guild.owner.user || author.id === config.botDetails.owner.id) return cmdFile.run(bot, message, args);
                    else return botReply(`Insufficient permissions!\nOnly the server owner can use **${config.botDetails.prefix}${cmdFile.help.name}** command!`, message);
                } else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case 'serverstaff': { // TEA member server staff
                if (channel.type != "dm") {
                    if (message.member.hasPermission('MANAGE_GUILD') || author.id === config.botDetails.owner.id) return cmdFile.run(bot, message, args);
                    else return botReply(`Insufficient permissions!\nOnly users with '**Manage Server**' permission can use **${config.botDetails.prefix}${cmdFile.help.name}** command!`, message);
                } else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is not available on DM!`, message);
            }
            case "dm": if (channel.type === "dm") return cmdFile.run(bot, message, args);
            else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is only available via direct message.`, message);

            case "public": if (channel.type != "dm") return cmdFile.run(bot, message, args);
            else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is not available on DM!`, message);

            case "disabled": if (channel.type != "dm") return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is currently **disabled**!`, message);
            else return botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** is currently **disabled**!`, message);

            default: {
                botReply(`**${config.botDetails.prefix}${cmdFile.help.name}** Command error, try again later!`, message);
                ownerDM(`Error with ${bot.user} application\n command-listener.js () One of the commands has incorrect type, check out console for more info.`);
                return logger('warn', `command-listener.js:2 command switch() default - incorrect type set for the '${config.botDetails.prefix}${cmdFile.help.name}' command.`);
            }
        }
    }
});