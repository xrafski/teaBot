const { getEmoji } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'admin',
    description: 'TEA ONLY command with ADMINISTRATOR permission',
    defaultPermission: true,
    category: 'TEA',
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'number',
            description: 'Type a test number',
            type: 'INTEGER',
            required: true,
        },
        {
            name: 'string',
            description: 'Type a test string',
            type: 'STRING',
            required: true,
        },
    ],
    /**
     * @param {Client} client 1
     * @param {CommandInteraction} interaction
     */
    execute(client, interaction, args) {
        const { user, guild } = interaction;
        logger('command', `${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        interaction.reply({
            content: `${getEmoji(client.config.TEAserverID, 'TEA')} Response correctly handled!\nArguments: ${args.join(' | ')}\nAPI Latency is **${Math.round(client.ws.ping)}** ms.}`,
            ephemeral: true
        });
    },
};