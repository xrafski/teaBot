const { MessageEmbed } = require('discord.js');
const { getEmote } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
    name: 'tea',
    description: 'test GUILD command',
    category: 'GUILD',
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

    execute(client, interaction, args) {
        const { user, guild } = interaction;
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

        // Create embed object.
        const testEmbed = new MessageEmbed()
            .setAuthor({ name: 'RNG' })
            .setDescription('Some description for this embed')
            .setColor('YELLOW')
            .setTitle('Embed title');

        // Send interaction reply with results
        interaction.reply({
            content: `${getEmote('TEA')} Response correctly handled!\nArguments: ${args.join(' | ')}\nAPI Latency is **${Math.round(client.ws.ping)}** ms.}`,
            embeds: [testEmbed]
        })
            .catch(err => logger.log('Command/Slash/Guild/test-guild.js (1) Error to send interaction reply', err)); // Catch interaction reply error.
    }
};
