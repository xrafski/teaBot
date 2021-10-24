const { MessageEmbed } = require('discord.js');
const logger = require('../../../Utilities/logger');
module.exports = {
	name: 'Get user avatar',
	category: 'GLOBAL',
	type: 'USER',

	async execute(client, interaction) {
		const { user, options, guild } = interaction;
		const target = options.getUser('user');
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' on '${target?.tag}' in the '${guild?.name}' guild.`);

		interaction.reply({
			ephemeral: true,
			embeds:
				[new MessageEmbed()
					.setAuthor(`${target.username}'s Avatar`, target.displayAvatarURL({ dynamic: true, size: 32, format: 'png' }))
					.setImage(target.displayAvatarURL({ dynamic: true, size: 256, format: 'png' }))
					.setColor('#0095ff')
				],
			components: [
				{
					'type': 1,
					'components': [
						{
							'style': 5,
							'label': 'Click to view an image in full resolution.',
							'url': target.displayAvatarURL({ dynamic: true, size: 4096, format: 'png' }),
							'disabled': false,
							'type': 2
						}
					]
				}
			]
		}).catch(err => logger.error('Command/Slash/UserInteraction/Get-User-Avatar.js (1) Error to send interaction reply.', err));
	}
};