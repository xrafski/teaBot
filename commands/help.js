const { getCommand, TEAlogo, Discord, botReply } = require('../teaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "help",
    description: "List of all commands.",
    type: "public",
    usage: `ℹ️ Format: **${config.botDetails.prefix}help** commandName(optional)\nℹ️ Example(s):\n${config.botDetails.prefix}help\n${config.botDetails.prefix}help uptime\n${config.botDetails.prefix}help ping`
};

module.exports.run = async (bot, message, args) => {
    const { guild } = message;

    switch (args[0]?.toLowerCase()) {

        case 'overwatch': {
            const embed_overwatch_help = new Discord.MessageEmbed()
                .setColor('#eeff38')
                .setAuthor(`Overwatch Help Note`, TEAlogo)
                .setDescription(`Follow the instructions below to ensure that the overwatch work.`)
                .addFields(
                    { name: `Log channel`, value: `Make sure '**${config.webhooks.logs.channelName}**' channel exists, if not create a new one.`, inline: false },
                    { name: `Set the following permissions for the bot:`, value: `✅ View Channel\n✅ Manage Webhooks\n✅ Send Messages\n✅ Embed Links\n✅ Read Messages\n✅ Read Message History\n✅ Use External Emoji\n✅ Attach Files`, inline: false },
                    { name: '‏‏‎ ‎', value: `That's it. The server owner can use **${config.botDetails.prefix}test overwatch** to check configuration.`, inline: false },
                )
                .setThumbnail(TEAlogo);
            return botReply(embed_overwatch_help, message);
            // .then(helpOverwatch => messageRemoverWithReact(helpOverwatch, author));
        }
        case 'announcements': {
            const embed_announcements_help = new Discord.MessageEmbed()
                .setColor('#eeff38')
                .setAuthor(`TEA Announcements Help Note`, TEAlogo)
                .setDescription(`Follow the instructions below to ensure that announcements work.`)
                .addFields(
                    { name: `Announcements channel`, value: `Make sure '**${config.webhooks.announcements.channelName}**' channel exists, if not create a new one.`, inline: false },
                    { name: `Set the following permissions for the bot:`, value: `✅ View Channel\n✅ Manage Webhooks\n✅ Send Messages\n✅ Embed Links\n✅ Read Messages\n✅ Read Message History\n✅ Use External Emoji\n✅ Attach Files`, inline: false },
                    { name: '‏‏‎ ‎', value: `That's it. The server owner can use **${config.botDetails.prefix}test announcements** to check configuration.`, inline: false },
                )
                .setThumbnail(TEAlogo);
            return botReply(embed_announcements_help, message);
            // .then(helpAnnouncement => messageRemoverWithReact(helpAnnouncement, author))
        }
        default: {
            if (args[0] && getCommand(args[0])) {
                return botReply(`Help for the **${args[0]}** command:\nAccess Level: __${getCommand(args[0]).help.type}__\nDescription: ${getCommand(args[0]).help.description}\n\nUsage:\n${getCommand(args[0]).help.usage}`, message);
                // .then(helpMessage => messageRemoverWithReact(helpMessage, author));
            } else {
                const dataArray = {
                    'setup': `**${config.botDetails.prefix}help overwatch** • Information how to set up overwatch.\n**${config.botDetails.prefix}help announcements** • Information how to set up TEA announcements.`,
                    'bOwner': getCommand().filter(command => command.help.type === 'botowner').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                    'sOwner': getCommand().filter(command => command.help.type === 'serverowner').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                    'sStaff': getCommand().filter(command => command.help.type === 'serverstaff').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                    'admin': getCommand().filter(command => command.help.type === 'administrator').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                    'dm': getCommand().filter(command => command.help.type === 'dm').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                    'public': getCommand().filter(command => command.help.type === 'public').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                    'disabled': getCommand().filter(command => command.help.type === 'disabled').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n')
                };

                if (guild.id === config.botDetails.TEAserverID) {
                    return botReply(`List of all commands! (prefix: **${config.botDetails.prefix}**)\nType **${config.botDetails.prefix}help commandName** for more details.\n
🤖 Bot Owner Command(s):\n${dataArray.bOwner = dataArray.bOwner || 'There are no bot owner commands.'}\n
👮‍♂️ TEA Administrator Command(s):\n${dataArray.admin = dataArray.admin || 'There are no administrator commands.'}\n
👑 Server Owner Command(s):\n${dataArray.sOwner = dataArray.sOwner || 'There are no server owner commands.'}\n
🚓 Server Staff Command(s):\n${dataArray.sOwner = dataArray.sStaff || 'There are no server staff commands.'}\n
🔇 Direct Message Command(s):\n${dataArray.dm = dataArray.dm || 'There are no direct message commands.'}\n
📢 Public Command(s):\n${dataArray.public = dataArray.public || 'There are no public commands.'}\n
❌ Disabled Command(s):\n${dataArray.disabled = dataArray.disabled || 'There are not disabled commands.'}`, message);
                    // .then(helpMessage => messageRemoverWithReact(helpMessage, author));
                } else {
                    return botReply(`List of all commands! (prefix: **${config.botDetails.prefix}**)\nType **${config.botDetails.prefix}help commandName** for more details.\n
🔧 Setup Info:\n${dataArray.setup = dataArray.setup || 'There are not help setup commands.'}\n
👑 Server Owner Command(s):\n${dataArray.sOwner = dataArray.sOwner || 'There are no server owner commands.'}\n
🚓 Server Staff Command(s):\n${dataArray.sOwner = dataArray.sStaff || 'There are no server staff commands.'}\n
🔇 Direct Message Command(s):\n${dataArray.dm = dataArray.dm || 'There are no direct message commands.'}\n
📢 Public Command(s):\n${dataArray.public = dataArray.public || 'There are no public commands.'}`, message);
                    // .then(helpMessage => messageRemoverWithReact(helpMessage, author));
                }
            }
        }
    }
};