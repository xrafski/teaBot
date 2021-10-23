const { getEmoji } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'message',
    description: 'Say a message as the bot in a specific server/channel (\'Command Access\' role required).',
    // defaultPermission: false,
    category: 'TEA',
    type: 'CHAT_INPUT',
    options: [
        {
            'type': 'SUB_COMMAND',
            'name': 'send',
            'description': 'Send the message',
            'options': [
                {
                    'type': 'STRING',
                    'name': 'guild-id',
                    'description': 'Type guild ID where to send the message.',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'channel-id',
                    'description': 'Type channel ID where to send the message.',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'message',
                    'description': 'Type the message to send',
                    'required': true
                }
            ]
        },
        {
            'type': 'SUB_COMMAND',
            'name': 'edit',
            'description': 'Edit the message',
            'options': [
                {
                    'type': 'STRING',
                    'name': 'guild-id',
                    'description': 'Type guild ID where the message is located.',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'channel-id',
                    'description': 'Type channel ID where the message is located',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'message-id',
                    'description': 'Type message ID for the message to edit.',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'new-message',
                    'description': 'Type new message content for selected message.',
                    'required': true
                }
            ]
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction, args) {
        const { user, guild } = interaction;
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);


        if (args[0] === 'send') {
            const [, argGuildID, argChannelID, argMessage] = args;

            const target = client.guilds.cache.get(argGuildID)?.channels.cache.get(argChannelID);
            if (!target) return interaction.editReply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Target channel is not found.` });

            // Send a basic message
            target.send(argMessage)
                .then(message => {
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Message has been send to ${target} in **${target.guild.name}** guild.\n> Content: ${message.content}` });
                })
                .catch(console.error); //
        }

        if (args[0] === 'edit') {
            const [, argGuildID, argChannelID, argMessageID, argMessage] = args;

            const target = client.guilds.cache.get(argGuildID)?.channels.cache.get(argChannelID);
            if (!target) return interaction.editReply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Target channel is not found.` });

            const message = await target.messages.fetch(argMessageID);
            if (!message) return interaction.editReply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Target message is not found.` });

            // Update the content of a message
            message.edit(argMessage)
                .then(msg => {
                    interaction.editReply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Message has been edited in ${target} in **${target.guild.name}** guild.\n> New content: ${msg.content}\nMessage URL: ${msg.url}` });
                })
                .catch(console.error);

        }
    },
};