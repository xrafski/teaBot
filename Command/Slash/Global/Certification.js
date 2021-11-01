const { MessageEmbed } = require('discord.js');
const { getEmoji, interactionReply, apiCall } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');

module.exports = {
	name: 'certification',
	description: 'Check if this club is certified as a member of Trove Ethics Alliance',
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [
		{
			name: 'type',
			type: 'STRING',
			description: 'Check details of this club certification',
			required: true,
			choices: [
				{ name: 'Basic information', value: 'cert_info' },
				{ name: 'Detailed certification information', value: 'cert_details' }
			]
		}
	],

	async execute(client, interaction, args) {
		const { user, guild } = interaction;
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

		if (args[0] === 'cert_info') {
			await apiCall('GET', `https://api.kalinowski.app/certification/${guild.id}`)
				.then(response => {
					if (!response) { interactionReply(interaction, `> ❌ This club is not certified member of ${getEmoji(client.config.TEAserver.id, 'TEA')} **Trove Ethics Alliance**!`, false, 'Command/Slash/Global/Certification.js (1)'); }
					else { interactionReply(interaction, `${getEmoji(client.config.TEAserver.id, 'verified')} ${guild.name} is certified member of ${getEmoji(client.config.TEAserver.id, 'TEA')} **Trove Ethics Alliance**!`, false, 'Command/Slash/Global/Certification.js (2)'); }
				})
				.catch(error => interactionReply(interaction, `❌ Failed to receive data from API.\n> ${error.message}`, false, 'Command/Slash/Global/certification.js (3)'));
		}

		if (args[0] === 'cert_details') {
			await apiCall('GET', `https://api.kalinowski.app/certification/${guild.id}`)
				.then(response => {
					if (!response) { interactionReply(interaction, `> ❌ This club is not certified member of ${getEmoji(client.config.TEAserver.id, 'TEA')} **Trove Ethics Alliance**!`, false, 'Command/Slash/Global/Certification.js (4)'); }
					else {
						interaction.reply({
							embeds:
								[new MessageEmbed()
									.setColor('#0095ff')
									.setAuthor('Certification Details', links.icon, 'https://kalinowski.app/tea')
									.setTitle(`${guild.name} ${getEmoji(client.config.TEAserver.id, 'verified')}`)
									.setDescription(`**Club Name**: ${response.club ? response.club : 'Club name is not available'}\n**Representative**: ${response.representative ? response.representative : 'Representative is not available.'}\n**In-Game Club World**: ${response.world ? '/joinworld ' + response.world : 'Joinworld command is not available.'}\n\n**Discord Invite Link**: ${response.discord.invite ? response.discord.invite : 'Discord Invite link is not provided.'}\n**Discord Server ID**: ${response.discord.id ? response.discord.id : 'Discord Server ID is not provided.'}`)
									.addFields(
										{ name: 'Description', value: response.description ? response.description : 'Description is not provided.', inline: false },
										{ name: 'Requirements', value: response.requirements ? response.requirements : 'Requirements are not provided.', inline: false },
									)
									.setThumbnail(guild.iconURL())
									.setFooter('Please, contact TEA Database Manager if the data is outdated.')
									.setTimestamp()
								]
						}).catch(err => logger.error('Command/Slash/Global/certification.js (5) Error to send interaction reply.', err));
					}
				})
				.catch(error => interactionReply(interaction, `❌ Failed to receive data from API.\n> ${error.message}`, false, 'Command/Slash/Global/certification.js (6)'));
		}
	}
};
