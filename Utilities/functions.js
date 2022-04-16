const axios = require('axios');
const client = require('../teaBot');
const logger = require('./logger');
const apiAuth = require('../Utilities/settings/secret/api.json');

/**
 * Function to set guild commands and its required permissions.
 * @param {Object} guildObject - Object with the guild information.
 * @param {Array} slashCommandsArray - Array with slash commands collector
 * @returns message on success, or error on failure.
 */
function registerGuildCommands(guildObject, slashCommandsArray) {
	return new Promise((resolve, reject) => {
		if (typeof guildObject !== 'object') {
			return reject(new Error('Invalid guild object is provided'));
		}
		if (typeof slashCommandsArray !== 'object') {
			return reject(new Error('Invalid slashCommandsArray is provided'));
		}

		guildObject.commands
			.set(slashCommandsArray)
			.then(output => resolve(`🆗 Registered '${output.size}' (${output.map(cmd => cmd.name).join(' • ')}) Slash Commands for '${guildObject.name}' successfully!`))
			.catch(reject);
		// if (guildObject.id === client.config.commandCenter.id) {
		// 	guildObject.commands
		// 		.set(slashCommandsArray)
		// 		.then(async commands => {
		// 			const permissions = client.config.commandCenter.payload;

		// 			for (const command of commands) {
		// 				const cmd = command[1];

		// 				if (client.slashCommands.find(slash => slash.name === cmd.name)?.category === 'TEA') {
		// 					await cmd.permissions.set({ permissions })
		// 						.catch(err => logger.info(`Utilities/function.js registerGuildCommands (1) Error to set permissions for '${cmd.name}' in the '${guildObject.name}' guild.`, err));
		// 				}
		// 			}
		// 			resolve(`🆗 Registered with permissions '${commands.size}' (${commands.map(cmd => cmd.name).join(' • ')}) Slash Commands for '${guildObject.name}' successfully!`);
		// 		})
		// 		.catch(reject);
		// }
	});
}

/**
 * Convert miliseconds to a human readable string.
 * @param {Number} miliseconds Integer in miliseconds
 * @returns String total_days:total_hours:total_minutes:total_seconds:days:hours:minutes:seconds
 */
function convertMsToTime(miliseconds) {
	if (typeof miliseconds !== 'number') return null;

	const total_seconds = Math.floor(miliseconds / 1000);
	const total_minutes = Math.floor(total_seconds / 60);
	const total_hours = Math.floor(total_minutes / 60);
	const total_days = Math.floor(total_hours / 24);
	const days = Math.floor(total_hours / 24);

	const seconds = total_seconds % 60;
	const minutes = total_minutes % 60;
	const hours = total_hours % 24;

	return total_days + ':' + total_hours + ':' + total_minutes + ':' + total_seconds + ':' + days + ':' + hours + ':' + minutes + ':' + seconds;
}

/**
 * Function to check which command should be hidden
 * @param {string} commandName name of a command
 * @returns boolean
 */
function ephemeralToggle(commandName) {
	const slashEphemeral = require('../Utilities/settings/slashEphemeral.json');
	if (slashEphemeral.includes(commandName)) {
		logger.debug(`Utilities/functions.js ephemeralToggle (1) Returned TRUE for ${commandName}`);
		return true;
	} else {
		logger.debug(`Utilities/functions.js ephemeralToggle (2) Returned FALSE for ${commandName}`);
		return false;
	}
}

/**
 * Function to send API request to backend.
 * @param {String} method - POST, GET, PUT, PATCH, DELETE, etc.
 * @param {String} endpoint - URL to send API request to.
 * @param {Object} data - JSON data to send (for POST and PATCH requests).
 * @param {*} callback - (error, response).
 * @returns Either error or response.
 */
function apiCall(method, endpoint, data, callback) {
	const availableMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
	if (typeof method !== 'string') return callback(new Error('Used method is not a string.'));
	if (typeof endpoint !== 'string') return callback(new Error('Used endpoint is not a string.'));

	if (!availableMethods.includes(method.toUpperCase())) return callback(new Error(`Invalid method '${method.toUpperCase()}' is provided.`));
	if (!endpoint) return callback(new Error('Missing API endpoint.'));

	// Methods with data payload.
	if (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PATCH') {
		axios({
			method,
			url: apiAuth.url + endpoint,
			auth: { username: apiAuth.login, password: apiAuth.password }, // Auth to API
			data,
			timeout: 10000
		})
			.then(response => callback(null, response.data))
			.catch(error => callback(error));
	}

	// Methods without data payload.
	if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'DELETE') {
		axios({
			method,
			url: apiAuth.url + endpoint,
			auth: { username: apiAuth.login, password: apiAuth.password }, // Auth to API
			timeout: 10000
		})
			.then(response => callback(null, response.data))
			.catch(error => callback(error));
	}
}

/**
 * Function to manage API errors.
 * @param {Object} error - Error object from API
 * @returns String with error output for the end-user.
 */
function errorResponseHandlerAPI(error) {

	// Switch with different error messages based on the error type.
	switch (error?.code) {
		case 'ECONNREFUSED': return '🥶 API is not responding!\n> Please try again later.';
		case 'ECONNABORTED': return '🥶 API request took too long and has been aborted.\n> Please try again later.';
		default: return `🥶 Something went wrong!\n\n> ${error?.response?.data?.message ? `${error.message} (${error.response.statusText})\n${error.response.data.message.substring(0, 1500)}` : error.message}`;
	}
}

module.exports = {
	registerGuildCommands,
	ephemeralToggle,
	convertMsToTime,
	apiCall,
	errorResponseHandlerAPI,

	/**
	 * Find and return emoji by its name on the command center server.
	 * @param {string} name - Emoji name to find.
	 * @returns Guild emoji object or '🐛' emoji.
	 */
	getEmote: function (name) {
		const guild = client.guilds.cache.get(client.config.commandCenter.id);
		const emoji = guild?.emojis.cache.find(e => e.name === name);

		if (emoji) return emoji;
		else return '🐛';
	},
};
