const mongoose = require('mongoose');
const { logger } = require('../Utilities/functions');

logger('startup', `Loaded '${__filename.split("\\").slice(-2).join('/')}' Handler.`);

process.on('unhandledRejection', error => {
	console.warn('[teaBot] Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
	mongoose.connection.close({}, () => {
		process.exit(0);
	});
});

process.on('exit', (code) => {
	console.warn(`[teaBot] About to exit with code: ${code}`);
});