const { botReply, getCommand } = require('../teaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "reload",
    description: "Reload a command.",
    type: "administrator",
    usage: `ℹ️ Format: **${config.BotPrefix}reload** commandName\n\nℹ️ Example(s):\n${config.BotPrefix}reload uptime`
};

module.exports.run = async (bot, message, args) => {
    if (!args.length) return botReply(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`, message, 10000);

    const commandName = args[0].toLowerCase();
    const command = getCommand(commandName);

    if (command) {
        delete require.cache[require.resolve(`./${command.help.name}.js`)];
        try {
            const reloadCommand = require(`./${command.help.name}.js`);
            bot.commands.set(reloadCommand.help.name, reloadCommand);
            return botReply(`Command \`${command.help.name}\` has been reloaded!`, message, 10000);
        } catch (error) { return botReply(`There was an error while reloading a command \`${command.help.name}\`:\n\`${error.message}\``, message, 20000); }
    } else return botReply(`There is no \`${commandName}\` command and cannot be reloaded!`, message, 10000);
}