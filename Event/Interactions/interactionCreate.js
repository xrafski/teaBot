// const logger = require('../../Utilities/logger');
// const { ephemeralToggle } = require('../../Utilities/functions');

module.exports = {
    name: 'interactionCreate',
    /**
    * @param {Client} client
    * @param {CommandInteraction} interaction
    */
    async execute(client, interaction) {
        if (interaction.isCommand() || interaction.isContextMenu()) {
            // await interaction.deferReply({ ephemeral: ephemeralToggle(interaction.commandName) }).catch(error => logger.log('Event/Interactions/interactionCreate.js (1) Error to send deferReply', error));

            // Assing variable to a command.
            const command = client.slashCommands.get(interaction.commandName);

            // Check if command exists
            if (!command) return interaction.reply({ content: '⛔ An error occured while trying to execute this command.' }); // && client.slashCommands.delete(interaction.commandName);

            // Create args array
            const args = [];

            // Loop through interaction.options.data to get arguments into args array
            for (const option of interaction.options.data) {
                if (option.type === 'SUB_COMMAND') {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                }
                else if (option.value) { args.push(option.value); }
            }

            // Execute the command.
            command.execute(client, interaction, args);
        }
    },
};