const { Client, CommandInteraction } = require('discord.js');

module.exports = {
    name: "interactionCreate",
    /**
    * @param {Client} client 
    * @param {CommandInteraction} interaction 
    */
    async execute(client, interaction) {
        if (interaction.isCommand()) {
            const command = client.slashCommands.get(interaction.commandName);
            if (!command) return interaction.reply({ content: `⛔ An error occured while trying to execute this command.`, ephemeral: true }) && client.slashCommands.delete(interaction.commandName);

            const args = [];

            for (let option of interaction.options.data) {
                if (option.type === "SUB_COMMAND") {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) args.push(option.value);
            }

            command.execute(client, interaction, args);
        }
    }
}