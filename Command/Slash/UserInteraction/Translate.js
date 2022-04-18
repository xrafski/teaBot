const logger = require('../../../Utilities/logger');
const deepl = require('deepl-node');
const { token } = require('../../../Utilities/settings/secret/deepl.json');

module.exports = {
    name: 'Translate to English',
    category: 'GLOBAL',
    type: 'MESSAGE',
    options: [],

    async execute(client, interaction) {
        const { user, guild, targetMessage } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on '${targetMessage.author?.tag}' in the '${guild?.name}' guild.`); // Log who used this command.

        if (!targetMessage.content) {
            return interaction.reply({
                content: '🥶 You need to specify a message with text to translate!'
            }).catch(err => logger.log('Command/Slash/UserInteraction/Translate.js (1) Error to send reply', err));
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: true })
            .catch(err => logger.log('Command/Slash/UserInteraction/Translate.js (2) Error to create interaction defer', err)); // Catch interaction reply error.

        // Create a new deepl instance.
        const translator = new deepl.Translator(token);

        // Create deepl api request.
        await translator.translateText(targetMessage.content, null, 'en-US')
            .then(translation => {

                // Send the translated text.
                interaction.editReply({
                    content: `> ${translation.text}\n\n> 🌍 Translated from **${translation.detectedSourceLang.toUpperCase()} to EN** by DeepL.com`,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    style: 5,
                                    label: 'Visit DeelP.com page',
                                    url: `https://www.deepl.com/translator#auto/en/${targetMessage.content.split(' ').join('%20')}`,
                                    disabled: false,
                                    type: 2
                                }
                            ]
                        }
                    ]
                }).catch(err => logger.log('Command/Slash/UserInteraction/Translate.js (3) Error to send reply', err)); // Catch interaction defer reply error.
            })
            .catch(err => { // Catch deepl api error.

                // Log Deepl API error message.
                logger.log(`Command/Slash/UserInteraction/Translate.js (4) Deepl API error: ${err.message} | Source: ${targetMessage.content}`);

                // Send the error to the user.
                interaction.editReply({
                    content: '🥶 Something went wrong with Deepl\'s API!\n> Try again later.',
                }).catch(err => logger.log('Command/Slash/UserInteraction/Translate.js (5) Error to send reply', err)); // Catch interaction defer reply error.
            });

    }
};
