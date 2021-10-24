const { MessageEmbed } = require('discord.js');
const { getEmoji } = require('../../../Utilities/functions');
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
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        const testEmbed = new MessageEmbed()
            .setAuthor('RNG')
            .setDescription('Some description for this embed')
            .setColor('YELLOW')
            .setTitle('Embed title');
        console.log(testEmbed);


        interaction.reply({
            content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Response correctly handled!\nArguments: ${args.join(' | ')}\nAPI Latency is **${Math.round(client.ws.ping)}** ms.}`,
            embeds: [testEmbed]
        }).catch(console.error);
    }
};
