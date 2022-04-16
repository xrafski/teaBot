const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const path = require('path');
const logger = require('../Utilities/logger');

const guildCommandsArray = []; // Public guild commands
const adminCommandsArray = []; // TEA Admin commands
const globalCommandsArray = []; // Global commands

/**
 * @param {Client} client
 */
module.exports = client => {
	logger.startup(`Handler/Command.js (1) Loaded '${__filename.split('\\').slice(-2).join('/')}' Handler.`); // Log handler being loaded.

	// Create a new table.
	const table = new AsciiTable('Commands Loaded');
	table.setHeading('Category', 'Name', 'File');

	// Classic Commands Handler.
	glob('Command/Classic/**/*.js', function (err, classicCommandFiles) {
		if (err) return logger.info('Handler/Command.js (2) Error loading classic command files', err);

		// Map through each file in classicCommandFiles.
		classicCommandFiles.map(file => {

			// Get full path to the command file.
			const cmd_dir_root = path.join(process.cwd(), file);

			// Assign variable to a command file.
			const classicCommand = require(cmd_dir_root);

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

	});

	// Slash Commands Handler
	glob('Command/Slash/**/*.js', function (err, slashCommandFiles) {
		if (err) return logger.info('Error loading slash command files', err);

		// Map through each file in slashCommandFiles.
		slashCommandFiles.map(async (file) => {

			// Get full path to the command file.
			const cmd_dir_root = path.join(process.cwd(), file);

			// Assign variable to a command file.
			const slashCommand = require(cmd_dir_root);

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
				default: return logger.info(`Handler/Command.js (3) Command '${slashCommand.name}' doesn't have a correct category '${slashCommand.category}'!`);
			}
		});

		// eslint-disable-next-line no-console
		console.log(table.toString());

	});
};

module.exports.guildSlashCommandsArray = guildCommandsArray;
module.exports.adminSlashCommandsArray = adminCommandsArray;
module.exports.globalSlashCommandsArray = globalCommandsArray;
