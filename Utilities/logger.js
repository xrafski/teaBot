const dateFormat = require('dateformat');
const config = require('./settings/bot.json');
const logDate = dateFormat(new Date(), 'UTC:dd/mm/yyyy - hh:MM:ss TT');

const logger = {
	/**
	 * Log only available if debug mode is enabled
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.debug()
	 */
	debug: function (text, errObj) {
		if (config.bot.debug === false) return;
		console.debug(`[${logDate} UTC] [DEBUG] 🟣 ${text}${errObj ? ` | ${errObj}` : ''}`);
	},
	/**
	 * Regular log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	log: function (text, errObj) { console.log(`[${logDate} UTC] [LOG] 🟢 ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular info log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.info()
	 */
	info: function (text, errObj) { console.info(`[${logDate} UTC] [INFO] 🔵 ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular warn log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.warn()
	 */
	warn: function (text, errObj) { console.warn(`[${logDate} UTC] [WARN] 🟠 ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular error log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.error()
	 */
	error: function (text, errObj) { console.error(`[${logDate} UTC] [ERROR] 🔴 ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular event log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	event: function (text, errObj) { console.log(`[${logDate} UTC] [EVENT] ⚪ ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular trace log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.trace()
	 */
	trace: function (text, errObj) { console.trace(`[${logDate} UTC] [TRACE] 🟡 ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular update log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	update: function (text, errObj) { console.log(`[${logDate} UTC] [UPDATE] 🟤 ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular startup log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	startup: function (text, errObj) { console.log(`[${logDate} UTC] [STARTUP] 🔰 ${text}${errObj ? ` | ${errObj}` : ''}`); },
	/**
	 * Regular command log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	command: function (text, errObj) { console.log(`[${logDate} UTC] [COMMAND] 🍵 ${text}${errObj ? ` | ${errObj}` : ''}`); },
};


module.exports = logger;