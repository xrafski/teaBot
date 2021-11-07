const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const { promisify } = require('util');
const logger = require('../Utilities/logger');
const globPromise = promisify(glob);

module.exports = async (client) => {
	logger.startup(`Handler/Event.js (1) Loaded '${__filename.split('\\').slice(-2).join('/')}' Handler.`); // Log handler behing loaded.

	// Create a new table.
	const table = new AsciiTable('Events Loaded');
	table.setHeading('Name', 'File location');

	// Create variable with event files.
	const eventFiles = await globPromise(`${process.cwd()}/Event/*/*.js`);

	// Map through files, run client event listener and add row to a table.
	eventFiles.map((file) => {
		const event = require(file);
		if (!event.name) return;

		if (event.once) client.once(event.name, (...args) => event.execute(client, ...args));
		else client.on(event.name, (...args) => event.execute(client, ...args));

		table.addRow(event.name, file.split('/').slice(-3).join('/'));
	});

	// Print to the console table results.
	console.log(table.toString());
};
