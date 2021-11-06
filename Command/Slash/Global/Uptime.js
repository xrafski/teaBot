const { getEmoji } = require('../../../Utilities/functions');
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
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

		const currMS = moment().format('x'); // Get current time in milliseconds.
		const timeDiffinMS = Math.floor(currMS - client.uptime); // Calculate difference between current time and bot startup date.
		const botStartDate = new Date(timeDiffinMS); // Create a new date object with the results.

		const format = 'dddd, Do MMMM YYYY @ hh:mm A z'; // Moment format string

		// Send interaction reply message.
		interaction.reply({ ephemeral: true, content: `${getEmoji(client.config.TEAserver.id, 'TEA')} Last application downtime was **${moment(botStartDate).fromNow()}**.\n> ${moment(botStartDate).utc().format(format)}.` })
			.catch(err => logger.log('Command/Slash/Global/Uptime.js (1) Error to send interaction reply', err)); // Catch interaction reply error.
	}
};
