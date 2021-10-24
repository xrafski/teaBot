const logger = require('../../../Utilities/logger');

module.exports = {
	name: 'ping',
	description: 'Returns websocket connection ping.',
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [],

	async execute(client, interaction) {
		const { user, guild } = interaction;
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

		interaction
			.deferReply({ ephemeral: true })
			.catch(err => logger.error('Command/Slash/Global/Ping.js (1) Error to send interaction defer reply', err));

		await new Promise((resolve) => setTimeout(resolve, 3000)); // Fake 1s delay to think the bot is doing something 😂

		interaction
			.editReply({ content: `API Latency is **${Math.round(client.ws.ping)}** ms.`, })
			.catch(err => logger.error('Command/Slash/Global/Ping.js (2) Errot to edit interaction defer reply.', err));
	}
};
