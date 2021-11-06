const config = require('./settings/bot.json');
const moment = require('moment');
const format = 'DD/MM/YYYY - hh:mm:ss A z';

const logger = {
	/**
	 * Log only available if debug mode is enabled
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.debug()
	 */
	debug: (text, errObj) => {
		if (config.bot.debug === false) return;
		console.debug(`[${moment(Date.now()).utc().format(format)}] [DEBUG] 🟣 ${text}${errObj ? ` | ${errObj}` : ''}`);
	},

	/**
	 * Regular log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.info() or console.error() depending if errObj is provided.
	 */
	log: (text, errObj) => {
		if (errObj) console.error(`[${moment(Date.now()).utc().format(format)}] [ERROR] 🔴 ${text}${errObj ? ` | ${errObj}` : ''}`);
		else console.log(`[${moment(Date.now()).utc().format(format)}] [LOG] 🟢 ${text}${errObj ? ` | ${errObj}` : ''}`);
	},

	/**
	 * Regular info log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.info() or console.warn() depending if errObj is provided.
	 */
	info: (text, errObj) => {
		if (errObj) console.warn(`[${moment(Date.now()).utc().format(format)}] [WARN] 🟠 ${text}${errObj ? ` | ${errObj}` : ''}`);
		else console.info(`[${moment(Date.now()).utc().format(format)}] [INFO] 🔵 ${text}${errObj ? ` | ${errObj}` : ''}`);
	},

	/**
	 * Regular event log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	event: (text, errObj) => { console.log(`[${moment(Date.now()).utc().format(format)}] [EVENT] ⚪ ${text}${errObj ? ` | ${errObj}` : ''}`); },

	/**
	 * Regular trace log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.trace()
	 */
	trace: (text, errObj) => { console.trace(`[${moment(Date.now()).utc().format(format)}] [TRACE] 🟡 ${text}${errObj ? ` | ${errObj}` : ''}`); },

	/**
	 * Regular update log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	update: (text, errObj) => { console.log(`[${moment(Date.now()).utc().format(format)}] [UPDATE] 🟤 ${text}${errObj ? ` | ${errObj}` : ''}`); },

	/**
	 * Regular startup log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	startup: (text, errObj) => { console.log(`[${moment(Date.now()).utc().format(format)}] [STARTUP] 🔰 ${text}${errObj ? ` | ${errObj}` : ''}`); },

	/**
	 * Regular command log message
	 * @param {String} text - Any test for logging
	 * @param {String} errObj - Text or error Object to include in the log
	 * @returns formatted console.log()
	 */
	command: (text, errObj) => { console.log(`[${moment(Date.now()).utc().format(format)}] [COMMAND] 🍵 ${text}${errObj ? ` | ${errObj}` : ''}`); },

};


module.exports = logger;