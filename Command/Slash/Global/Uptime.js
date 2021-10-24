const { getEmoji, interactionReply } = require('../../../Utilities/functions');
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
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

		const currMS = moment().format('x');
		const timeDiffinMS = Math.floor(currMS - client.uptime);
		const botStartDate = new Date(timeDiffinMS);

		interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'TEA')} Last application downtime was **${moment(botStartDate).fromNow()}**.\n>${botStartDate.toUTCString()}/UTC`, true, 'Command/Slash/Global/Uptime.js (1)');
	}
};
