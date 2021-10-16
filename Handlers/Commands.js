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
	logger('startup', `Handlers/Commands.js (1) Loaded '${__filename.split('\\').slice(-2).join('/')}' Handler.`);

	const table = new AsciiTable('Commands Loaded');
	table.setHeading('Category', 'Name', 'File');

	(await PG(`${process.cwd()}/Commands/Slash/*/*.js`)).map(async (file) => {
		const command = require(file);
		if (!command.name) return;
		// if (command.category === 'TEA') command.defaultPermission = false;

		if (command.category === 'GLOBAL') {
			globalCommandsArray.push(command);
		} else if (command.category === 'TEA') {
			command.defaultPermission = false;
			adminCommandsArray.push(command);
		} else if (command.category === 'GUILD') {
			guildCommandsArray.push(command);
		} else {
			return logger('warn', `Handlers/Commands.js (2) Command '${command.name}' doesn't have a correct category '${command.category}'!`);
		}


		client.slashCommands.set(command.name, command);
		table.addRow(
			command.category,
			command.name,
			file.split('/').slice(-4).join('/')
		);
	});
	console.log(table.toString());
};

module.exports.guildSlashCommandsArray = guildCommandsArray;
module.exports.adminSlashCommandsArray = adminCommandsArray;
module.exports.globalSlashCommandsArray = globalCommandsArray;
