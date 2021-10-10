const logger = require('../../../Utilities/logger');

module.exports = {
	name: 'ping',
	description: 'Returns websocket connection ping.',
	// defaultPermission: true,
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [],
	/**
	 * @param {Client} client 1
	 * @param {CommandInteraction} interaction
	 */
	async execute(client, interaction) {
		const { user, guild } = interaction;
		logger('command', `${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

		new Promise((resolve) => setTimeout(resolve, 1000)); // Fake 1s delay to think the bot is doing something 😂
		interaction.reply({
			content: `API Latency is **${Math.round(client.ws.ping)}** ms.`,
			ephemeral: true,
		});
	},
};
