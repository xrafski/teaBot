const { getEmote } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');


module.exports = {
    name: 'about',
    description: 'Returns information about this bot and TEA project.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [],

    async execute(client, interaction) {
        const { user, guild } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

        // Send interaction reply with basic information about this application.
        interaction.reply({
            content: `Greetings Trovians, and welcome to the **Trove Ethics Alliance** ${getEmote('TEA')}!\n\nThe goal of this alliance is to __fight a widespread negativity__ that has most unfortunately settled in Trove’s community.\nWe know the majority will always be in favor of good behavior, so we made a place where we can all look out for each other!\n\nThis application is just a tool to help us reach the goal and help communities tracking treats in their servers.\n__If you don's have access__ to TEA exclusive slash commands e.g. (**/scan**, **/check**) make sure your club is registered.\nYou check check your status with **/certification** command.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            url: links.teaBotInvite,
                            label: 'TEA Bot invitation link',
                            style: 5
                        },
                        {
                            type: 2,
                            url: links.author,
                            label: 'Visit bot\'s author page!',
                            style: 5
                        },
                        {
                            type: 2,
                            url: links.github,
                            label: 'GitHub repository',
                            style: 5
                        }
                    ]
                }
            ]
        })
            .catch(err => logger.log('Command/Slash/Global/About.js (1) Error to send interaction reply', err)); // Catch interaction reply error.
    }
};
