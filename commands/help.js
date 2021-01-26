const { getCommand, messageRemoverWithReact } = require('../teaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "help",
    description: "List all of commands.",
    type: "public",
    usage: `**${config.BotPrefix}help** commandName(optional)`
};

module.exports.run = async (bot, message, args) => {

    if (!args[0]) {
        {
            const dataArray = {
                'admin': getCommand().filter(command => command.help.type === 'administrator').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                'dm': getCommand().filter(command => command.help.type === 'dm').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                'public': getCommand().filter(command => command.help.type === 'public').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
                'disabled': getCommand().filter(command => command.help.type === 'disabled').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n')
            }

            if (!dataArray.disabled) return message.channel.send(`List of all commands! (prefix: **${config.BotPrefix}**)Type **${config.BotPrefix}help commandName** for more details.\n
👮‍♂️ Administrator Commands:\n${dataArray.admin = dataArray.admin || 'There are no administrator commands.'}\n
🔇 Direct Message Commands:\n${dataArray.dm = dataArray.dm || 'There are no direct message commands.'}\n
📢 Public Commands:\n${dataArray.public = dataArray.public || 'There are no public commands.'}`)
                .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));

            return message.channel.send(`List of all commands! (prefix: **${config.BotPrefix}**)\nType **${config.BotPrefix}help commandName** for more details.\n
👮‍♂️ Administrator Commands:\n${dataArray.admin = dataArray.admin || 'There are no administrator commands.'}\n
🔇 Direct Message Commands:\n${dataArray.dm = dataArray.dm || 'There are no direct message commands.'}\n
📢 Public Commands:\n${dataArray.public = dataArray.public || 'There are no public commands.'}\n
❌ Disabled Commands:\n${dataArray.disabled}`)
                .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
        }
    } else {
        if (getCommand(args[0])) return message.channel.send(`Help for the **${config.BotPrefix}${args[0]}** command:\nAccess Level: __${getCommand(args[0]).help.type}__\nDescription: ${getCommand(args[0]).help.description}\n\nUsage: ${getCommand(args[0]).help.usage}`)
            .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
    }














    if (args[0]) {
        // if (args[0] === 'guidelines') {
        //     // define the embed color by role
        //     let roleColor = message.guild.me.displayHexColor === "#000000" ? "#ffffff" : message.guild.me.displayHexColor;
        //     // define the embed: guidelines usage 
        //     let embed_update_guidelines_usage = new Discord.MessageEmbed()
        //         .setColor(roleColor)
        //         .setAuthor(`Guidelines help`, TEAlogo)
        //         .setDescription(`Follow the instructions below to ensure that the guidelines work.`)
        //         .addFields(
        //             { name: 'Create a new channel for guidelines:', value: `Channel name has to match '**${config.other.guidelinesChannelName}**' (feel free to copy).`, inline: false },
        //             { name: `Set the following channel permissions for the bot:`, value: `✅ Read Messages\n✅ Send Messages\n✅ Embed Links\n✅ Read Message History`, inline: false },
        //             { name: '‏‏‎ ‎', value: `That's it, within a day you should receive a new message from the bot with the latest guidelines.`, inline: false },
        //         )
        //         .setThumbnail(TEAlogo)

        //     return message.channel.send(embed_update_guidelines_usage)
        //         .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
        // }


    }
}