const logger = require('../../../Utilities/logger');

module.exports = {
	name: 'ping',
	description: 'Returns websocket connection ping.',
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [],

	async execute(client, interaction) {
		const { user, guild } = interaction;
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

		// Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
		await interaction
			.deferReply({ ephemeral: true })
			.catch(err => logger.log('Command/Slash/Global/Ping.js (1) Error to send interaction defer reply', err)); // Catch interaction reply error.

		// Fake 2s delay to think the bot is doing something 😂
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Send interaction defer reply with latency delay.
		await interaction
			.editReply({ content: `API Latency is **${Math.round(client.ws.ping)}** ms.`, })
			.catch(err => logger.log('Command/Slash/Global/Ping.js (2) Error to send interaction defer reply', err)); // Catch interaction reply error.
	}
};
