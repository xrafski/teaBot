const AsciiTable = require('ascii-table');
const { glob } = require('glob');
const path = require('path');
const logger = require('../Utilities/logger');

module.exports = client => {
	logger.startup(`Handler/Event.js (1) Loaded '${__filename.split('\\').slice(-2).join('/')}' Handler.`); // Log handler behing loaded.

	// Create a new table.
	const table = new AsciiTable('Events Loaded');
	table.setHeading('Name', 'File location');

	// Event file handler.
	glob('Event/*/*.js', function (err, eventFiles) {
		if (err) return logger.info('Handler/Event.js (2) Error loading event files', err);

		// Map through each file in eventFiles.
		eventFiles.map(file => {

			// Get full path to the command file.
			const event_dir_root = path.join(process.cwd(), file);

			const event = require(event_dir_root);
			if (!event.name) return;

			if (event.once) client.once(event.name, (...args) => event.execute(client, ...args));
			else client.on(event.name, (...args) => event.execute(client, ...args));

			table.addRow(event.name, file.split('/').slice(-3).join('/'));
		});

		// Print table to the console.
		// eslint-disable-next-line no-console
		console.log(table.toString());
	});
};
