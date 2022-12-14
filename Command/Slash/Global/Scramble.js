const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'scramble',
    description: 'Information about current event.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [],

    async execute(client, interaction) {
        const { user, guild } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: true })
            .catch(err => logger.log('Command/Slash/Global/Scramble.js (1) Error to create interaction defer', err)); // Catch interaction reply error.

        // Get event channel object from TEA server.
        const eventChannel = client.guilds.cache.get(client.config.scramble.serverID)?.channels.cache.get(client.config.scramble.channelID);

        // If channel if not found.
        if (!eventChannel) {
            return interaction.editReply({ content: 'Error to load message content location, try again later!' })
                .catch(err => logger.log('Command/Slash/Global/Scramble.js (2) Error to send interaction defer reply', err));
        }

        // Channel is found so let's fetch a specific message from it.
        await eventChannel.messages.fetch(client.config.scramble.messageID)
            .then(msg => fetchTheMessage(msg))
            .catch(() => {
                return interaction.editReply({ content: 'Error to get message, try again later!' })
                    .catch(err => logger.log('Command/Slash/Global/Scramble.js (3) Error to send interaction defer reply', err));
            });

        async function fetchTheMessage(msg) {

            // Get current message content.
            await msg.fetch()
                .then(evtMsg => {
                    return interaction.editReply({ content: evtMsg.content })
                        .catch(err => logger.log('Command/Slash/Global/Scramble.js (4) Error to send interaction defer reply', err));
                })
                .catch(() => {
                    return interaction.editReply({ content: 'Error to load message content, try again later!' })
                        .catch(err => logger.log('Command/Slash/Global/Scramble.js (5) Error to send interaction defer reply', err));
                });
        }
    }
};
