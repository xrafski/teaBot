const logger = require('../../../Utilities/logger');
const deepl = require('deepl-node');
const { token } = require('../../../Utilities/settings/secret/deepl.json');

module.exports = {
    name: 'deepl',
    description: 'Translate text using machine learning algorithms.',
    category: 'GLOBAL',
    type: 'CHAT_INPUT',
    options: [
        {
            type: 3,
            name: 'source_language',
            description: 'Language of the text you want to translate',
            choices: [
                {
                    name: 'Auto Detect',
                    value: 'auto'
                },
                {
                    name: 'Bulgarian',
                    value: 'BG'
                },
                {
                    name: 'Chinese (simplified)',
                    value: 'ZH'
                },
                {
                    name: 'Czech',
                    value: 'CS'
                },
                {
                    name: 'Danish',
                    value: 'DA'
                },
                {
                    name: 'Dutch',
                    value: 'NL'
                },
                {
                    name: 'English',
                    value: 'EN'
                },
                {
                    name: 'Estonian',
                    value: 'ET'
                },
                {
                    name: 'Finnish',
                    value: 'FI'
                },
                {
                    name: 'French',
                    value: 'FR'
                },
                {
                    name: 'German',
                    value: 'DE'
                },
                {
                    name: 'Greek',
                    value: 'EL'
                },
                {
                    name: 'Hungarian',
                    value: 'HU'
                },
                {
                    name: 'Italian',
                    value: 'IT'
                },
                {
                    name: 'Japanese',
                    value: 'JA'
                },
                {
                    name: 'Latvian',
                    value: 'LV'
                },
                {
                    name: 'Lithuanian',
                    value: 'LT'
                },
                {
                    name: 'Polish',
                    value: 'PL'
                },
                {
                    name: 'Portuguese',
                    value: 'PT'
                },
                {
                    name: 'Romanian',
                    value: 'RO'
                },
                {
                    name: 'Russian',
                    value: 'RU'
                },
                {
                    name: 'Slovak',
                    value: 'SK'
                },
                {
                    name: 'Slovenian',
                    value: 'SL'
                },
                {
                    name: 'Spanish',
                    value: 'ES'
                },
                {
                    name: 'Swedish',
                    value: 'SV'
                }
            ],
            required: true
        },
        {
            type: 3,
            name: 'source_text',
            description: 'Source text in provided language',
            required: true
        },
        {
            type: 3,
            name: 'target_language',
            description: 'Target language to translate the source text into.',
            choices: [
                {
                    name: 'Bulgarian',
                    value: 'BG'
                },
                {
                    name: 'Chinese (simplified)',
                    value: 'ZH'
                },
                {
                    name: 'Czech',
                    value: 'CS'
                },
                {
                    name: 'Danish',
                    value: 'DA'
                },
                {
                    name: 'Dutch',
                    value: 'NL'
                },
                {
                    name: 'English',
                    value: 'EN-US'
                },
                {
                    name: 'Estonian',
                    value: 'ET'
                },
                {
                    name: 'Finnish',
                    value: 'FI'
                },
                {
                    name: 'French',
                    value: 'FR'
                },
                {
                    name: 'German',
                    value: 'DE'
                },
                {
                    name: 'Greek',
                    value: 'EL'
                },
                {
                    name: 'Hungarian',
                    value: 'HU'
                },
                {
                    name: 'Italian',
                    value: 'IT'
                },
                {
                    name: 'Japanese',
                    value: 'JA'
                },
                {
                    name: 'Latvian',
                    value: 'LV'
                },
                {
                    name: 'Lithuanian',
                    value: 'LT'
                },
                {
                    name: 'Polish',
                    value: 'PL'
                },
                {
                    name: 'Portuguese',
                    value: 'PT-PT'
                },
                {
                    name: 'Romanian',
                    value: 'RO'
                },
                {
                    name: 'Russian',
                    value: 'RU'
                },
                {
                    name: 'Slovak',
                    value: 'SK'
                },
                {
                    name: 'Slovenian',
                    value: 'SL'
                },
                {
                    name: 'Spanish',
                    value: 'ES'
                },
                {
                    name: 'Swedish',
                    value: 'SV'
                }
            ],
            required: true
        }
    ],

    async execute(client, interaction, args) {
        const { user, guild } = interaction;

        // Log who used the command.
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

        // Check if command used on direct message.
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: '> 🔒 This command is not available on direct message!'
            }).catch(err => logger.log('Command/Slash/Global/Deepl.js (1) Error to send reply', err));
        }

        // Check if args[1] is longer than 1024 characters.
        if (args[1].length > 1024) {
            return interaction.reply({
                content: 'Your source text is longer than 1024 characters!\nPlease shorten it.',
                ephemeral: true
            }).catch(err => logger.log('Command/Slash/Global/Deepl.js (2) Error to send reply', err));
        }

        // Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
        await interaction
            .deferReply({ ephemeral: true })
            .catch(err => logger.log('Command/Slash/Global/Deepl.js (3) Error to create interaction defer', err)); // Catch interaction reply error.

        // Create a new deepl instance.
        const translator = new deepl.Translator(token);

        // Create deepl api request.
        await translator.translateText(args[1], args[0] === 'auto' ? null : args[0], args[2])
            .then(translation => {

                // Send the translated text.
                interaction.editReply({
                    content: `> ${translation.text}\n\n> 🌍 Translated by DeepL.com`,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    style: 5,
                                    label: 'Visit DeelP.com page',
                                    url: `https://www.deepl.com/translator#${args[0]}/${args[2]}/${args[1].split(' ').join('%20')}`,
                                    disabled: false,
                                    type: 2
                                }
                            ]
                        }
                    ]
                }).catch(err => logger.log('Command/Slash/Global/Deepl.js (4) Error to send reply', err)); // Catch interaction defer reply error.
            })
            .catch(err => { // Catch deepl api error.

                // Log Deepl API error message.
                logger.log(`Command/Slash/Global/Deepl.js (5) Deepl API error: ${err.message} | Source: ${args[0]} | Target: ${args[2]}`);

                // Send the error to the user.
                interaction.editReply({
                    content: '🥶 Something went wrong with Deepl\'s API!\n> Try again later.',
                }).catch(err => logger.log('Command/Slash/Global/Deepl.js (6) Error to send reply', err)); // Catch interaction defer reply error.
            });
    }
};
