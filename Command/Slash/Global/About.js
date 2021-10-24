const { getEmoji } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');


module.exports = {
    name: 'about',
    description: 'Returns information about this bot and TEA project.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [],

    async execute(client, interaction) {
        const { user, guild } = interaction;
        logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

        interaction.reply({
            content: `Greetings, Trovians, and welcome to the **Trove Ethics Alliance**!\n\nThe goal of this alliance is to __fight a widespread negativity__ that has most unfortunately settled in Trove’s community.\nWe know the majority will always be in favor of good behavior, so we made a place where we can all look out for each other!\n\nThis application is just a tool to help us reach the goal and help communities tracking treats in their servers.\n__If you don's have access__ to ${getEmoji(client.config.TEAserver.id, 'TEA')} exclusive slash commands e.g. (/scan, /check) make sure your club is registered.\nYou check check your status with **/certification** command.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            url: client.config.bot.inviteURL,
                            label: 'TEA Bot invitation link',
                            style: 5
                        },
                        {
                            type: 2,
                            url: client.config.bot.authorURL,
                            label: 'Visit bot\'s author page!',
                            style: 5
                        },
                        {
                            type: 2,
                            url: client.config.bot.githubURL,
                            label: 'GitHub repository',
                            style: 5
                        }
                    ]
                }
            ]
        }).catch(err => logger.error('Command/Slash/Global/About.js (1)', err));
    }
};
