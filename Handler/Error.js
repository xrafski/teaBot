const logger = require('../Utilities/logger');

module.exports = async () => {
	logger.startup(`Handler/Command.js (1) Loaded '${__filename.split('\\').slice(-2).join('/')}' Handler.`); // Log handler being loaded.

	// Catch all unhandled rejection messages
	process.on('unhandledRejection', (error) => {
		console.warn('[teaBot] Unhandled promise rejection:', error);
	});

	process.on('SIGINT', () => {
		process.exit(0);
	});

	process.on('exit', (code) => {
		console.warn(`[teaBot] About to exit with code: ${code}`);
	});
};