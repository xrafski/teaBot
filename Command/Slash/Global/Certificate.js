const { MessageEmbed } = require('discord.js');
const { apiCall, getEmote, errorResponseHandlerAPI } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');

module.exports = {
	name: 'certificate',
	description: 'Check if this club is certified as a member of Trove Ethics Alliance',
	category: 'GLOBAL',
	type: 'CHAT_INPUT',
	options: [
		{
			name: 'type',
			type: 'STRING',
			description: 'Check details of this club certificate.',
			required: true,
			choices: [
				{ name: 'Basic information', value: 'cert_info' },
				{ name: 'Detailed cerfiticate information', value: 'cert_details' }
			]
		}
	],

	async execute(client, interaction, args) {
		const { user, guild } = interaction;

		// Log who used the command.
		logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-4).join('/')} used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`); // Log who used the command.

		// Check if command used on direct message.
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: '> 🔒 This command is not available on direct message!',
				ephemeral: false,
			}).catch(err => logger.log('Command/Slash/Global/Certificate.js (1) Error to send reply', err));
		}

		// Check if used in main TEA server.
		if (guild.id === client.config.TEAserver.id) {
			return interaction.reply({ content: `> ${getEmote('ok')} This is an official Trove Ethics Alliance Server!` })
				.catch(err => logger.log('Command/Slash/Global/Certificate.js (2) Error to send interaction defer reply', err)); // Catch interaction reply error.
		}

		// Create defer reply, because reply might exceed 3 seconds limit of discord interaction.
		await interaction
			.deferReply({ ephemeral: false })
			.catch(err => logger.log('Command/Slash/Global/Certificate.js (3) Error to send interaction defer reply', err)); // Catch interaction defer error.

		// Basic Information response handler.
		if (args[0] === 'cert_info') {

			// Call API to get basic information about the certificate.
			apiCall('GET', `certificate/${guild.id}`, null, (err, response) => {

				// Catch API error and move to error handler.
				if (err) {

					// Log API error event in the console.
					logger.log('Command/Slash/Global/Certificate.js (4) Error to get API response', err);

					// Send error message to the user.
					return interaction.editReply({
						content: errorResponseHandlerAPI(err),
						ephemeral: true
					}).catch(err => logger.log('Command/Slash/Global/Certificate.js (5) Error to send interaction defer reply', err));
				}

				// Check if document with club certificate exists.
				if (response) {

					// Send interaction reply with basic certificate information.
					return interaction.editReply({ content: `${getEmote('verified')} ${guild.name} is certified member of **Trove Ethics Alliance**!` })
						.catch(err => logger.log('Command/Slash/Global/Certificate.js (6) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
				} else {

					// Send interaction reply back with information about club not being a member of TEA.
					return interaction.editReply({ content: `> ${getEmote('warn')} This club is not certified member of **Trove Ethics Alliance**!` })
						.catch(err => logger.log('Command/Slash/Global/Certificate.js (7) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
				}
			});
		}

		// Detailed certificate information about the club.
		if (args[0] === 'cert_details') {

			// Call API to get required data from MongoDB.
			apiCall('GET', `certificate/${guild.id}`, null, (err, response) => {
				if (err) {
					logger.log('Command/Slash/Global/Certificate.js (8) Error to get API response', err); // Log API error.

					// Send interaction reply about API error.
					return interaction.editReply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
						.catch(err => logger.log('Command/Slash/Global/Certificate.js (9) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
				}

				// Check if document with club certificate exists.
				if (response) {

					// Send interaction reply with formatted embed message.
					return interaction.editReply({
						embeds:
							[new MessageEmbed()
								.setColor('#0095ff')
								.setAuthor({ name: 'Cerfiticate Details', iconURL: links.icon, link: 'https://kalinowski.app/tea' })
								.setTitle(`${guild.name} ${getEmote('verified')}`)
								.setDescription(`**Club Name**: ${response.club ? response.club : 'Club name is not available'}\n**Representative**: ${response.representative ? response.representative : 'Representative is not available.'}\n**In-Game Club World**: ${response.world ? '/joinworld ' + response.world : 'Joinworld command is not available.'}\n\n**Discord Invite Link**: ${response.discord.invite ? response.discord.invite : 'Discord Invite link is not provided.'}\n**Discord Server ID**: ${response.discord.id ? response.discord.id : 'Discord Server ID is not provided.'}`)
								.addFields(
									{ name: 'Description', value: response.description ? response.description : 'Description is not provided.', inline: false },
									{ name: 'Requirements', value: response.requirements ? response.requirements : 'Requirements are not provided.', inline: false },
								)
								.setThumbnail(guild.iconURL())
								.setFooter({ text: 'Please, contact TEA Database Manager if the data is outdated.' })
								.setTimestamp()
							]
					})
						.catch(err => logger.log('Command/Slash/Global/Certificate.js (10) Error to send interaction reply.', err)); // Catch interaction defer reply error.
				} else {

					// Send interaction reply with information that club is not assigned with TEA.
					return interaction.editReply({ content: `> ${getEmote('warn')} This club is not certified member of **Trove Ethics Alliance**!` })
						.catch(err => logger.log('Command/Slash/Global/Certificate.js (11) Error to send interaction defer reply', err)); // Catch interaction defer reply error.
				}
			});
		}
	}
};
