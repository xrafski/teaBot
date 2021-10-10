const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const { promisify } = require('util');
const logger = require('../Utilities/logger');
const globPromise = promisify(glob);

module.exports = async (client) => {
	logger('startup', `Loaded '${__filename.split('\\').slice(-2).join('/')}' Handler.`);

	const table = new AsciiTable('Events Loaded');
	table.setHeading('Name', 'File location');

	const eventFiles = await globPromise(`${process.cwd()}/Events/*/*.js`);
	eventFiles.map((file) => {
		const event = require(file);
		if (!event.name) return;

		if (event.once) {
			client.once(event.name, (...args) => event.execute(client, ...args));
		} else {
			client.on(event.name, (...args) => event.execute(client, ...args));
		}

		table.addRow(event.name, file.split('/').slice(-3).join('/'));
	});
	console.log(table.toString());
};
