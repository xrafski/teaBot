const { MessageEmbed } = require('discord.js');
const { threatModel } = require('../../../Schema/threatCollection');
const { interactionReply } = require('../../../Utilities/functions');
const logger = require('../../../Utilities/logger');
const links = require('../../../Utilities/settings/links.json');


module.exports = {
	name: 'Check for threat',
	category: 'GLOBAL',
	type: 'USER',

	async execute(client, interaction) {
		const { user, options, guild } = interaction;
		const target = options.getUser('user');
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' on '${target?.tag}' in the '${guild?.name}' guild.`);

		const query = { discord: { $regex: target.id, $options: 'i' } };
		threatModel.findOne(query)
			.then(document => {
				if (!document) return noThreatFound();
				else return formatDocument(document);
			}).catch(() => interactionReply(interaction, '❌ Failed to receive data from the database.', true, 'Command/Slash/UserInteraction/Check-For-Threat.js (1)'));

		function setThreatColor(color) {
			switch (color) {
				case 'g': return '#45ff24';
				case 'y': return '#ffff24';
				case 'r': return '#ff1a1a';
				case 'b': return '#0f0f0f';
				default: return '#fcfcfc';
			}
		}

		function noThreatFound() {
			const notFoundEmbed = new MessageEmbed()
				.setDescription('❌ This user is not detected as a threat in our database!')
				.setAuthor('Trove Ethics Alliance - Results', links.icon)
				.setColor('#0095ff');

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
			}).catch(err => logger.error('Command/Slash/UserInteraction/Check-For-Threat.js (2) Error to send interaction reply.', err));
		}

		async function formatDocument(document) {
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
			}).catch(err => logger.error('Command/Slash/UserInteraction/Check-For-Threat.js (3) Error to send interaction reply.', err));
		}

		async function lookForThreat(docDiscord) {
			const formatDiscordID = docDiscord?.replace(/[\\<>@#&?! ]/g, '').split(',');

			const promises = [];

			// all promises will be added to array
			for (let index = 0; index < formatDiscordID.length; index++) {
				const userID = formatDiscordID[index];
				promises.push(
					guild.members.fetch(userID)
						.then(member => {
							return `\n> ${member?.user?.tag} (${member?.toString()})`;
						})
						.catch(() => { return; })
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