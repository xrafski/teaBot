const { getCommand, messageRemoverWithReact, TEAlogo, Discord, botReply } = require('../teaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "help",
    description: "List of all commands.",
    type: "public",
    usage: `ℹ️ Format: **${config.botPrefix}help** commandName(optional)\n\nℹ️ Example(s):\n${config.botPrefix}help uptime`
};

module.exports.run = async (bot, message, args) => {

    if (!args[0] || !getCommand(args[0])) {

        const dataArray = {
            'setup': `**${config.botPrefix}help guidelines** • Information how to set guidelines channel correctly.`,
            'admin': getCommand().filter(command => command.help.type === 'administrator').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
            'dm': getCommand().filter(command => command.help.type === 'dm').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
            'public': getCommand().filter(command => command.help.type === 'public').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n'),
            'disabled': getCommand().filter(command => command.help.type === 'disabled').map(command => `**${command.help.name}** • ${command.help.description}`).join('\n')
        }

        if (message.guild.id === config.TEAserverID) {
            return botReply(`List of all commands! (prefix: **${config.botPrefix}**)\nType **${config.botPrefix}help commandName** for more details.\n
👮‍♂️ Administrator Commands:\n${dataArray.admin = dataArray.admin || 'There are no administrator commands.'}\n
🔇 Direct Message Commands:\n${dataArray.dm = dataArray.dm || 'There are no direct message commands.'}\n
📢 Public Commands:\n${dataArray.public = dataArray.public || 'There are no public commands.'}\n
❌ Disabled Commands:\n${dataArray.disabled = dataArray.disabled || 'There are not disabled commands.'}`, message)
                .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
        } else {
            return botReply(`List of all commands! (prefix: **${config.botPrefix}**)\nType **${config.botPrefix}help commandName** for more details.\n
🔧 Setup Info:\n${dataArray.setup = dataArray.setup || 'There are not help setup commands.'}\n
🔇 Direct Message Commands:\n${dataArray.dm = dataArray.dm || 'There are no direct message commands.'}\n
📢 Public Commands:\n${dataArray.public = dataArray.public || 'There are no public commands.'}`, message)
                .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
        }
    }
    else if (args[0].toLowerCase() === 'guidelines') {
        const embed_guidelines_help = new Discord.MessageEmbed()
            .setColor('#eeff38')
            .setAuthor(`Guidelines Help Note`, TEAlogo)
            .setDescription(`Follow the instructions below to ensure that the guidelines work.`)
            .addFields(
                { name: `Create a new channel for guidelines 👇`, value: `Channel name has to match '**${config.guidelines.channelName}**' (feel free to copy).`, inline: false },
                { name: `Add the following channel permissions for the bot:`, value: `✅ Read Messages\n✅ Send Messages\n✅ Embed Links\n✅ Read Message History`, inline: false },
                { name: `${config.botPrefix}certification details`, value: `Make sure that your club has filled discordID on the club roster spreadsheet. You can check your current certification with the command above.`, inline: false },
                { name: '‏‏‎ ‎', value: `That's it, within a day your community should receive a new message from the bot with the latest guidelines.`, inline: false },
            )
            .setThumbnail(TEAlogo)
        botReply(embed_guidelines_help, message)
            .then(helpGuidelines => messageRemoverWithReact(helpGuidelines, message.author));
    }
    else if (getCommand(args[0])) return botReply(`Help for the **${config.botPrefix}${args[0]}** command:\nAccess Level: __${getCommand(args[0]).help.type}__\nDescription: ${getCommand(args[0]).help.description}\n\nUsage: ${getCommand(args[0]).help.usage}`, message)
        .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
}