const { Client, CommandInteraction } = require('discord.js');
const { ephemeralToggle, logger } = require('../../Utilities/functions');

module.exports = {
    name: "interactionCreate",
    /**
    * @param {Client} client 
    * @param {CommandInteraction} interaction 
    */
    async execute(client, interaction) {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: ephemeralToggle(interaction.commandName) })
                .catch(error => logger('error', `Events/Interactions/interactionCreate.js (1) Error to send deferReply`, error));

            const command = client.slashCommands.get(interaction.commandName);
            if (!command) return interaction.editReply({ content: `⛔ An error occured while trying to execute this command.` }) && client.slashCommands.delete(interaction.commandName);

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