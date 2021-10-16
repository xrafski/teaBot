const { getEmoji } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const moment = require('moment');

module.exports = {
	name: 'uptime',
	description: 'Check bot uptime.',
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

		const currMS = moment().format('x');
		const timeDiffinMS = Math.floor(currMS - client.uptime);
		const botStartDate = new Date(timeDiffinMS);

		interaction.reply({
			content: `${getEmoji(client.config.TEAserverID, 'TEA')} Last application downtime was **${moment(botStartDate).fromNow()}**.\n> at ${botStartDate.toUTCString()}/UTC`,
			ephemeral: true,
		});
	},
};
