const { CommandInteraction } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Returns websocket connection ping",
    defaultPermission: true,
    perms: "",
    category: "GLOBAL",
    type: 'CHAT_INPUT',
    options: [],
    /**
     * @param {Client} client 1
     * @param {CommandInteraction} interaction 
     */
    execute(client, interaction) {
        // const { guild, member, options } = interaction;

        interaction.reply({ content: `API Latency is **${Math.round(client.ws.ping)}** ms.`, ephemeral: true });

    }
};