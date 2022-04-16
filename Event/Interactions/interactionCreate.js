const logger = require('../../Utilities/logger');

module.exports = {
    name: 'interactionCreate',
    /**
    * @param {Client} client
    * @param {CommandInteraction} interaction
    */
    async execute(client, interaction) {

        // Check if interaction is a valid command.
        if (interaction.isCommand() || interaction.isContextMenu()) {
            // await interaction.deferReply({ ephemeral: ephemeralToggle(interaction.commandName) })
            //     .catch(error => logger.log('Event/Interactions/interactionCreate.js (x) Error to send deferReply', error));

            // Assing variable to a command.
            const command = client.slashCommands.get(interaction.commandName);

            // Check if command exists
            if (!command) {
                return interaction.reply({
                    content: '⛔ An error occured while trying to execute this command.',
                    ephemeral: true
                }).catch(err => logger.log('Event/Interactions/Global/interactionCreate.js (1) Error to send interaction reply', err)); // && client.slashCommands.delete(interaction.commandName);
            }

            // Create args array
            const args = [];

            // Loop through interaction.options.data to get arguments into args arra-y
            for (const option of interaction.options.data) {

                switch (option.type) {

                    // When command has a group option.
                    case 'SUB_COMMAND_GROUP': {

                        // Get group name
                        if (option.name) args.push(option.name);

                        // Get sub command name
                        if (option.options[0].name) args.push(option.options[0].name);

                        // Get sub command arguments
                        option.options[0]?.options.forEach((x) => {
                            if (x.value) args.push(x.value);
                        });

                        break;
                    }

                    // When command has a sub command option.
                    case 'SUB_COMMAND': {

                        // Get sub command name
                        if (option.name) args.push(option.name);

                        // Get sub command arguments
                        option.options?.forEach((x) => {
                            if (x.value) args.push(x.value);
                        });

                        break;
                    }

                    // When main command has arguments.
                    default: {
                        // Get option value
                        args.push(option.value);
                        break;
                    }
                }

            }

            // Execute the command.
            command.execute(client, interaction, args);
        }
    },
};