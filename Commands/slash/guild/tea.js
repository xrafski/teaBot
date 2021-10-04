const { CommandInteraction } = require("discord.js");
const { getEmoji, logger } = require("../../../Utilities/functions");

module.exports = {
    name: "tea",
    description: "GUILD command with ADMINISTRATOR permission",
    defaultPermission: false,
    perms: "ADMINISTRATOR",
    category: "GUILD",
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
        }
    ],
    /**
     * @param {Client} client 1
     * @param {CommandInteraction} interaction 
     */
    execute(client, interaction, args) {
        interaction.editReply({ content: `${getEmoji(client.config.TEAserverID, 'TEA')} Response correctly handled!\nArguments: ${args.join(' | ')}\nAPI Latency is **${Math.round(client.ws.ping)}** ms.}`, ephemeral: true });
    }
};