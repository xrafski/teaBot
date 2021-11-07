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

	(await PG(`${process.cwd()}/Command/Slash/*/*.js`)).map(async (file) => {

		// Assign variable to a command file.
		const command = require(file);

		// Check if command has name
		if (!command.name) return;

		// Set command into slashCommands collector.
		client.slashCommands.set(command.name, command);

		// Add table row for this command.
		table.addRow(
			command.category,
			command.name,
			file.split('/').slice(-4).join('/')
		);

		// Finally split slashCommands into separate categories.
		switch (command.category) {
			case 'GLOBAL': return globalCommandsArray.push(command);
			case 'TEA': return adminCommandsArray.push(command); // command.defaultPermission = false;
			case 'GUILD': return guildCommandsArray.push(command);
			default: return logger.info(`Handler/Command.js (2) Command '${command.name}' doesn't have a correct category '${command.category}'!`);
		}
	});

	// Print in the console table results.
	console.log(table.toString());
};

module.exports.guildSlashCommandsArray = guildCommandsArray;
module.exports.adminSlashCommandsArray = adminCommandsArray;
module.exports.globalSlashCommandsArray = globalCommandsArray;
