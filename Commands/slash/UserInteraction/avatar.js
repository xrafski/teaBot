const { MessageEmbed } = require('discord.js');
const logger = require('../../../Utilities/logger');
module.exports = {
	name: 'Get User Avatar',
	// description: 'Embeds the target member\'s avatar.',
	defaultPermission: true,
	perms: '',
	category: 'GUILD',
	type: 'USER',
	/**
	 * @param {Client} client 1
	 * @param {CommandInteraction} interaction
	 */
	async execute(client, interaction) {
		const { user, options, guild } = interaction;
		const target = options.getUser('user');
		logger('command', `${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' on '${target?.tag}' in the '${guild?.name}' guild.`);

		interaction.reply({
			ephemeral: true,
			embeds:
				[new MessageEmbed()
					.setAuthor(`${target.username}'s Avatar`, `${target.displayAvatarURL({ dynamic: true, size: 512 })}`)
					.setImage(`${target.displayAvatarURL({ dynamic: true, size: 512 })}`)
					.setColor('#2f3136')
				]
		});


	},
};


// const { CommandInteraction, MessageEmbed } = require('discord.js');

// module.exports = {
// 	name: 'avatar',
// 	description: 'Embeds the target member\'s avatar.',
// 	defaultPermission: true,
// 	perms: '',
// 	category: 'GUILD',
// 	options: [
// 		{
// 			name: 'target',
// 			description: 'Select a target.',
// 			type: 'USER',
// 			required: true,
// 		},
// 	],
// 	/**
// 	 * @param {CommandInteraction} interaction
// 	 */
// 	execute(client, interaction) {
// 		console.log(interaction);
// 		const Target = interaction.options.getUser('target');
// 		interaction.reply({
// 			embeds:
// 				[new MessageEmbed()
// 					.setAuthor(`${Target.username}'s Avatar`, `${Target.displayAvatarURL({ dynamic: true, size: 512 })}`)
// 					.setImage(`${Target.displayAvatarURL({ dynamic: true, size: 512 })}`)
// 					.setColor('#2f3136')
// 				]
// 		});
// 	}
// };
