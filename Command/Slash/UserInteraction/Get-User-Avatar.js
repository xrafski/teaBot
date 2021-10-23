const { MessageEmbed } = require('discord.js');
const logger = require('../../../Utilities/logger');
module.exports = {
	name: 'Get User Avatar',
	// description: 'Embeds the target member\'s avatar.',
	// defaultPermission: true,
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
					.setAuthor(`${target.username}'s Avatar`, target.displayAvatarURL({ dynamic: true, size: 128 }))
					.setImage(target.displayAvatarURL({ dynamic: true, size: 512 }))
					.setColor('#0095ff')
				],
			components: [
				{
					'type': 1,
					'components': [
						{
							'style': 5,
							'label': 'Click here to view an image.',
							'url': target.displayAvatarURL({ dynamic: true, size: 512 }),
							'disabled': false,
							'type': 2
						}
					]
				}
			]
		}).catch(err => logger.error('Command/Slash/UserInteraction/Get-User-Avatar.js (1) Error to send interaction reply.', err));


	}
};