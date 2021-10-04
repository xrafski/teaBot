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
    async execute(client, interaction) {
        // const { guild, member, options } = interaction;

        await new Promise(resolve => setTimeout(resolve, 5000));
        interaction.editReply({ content: `API Latency is **${Math.round(client.ws.ping)}** ms.` });
    }
};