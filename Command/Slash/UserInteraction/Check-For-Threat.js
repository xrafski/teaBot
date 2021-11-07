const { MessageEmbed } = require('discord.js');
const { apiCall } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');


module.exports = {
	name: 'Check for threat',
	category: 'GLOBAL',
	type: 'USER',

	execute(client, interaction) {
		const { user, options, guild } = interaction;
		const target = options.getUser('user');
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' on '${target?.tag}' in the '${guild?.name}' guild.`); // Log who used the command.

		// API call to get required data to run the command.
		apiCall('GET', `threat/${target.id}`)
			.then(threatResonse => formatDocument(threatResonse))
			.catch(err => {
				logger.log('Command/Slash/UserInteraction/Check-For-Threat.js (1) Error to get API response', err); // Log that error to the console.

				// Send interaction reply when there is an error with the API call.
				interaction.reply({ content: '❌ Failed to receive data from API.\n> Try again later ;(' })
					.catch(err => logger.log('Command/Slash/UserInteraction/Check-For-Threat.js (2) Error to send interaction reply', err)); // Catch interaction reply error.
			});


		async function formatDocument(document) {
			if (!document) {

				// Create embed object.
				const notFoundEmbed = new MessageEmbed()
					.setDescription('❌ This user is not detected as a threat in our database!')
					.setAuthor('Trove Ethics Alliance - Results', links.icon)
					.setColor('#0095ff');

				// Return a interaction reply message with formatted data.
				return interaction.reply({
					embeds: [notFoundEmbed],
					ephemeral: true,
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									url: links.formReport,
									label: 'If you think that user is a threat, please report here.',
									style: 5
								}
							]
						}
					]
				})
					.catch(err => logger.log('Command/Slash/UserInteraction/Check-For-Threat.js (3) Error to send interaction reply.', err)); // Catch interaction reply error.
			}

			const checkedIDs = await lookForThreat(document.discord);
			const resultEmbed = new MessageEmbed()
				.setColor(setThreatColor(document.warning))
				.setAuthor('Trove Ethics Alliance', links.icon)
				.setTitle(`Nickname: \`${document.name}\``)
				.setDescription(`**Reason:** ${document.reason}\n‏‏‎ ‎‎`)
				.addFields(
					// { name: 'Discord User ID(s)', value: document.discord ? document.discord : 'Unknown', inline: false },
					{ name: 'Alternate account(s)', value: document.alternates ? document.alternates : 'No data about alternate accounts.', inline: false },
					{ name: 'Evidence(s)', value: document.evidence ? document.evidence : 'No evidence provided', inline: false },
					{ name: 'Additional notes', value: document.notes ? document.notes : 'No notes', inline: false },
					{ name: 'Server Scan', value: checkedIDs ? `The following threat account(s) have been identified on this server: ${checkedIDs}` : 'There is no associated member on this server.' }
				)
				.setThumbnail(links.logo)
				.setTimestamp()
				.setFooter('Trove Ethics Alliance', links.icon);

			// Send interaction reply message with formatted mesage.
			interaction.reply({
				embeds: [resultEmbed],
				ephemeral: true,
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								url: links.formReport,
								label: 'Report players here',
								style: 5
							},
							{
								type: 2,
								url: links.formAppeal,
								label: 'Appeal is available over here',
								style: 5
							}
						]
					}
				]
			})
				.catch(err => logger.log('Command/Slash/Global/Check.js (4) Error to send interaction reply.', err)); // Catch interaction reply error.
		}

		/**
		 * Simple function to return color code provided by a letter or something idk.
		 * @param {String} color Threat color (g, y, r, b)
		 * @returns html color code for specified color code.
		 */
		function setThreatColor(color) {
			switch (color) {
				case 'g': return '#45ff24'; // Green threat level.
				case 'y': return '#ffff24'; // Yellow threat level.
				case 'r': return '#ff1a1a'; // Red threat level.
				case 'b': return '#0f0f0f'; // Black threat level.
				default: return '#fcfcfc'; // Default threat level which is almost white (cant be entirely #fff due to discord might define this color as transparent)
			}
		}

		/**
		 * Function to check guild members and try to match with provided document from MongoDB.
		 * @param {Object} docDiscord data from document.discord.
		 * @returns A string with formatted fetched guild mambers that has been matched.
		 */
		async function lookForThreat(docDiscord) {
			const formatDiscordID = docDiscord?.replace(/[\\<>@#&?! ]/g, '').split(','); // Replace some symbols from document and split to make an array.

			const promises = []; // Promise array to deal later on.

			// All promises will be added to array
			for (let index = 0; index < formatDiscordID.length; index++) {
				const userID = formatDiscordID[index];
				promises.push(
					guild.members.fetch(userID)
						.then(member => {
							return `\n> ${member?.user?.tag} (${member?.toString()})`;
						})
						.catch(() => { return; }) // Ignore error here because it's not important.
				);
			}

			// Promise.all will await all promises in the array to resolve
			// then it will itself resolve to an array of the results.
			// results will be in order of the Promises passed,
			// regardless of completion order
			const results = await Promise.all(promises);
			return results.filter(member => member !== undefined).join('');
		}
	}
};