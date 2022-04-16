const { getEmote } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const moment = require('moment');

module.exports = {
	name: 'uptime',
	description: 'Check bot uptime.',
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [],

	async execute(client, interaction) {
		const { user, guild } = interaction;

		// Log who used the command.
		logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

		// Get current time in milliseconds.
		const currMS = moment().format('x');

		// Calculate difference between current time and bot startup date.
		const timeDiffinMS = Math.floor(currMS - client.uptime);

		// Create a new date object with the results.
		const botStartDate = new Date(timeDiffinMS);

		// Moment format string
		const format = 'dddd, Do MMMM YYYY [at] h:m A z';

		// Send interaction reply message.
		interaction.reply({
			content: `${getEmote('onmyway')} Last application downtime was **${moment(botStartDate).fromNow()}**.\n> ${moment(botStartDate).utc().format(format)}.`,
			ephemeral: true
		})
			.catch(err => logger.log('Command/Slash/Global/Uptime.js (1) Error to send interaction reply', err)); // Catch interaction reply error.
	}
};
