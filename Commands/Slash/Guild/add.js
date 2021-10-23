const logger = require('../../../Utilities/logger');

module.exports = {
	name: 'add',
	description: 'This is a test GUILD command',
	// defaultPermission: true,
	category: 'GUILD',
	type: 'CHAT_INPUT',
	options: [
		{
			name: 'number1',
			description: 'Type number 1',
			type: 'INTEGER',
			required: true,
		},
		{
			name: 'number2',
			description: 'Type number 2',
			type: 'INTEGER',
			required: true,
		},
	],
	/**
	 * @param {Client} client 1
	 * @param {CommandInteraction} interaction
	 */
	async execute(client, interaction, args) {
		const { user, guild } = interaction;
		logger.command(`${__filename.split('\\').slice(-4).join('/')} used by '${user?.tag}' in the '${guild?.name}' guild.`);

		const [num1, num2] = args;
		await interaction.editReply({
			content: `The result is ${num1 + num2}`
		});
	},
};
