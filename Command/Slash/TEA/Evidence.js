const { MessageEmbed } = require('discord.js');
const { getEmoji, interactionReply } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');
const moment = require('moment');

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
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

        if (args[0] === 'create') return createEvidence(); // Run a function if 'create' as argument.
        if (args[0] === 'edit') return editEvidence(); // Run a different function if 'edit' as argument.


        function createEvidence() {
            // Deconstruct arguments
            const [, nickname, evidence] = args;

            // Assign variable to a guild object.
            const evidenceChannel = client.guilds.cache.get(client.config.TEAserver.id).channels.cache.get(client.config.TEAserver.evidenceChannelID);

            // Check if guild object exists.
            if (!evidenceChannel) {
                return interaction.reply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Evidence channel in TEA server is not found.` })
                    .catch(err => logger.log('Command/Slash/TEA/Evidence.js (1) Error to send interaction reply', err));
            }

            // Create embed object
            const evidenceEmbed = new MessageEmbed()
                .setColor('#0095ff')
                .setAuthor(`Threat Evidence: ${nickname}`, links.logo)
                .setDescription(`> ${evidence.split(/[ ]/g).join('\n> ')}`)
                .setFooter(`Trove Ethics Alliance | ${moment(Date.now()).utc().format('Do MMM YYYY @ hh:mm A z')}`);

            // Send a message to the evidence channel.
            evidenceChannel.send({ content: `> Nickname: \`${nickname}\``, embeds: [evidenceEmbed] })
                .then(msg => {

                    // Send interaction reply as a confirmation.
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
                        .catch(err => logger.log('Command/Slash/TEA/Evidence.js (2) Error to send interaction reply', err)); // Catch interaction reply error.
                })
                .catch(err => {
                    // Send interaction reply if there is an error to send the evidence message.
                    interaction.reply({ content: `❌ Failed to send a message to the evidence channel.\n> ${err.message}` })
                        .catch(err => logger.log('Command/Slash/TEA/Evidence.js (3) Error to send interaction reply', err)); // Catch interaction reply error.
                });
        }

        function editEvidence() {
            // Deconstruct arguments.
            const [, msgURL, nickname, evidence] = args;

            // Assign variable with guild object.
            const evidenceChannel = client.guilds.cache.get(client.config.TEAserver.id).channels.cache.get(client.config.TEAserver.evidenceChannelID);

            // Check if guild object exists.
            if (!evidenceChannel) return interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Evidence channel in TEA server is not found.`, false, 'Command/Slash/TEA/Evidence.js (4)');

            const msgID = msgURL.split('/').pop(); // Get message ID from message URL.

            // Fetch the message
            evidenceChannel.messages.fetch(msgID)
                .then(message => {

                    // Create embed object
                    const newEvidenceEmbed = new MessageEmbed()
                        .setColor('#0095ff')
                        .setAuthor(`Threat Evidence: ${nickname}`, links.logo)
                        .setDescription(`> ${evidence.split(/[ ]/g).join('\n> ')}`)
                        .setFooter(`Trove Ethics Alliance | ${moment(Date.now()).utc().format('Do MMM YYYY @ hh:mm A z')}`);

                    // Modify the target message.
                    message.edit({ content: `> Nickname: \`${nickname}\``, embeds: [newEvidenceEmbed] })
                        .then(msg => {
                            // Send interaction reply back as a confirmation.
                            interaction.reply({
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
                                .catch(err => logger.log('Command/Slash/TEA/Evidence.js (5) Error to send interaction reply.', err)); // Catch interaction reply error.
                        })
                        .catch(err => {
                            // Send interaction reply if there is an error to modify the message.
                            interaction.reply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Failed to edit the message.\n> ${err.message}` })
                                .catch(err => logger.log('Command/Slash/TEA/Evidence.js (6) Error to send interaction reply', err)); // Catch interaction reply error.
                        });
                })
                .catch(err => {
                    // Send interaction reply if there is an error to fetch the message.
                    interaction.reply({ content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Failed to find the message.\n> ${err.message}` })
                        .catch(err => logger.log('Command/Slash/TEA/Evidence.js (7) Error to send interaction reply', err)); // Catch interaction reply error.
                });
        }
    }
};