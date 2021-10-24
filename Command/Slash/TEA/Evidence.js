const { getEmoji, interactionReply } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'evidence',
    description: 'Manage evidences in TEA Evidence Channel.',
    category: 'TEA',
    type: 'CHAT_INPUT',
    options: [
        {
            'type': 'SUB_COMMAND',
            'name': 'create',
            'description': 'Create evidence post in TEA',
            'options': [
                {
                    'type': 'STRING',
                    'name': 'threat-nickname',
                    'description': 'Type a nickname of a user to post evidence to.',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'content-links',
                    'description': 'Enter evidence links, separated by a space.',
                    'required': true
                }
            ]
        },
        {
            'type': 'SUB_COMMAND',
            'name': 'edit',
            'description': 'Edit the evidence message',
            'options': [
                {
                    'type': 'STRING',
                    'name': 'message-link',
                    'description': 'Paste link to the evidence message you wish to modify.',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'threat-nickname',
                    'description': 'Type a nickname of a user.',
                    'required': true
                },
                {
                    'type': 'STRING',
                    'name': 'content-links',
                    'description': 'Enter evidence links, separated by a space.',
                    'required': true
                }
            ]
        }
    ],

    async execute(client, interaction, args) {
        const { user, guild } = interaction;
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        if (args[0] === 'create') return createEvidence();
        if (args[0] === 'edit') return editEvidence();


        function createEvidence() {
            const [, nickname, evidence] = args;
            const evidenceChannel = client.guilds.cache.get(client.config.TEAserver.id).channels.cache.get(client.config.TEAserver.evidenceChannelID);
            if (!evidenceChannel) return interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Evidence channel in TEA server is not found.`, false, 'Command/Slash/TEA/Evidence.js (1)');

            evidenceChannel.send(`> Nickname: \`${nickname}\`\n> \n> ${evidence.split(/[ ]/g).join('\n> ')}`)
                .then(msg => {

                    interaction
                        .reply({
                            content: `${user} ${getEmoji(client.config.TEAserver.id, 'TEA')} Successfully sent a message to the evidence channel.`, ephemeral: false,
                            'components': [
                                {
                                    'type': 1,
                                    'components': [
                                        {
                                            'style': 5,
                                            'label': 'Click here to view the message.',
                                            'url': msg.url,
                                            'disabled': false,
                                            'type': 2
                                        }
                                    ]
                                }
                            ]
                        })
                        .catch(err => logger.error('Command/Slash/TEA/Evidence.js (2) Error to send interaction reply.', err));
                })
                .catch(err => interactionReply(interaction, `❌ Failed to send a message to the evidence channel.\n> ${err.message}`, false, 'Command/Slash/TEA/Evidence.js (3)'));
        }

        function editEvidence() {
            const [, msgURL, nickname, evidence] = args;

            const evidenceChannel = client.guilds.cache.get(client.config.TEAserver.id).channels.cache.get(client.config.TEAserver.evidenceChannelID);
            if (!evidenceChannel) return interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Evidence channel in TEA server is not found.`, false, 'Command/Slash/TEA/Evidence.js (4)');

            const msgID = msgURL.split('/').pop();

            evidenceChannel.messages.fetch(msgID)
                .then(message => {
                    message.edit(`> Nickname: \`${nickname}\`\n> \n> ${evidence.split(/[ ]/g).join('\n> ')}`)
                        .then(msg => {
                            interaction
                                .reply({
                                    content: `${user} ${getEmoji(client.config.TEAserver.id, 'TEA')} Successfully modified a message in the evidence channel.`, ephemeral: false,
                                    'components': [
                                        {
                                            'type': 1,
                                            'components': [
                                                {
                                                    'style': 5,
                                                    'label': 'Click here to view modified message.',
                                                    'url': msg.url,
                                                    'disabled': false,
                                                    'type': 2
                                                }
                                            ]
                                        }
                                    ]
                                })
                                .catch(err => logger.error('Command/Slash/TEA/Evidence.js (5) Error to send interaction reply.', err));
                        })
                        .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Failed to edit the message.\n> ${err.message}`, false, 'Command/Slash/TEA/Evidence.js (6)'));
                })
                .catch(err => interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Failed to find the message.\n> ${err.message}`, false, 'Command/Slash/TEA/Evidence.js (7)'));
        }
    }
};