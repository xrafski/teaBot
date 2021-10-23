const { MessageEmbed } = require('discord.js');
const { certificationModel } = require('../../../Schema/certificationCollection');
const { getEmoji } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');

module.exports = {
	name: 'certification',
	description: 'Check if this club is certified as a member of Trove Ethics Alliance',
	// defaultPermission: true,
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [
		{
			name: 'type',
			type: 'STRING',
			description: 'Check details of this club certification',
			required: true,
			choices: [
				{ name: 'info', value: 'cert_info' },
				{ name: 'details', value: 'cert_details' }
			]
		}
	],

	async execute(client, interaction, args) {
		const { user, guild } = interaction;
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

		if (args[0] === 'cert_info') {
			certificationModel.findOne({ 'discord.id': guild.id })
				.then(document => {
					if (!document) return interaction.reply({ content: `> ❌ This club is not certified member of ${getEmoji(client.config.TEAserverID, 'TEA')} **Trove Ethics Alliance**!` }).catch(err => logger.error('Commands/Slash/Global/certification.js (1) Error to send interaction reply.', err));

					interaction
						.reply({ content: `${getEmoji(client.config.TEAserverID, 'verified')} ${guild.name} is certified member of ${getEmoji(client.config.TEAserverID, 'TEA')} **Trove Ethics Alliance**!` })
						.catch(err => logger.error('Commands/Slash/Global/certification.js (1) Error to send interaction reply.', err));
				}).catch(err => logger.error('Commands/Slash/Global/certification.js (2) Error to get document from MongoDB.', err));
		}

		if (args[0] === 'cert_details') {
			certificationModel.findOne({ 'discord.id': guild.id })
				.then(document => {
					if (!document) return interaction.reply({ content: `> ❌ This club is not certified member of ${getEmoji(client.config.TEAserverID, 'TEA')} **Trove Ethics Alliance**!` }).catch(err => logger.error('Commands/Slash/Global/certification.js (1) Error to send interaction reply.', err));


					interaction
						.reply({
							embeds:
								[new MessageEmbed()
									.setColor('#0095ff')
									.setAuthor('Certification Details', client.config.images.logo, 'https://kalinowski.app/tea')
									.setTitle(`${guild.name} ${getEmoji(client.config.TEAserverID, 'verified')}`)
									.setDescription(`**Club Name**: ${document.club ? document.club : 'Club name is not available'}\n**Representative**: ${document.representative ? document.representative : 'Representative is not available.'}\n**In-Game Club World**: ${document.world ? '/joinworld ' + document.world : 'Joinworld command is not available.'}\n\n**Discord Invite Link**: ${document.discord.invite ? document.discord.invite : 'Discord Invite link is not provided.'}\n**Discord Server ID**: ${document.discord.id ? document.discord.id : 'Discord Server ID is not provided'}`)
									.addFields(
										{ name: 'Description', value: document.description ? document.description : 'Description is not provided.', inline: false },
										{ name: 'Requirements', value: document.requirements ? document.requirements : 'Requirements are not provided.', inline: false },
									)
									.setThumbnail(guild.iconURL())
									.setFooter('Please, contact TEA Database Manager if the data is outdated.')
									.setTimestamp()
								]
						})
						.catch(err => logger.error('Commands/Slash/Global/certification.js (1) Error to send interaction reply.', err));
				})
				.catch(err => logger.error('Commands/Slash/Global/certification.js (2) Error to get document from MongoDB.', err));
		}
	}
};
