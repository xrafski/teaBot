const { Discord, getCommands, getCommand, TEAlogo, messageRemoverWithReact } = require('../teaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "help",
    description: "List all of commands.",
    type: "public",
    usage: `**${config.BotPrefix}help**\n${config.BotPrefix}help commandName`
};

module.exports.run = async (bot, message, args) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                     help commandName                                     //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args) {
        if (args[0] === 'guidelines') {
            // define the embed color by role
            let roleColor = message.guild.me.displayHexColor === "#000000" ? "#ffffff" : message.guild.me.displayHexColor;
            // define the embed: guidelines usage 
            let embed_update_guidelines_usage = new Discord.MessageEmbed()
                .setColor(roleColor)
                .setAuthor(`Guidelines help`, TEAlogo)
                .setDescription(`Follow the instructions below to ensure that the guidelines work.`)
                .addFields(
                    { name: 'Create a new channel for guidelines:', value: `Channel name has to match '**${config.other.guidelinesChannelName}**' (feel free to copy).`, inline: false },
                    { name: `Set the following channel permissions for the bot:`, value: `✅ Read Messages\n✅ Send Messages\n✅ Embed Links\n✅ Read Message History`, inline: false },
                    { name: '‏‏‎ ‎', value: `That's it, within a day you should receive a new message from the bot with the latest guidelines.`, inline: false },
                )
                .setThumbnail(TEAlogo)

            return message.channel.send(embed_update_guidelines_usage)
                .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
        }

        if (getCommand(args[0])) {
            return message.channel.send(`Help for the **${config.BotPrefix}${args[0]}** command:\nAccess Level: __${getCommand(args[0]).help.type}__\nDescription: ${getCommand(args[0]).help.description}\n\nUsage: ${getCommand(args[0]).help.usage}`)
                .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
        }
    }

    let adminCommands = await getCommands().filter(command => command.help.type.includes('administrator')).map(command => `**${command.help.name}** • ${command.help.description}`).join('\n');
    let publicCommands = await getCommands().filter(command => command.help.type.includes('public')).map(command => `**${command.help.name}** • ${command.help.description}`).join('\n');
    let disabledCommands = await getCommands().filter(command => command.help.type.includes('disabled')).map(command => `**${command.help.name}** • ${command.help.description}`).join('\n');

    if (!adminCommands) adminCommands = 'There is no administrator commands.';
    if (!publicCommands) publicCommands = 'There is no public commands.';

    if (!disabledCommands) {
        return message.channel.send(`List of all commands! (prefix: **${config.BotPrefix}**)\nType **${config.BotPrefix}help commandName** for more details.\n\n👮‍♂️ Administrator Commands:\n${adminCommands}\n\n📢 Public Commands:\n${publicCommands}`)
            .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
    }

    return message.channel.send(`List of all commands! (prefix: **${config.BotPrefix}**)\nType **${config.BotPrefix}help commandName** for more details.\n\n👮‍♂️ Administrator Commands:\n${adminCommands}\n\n📢 Public Commands:\n${publicCommands}\n\n❌ Disabled Commands:\n${disabledCommands}`)
        .then(helpMessage => messageRemoverWithReact(helpMessage, message.author));
}