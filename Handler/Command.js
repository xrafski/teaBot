const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const { promisify } = require('util');
const logger = require('../Utilities/logger');
const PG = promisify(glob);

const guildCommandsArray = []; // Public guild commands
const adminCommandsArray = []; // TEA Admin commands
const globalCommandsArray = []; // Global commands

/**
 * @param {Client} client
 */
module.exports = async (client) => {
	logger.startup(`Handler/Command.js (1) Loaded '${__filename.split('\\').slice(-2).join('/')}' Handler.`); // Log handler being loaded.

	const table = new AsciiTable('Commands Loaded');
	table.setHeading('Category', 'Name', 'File');


	// Classic Commands Handler
	const commandFiles = await PG(`${process.cwd()}/Command/Classic/*.js`);
	commandFiles.map(file => {

		// Assign variable to a command file.
		const classicCommand = require(file);

		// Split the classicCommand file path on '/' to create an array.
		const splitted = file.split('/');

		// Get directory from the splitted file (Classic).
		const directory = splitted[splitted.length - 2];

		// Check if classicCommand has name property.
		if (classicCommand.name && classicCommand.enabled === true) {

			// Assign properties variable.
			const properties = { directory, ...classicCommand };

			// Add to classicCommand collector new command with properties.
			client.classicCommands.set(classicCommand.name, properties);

			// Add table row for this command.
			table.addRow(
				'CLASSIC PREFIX',
				classicCommand.name,
				file.split('/').slice(-3).join('/')
			);
		}
	});

	// Slash Commands Handler
	(await PG(`${process.cwd()}/Command/Slash/*/*.js`)).map(async (file) => {

		// Assign variable to a command file.
		const slashCommand = require(file);

		// Check if command has name
		if (!slashCommand.name) return;

		// Set command into slashCommands collector.
		client.slashCommands.set(slashCommand.name, slashCommand);

		// Add table row for this command.
		table.addRow(
			`SLASH (${slashCommand.category})`,
			slashCommand.name,
			file.split('/').slice(-4).join('/')
		);

		// Finally split slashCommands into separate categories.
		switch (slashCommand.category) {
			case 'GLOBAL': return globalCommandsArray.push(slashCommand);
			case 'TEA': return adminCommandsArray.push(slashCommand); // command.defaultPermission = false;
			case 'GUILD': return guildCommandsArray.push(slashCommand);
			default: return logger.info(`Handler/Command.js (2) Command '${slashCommand.name}' doesn't have a correct category '${slashCommand.category}'!`);
		}
	});

	// Print in the console table results.
	console.log(table.toString());
};

module.exports.guildSlashCommandsArray = guildCommandsArray;
module.exports.adminSlashCommandsArray = adminCommandsArray;
module.exports.globalSlashCommandsArray = globalCommandsArray;
