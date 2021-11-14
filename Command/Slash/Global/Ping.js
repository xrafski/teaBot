const { getEmote } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
	name: 'ping',
	description: 'Returns websocket connection ping.',
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [],

	async execute(client, interaction) {
		const { user, guild } = interaction;
		logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

		// Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
		await interaction
			.deferReply({ ephemeral: true })
			.catch(err => logger.log('Command/Slash/Global/Ping.js (1) Error to create interaction defer', err)); // Catch interaction reply error.

		// Fake 2s delay to think the bot is doing something 😂
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Get websocket ping value.
		const ping = Math.round(client.ws.ping);

		// Assing emoji names to an array.
		const status = ['connectionexcellent', 'connectiongood', 'connectionbad'];

		// Matches for any ping where the expression === 'true':
		switch (true) {

			// Ping below 130
			case ping < 130:
				return interactionResponse(status[0]);

			// Ping below 250
			case ping < 250:
				return interactionResponse(status[1]);

			// Ping above 250
			default: return interactionResponse(status[2]);
		}

		/**
		 * Function to send a interaction reply response.
		 * @param {String} emoji Emoji name
		 * @returns Interaction reply message with correct emoji.
		 */
		async function interactionResponse(emoji) {
			return await interaction
				.editReply({ content: `${getEmote(emoji)} Websocket latency is **${Math.round(client.ws.ping)}** ms.`, })
				.catch(err => logger.log('Command/Slash/Global/Ping.js (2) Error to send interaction defer reply', err)); // Catch interaction reply error.
		}
	}
};
