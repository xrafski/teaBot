const { botReply, getCommand } = require('../teaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "reload",
    description: "Reload a command.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.botDetails.prefix}reload commandName**\n\nℹ️ Example(s):\n${config.botDetails.prefix}reload uptime`
};

module.exports.run = async (bot, message, args) => {
    if (!args.length) return botReply(`Wrong command format, type **${config.botDetails.prefix}help ${module.exports.help.name}** to see usage and examples!`, message);

    const commandName = args[0].toLowerCase();
    const command = getCommand(commandName);

    if (command) {
        delete require.cache[require.resolve(`./${command.help.name}.js`)];
        try {
            const reloadCommand = require(`./${command.help.name}.js`);
            bot.commands.set(reloadCommand.help.name, reloadCommand);
            return botReply(`Command \`${command.help.name}\` has been reloaded!`, message);
        } catch (error) {
            return botReply(`There was an error while reloading a command \`${command.help.name}\`:\n\`${error.message}\``, message);
        }
    } else return botReply(`There is no \`${commandName}\` command loaded and cannot be reloaded!`, message);
};