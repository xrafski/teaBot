const dateFormat = require('dateformat');
const config = require('./settings/bot.json');

/**
 * logger system!
 * @param {string} type - debug/log/info/warn/error/event/mongo/trace/update/startup/command
 * @param {string} text - any text with to include with the log
 * @param {string} error - error string or object to include with the log
 * @returns console log with current date and message.
 */
function logger(type, text, error) {
	// check if debug is enabled
	if (type?.toLowerCase() === 'debug' && config.bot.debug === false) return;
	text = text?.replace(/\s+/g, ' ');

	const logDate = dateFormat(new Date(), 'UTC:dd/mm/yyyy - hh:MM:ss TT');
	if (!type) return logger('trace', 'logger.js:1 logger() Missing type for command in this trace');

	switch (type.toLowerCase()) {
		case 'debug':
			return console.debug(
				`[${logDate} UTC] [DEBUG] 🟣 ${text}${error ? ` | ${error}` : ''}`
			);
		case 'log':
			return console.log(`[${logDate} UTC] [LOG] 🟢 ${text}${error ? ` | ${error}` : ''}`);
		case 'info':
			return console.info(`[${logDate} UTC] [INFO] 🔵 ${text}${error ? ` | ${error}` : ''}`);
		case 'warn':
			return console.warn(`[${logDate} UTC] [WARN] 🟠 ${text}${error ? ` | ${error}` : ''}`);
		case 'error':
			return console.error(`[${logDate} UTC] [ERROR] 🔴 ${text}${error ? ` | ${error}` : ''}`);
		case 'event':
			return console.log(`[${logDate} UTC] [EVENT] ⚪ ${text}${error ? ` | ${error}` : ''}`);
		case 'mongo':
			return console.log(`[${logDate} UTC] [MONGODB] 📝 ${text}${error ? ` | ${error}` : ''}`);
		case 'trace':
			return console.trace(`[${logDate} UTC] [TRACE] 🟡 ${text}${error ? ` | ${error}` : ''}`);
		case 'update':
			return console.log(`[${logDate} UTC] [UPDATE] 🟤 ${text}${error ? ` | ${error}` : ''}`);
		case 'startup':
			return console.log(`[${logDate} UTC] [STARTUP] 🔰 ${text}${error ? ` | ${error}` : ''}`);
		case 'command':
			return console.log(`[${logDate} UTC] [COMMAND] 🍵 ${text}${error ? ` | ${error}` : ''}`);
		default:
			return console.log(`[${logDate} UTC] [DEFAULT] ⚫ ${type} | ${text} | ${error}`);
	}
}

module.exports = logger;