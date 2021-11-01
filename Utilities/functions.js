const axios = require('axios');
const client = require('../teaBot');
const logger = require('./logger');
const apiAuth = require('../Utilities/settings/secret/api.json');

/**
 * Function to set guild commands and its required permissions.
 * @param {Object} guildObject - Object with the guild information.
 * @param {Array} slashCommandsArray - Array with slash commands collector
 * @returns message on success, and error on failure.
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
		// if (guildObject.id === client.config.commandCenter.guildID) {
		// 	guildObject.commands
		// 		.set(slashCommandsArray)
		// 		.then(async commands => {
		// 			const permissions = client.config.commandCenter.payload;

		// 			for (const command of commands) {
		// 				const cmd = command[1];

		// 				if (client.slashCommands.find(slash => slash.name === cmd.name)?.category === 'TEA') {
		// 					await cmd.permissions.set({ permissions })
		// 						.catch(err => logger.warn(`Utilities/function.js registerGuildCommands (1) Error to set permissions for '${cmd.name}' in the '${guildObject.name}' guild.`, err));
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
 * Quick way to send an interaction reply.
 * @param {Object} interaction - Interaction object tho.
 * @param {String} content - Message content to reply.
 * @param {Boolean} ephemeral - If the reply have to be ephemer.
 * @param {String} log - Some unique text for logger.
 */
function interactionReply(interaction, content, ephemeral, log) {
	interaction
		.reply({ content, ephemeral })
		.catch(err => logger.error(`${log} Error to send interaction reply.`, err));
}

/**
 * Function to send API request to backend.
 * @param {String} method - POST, GET, PUT, PATCH, DELETE, etc.
 * @param {String} endpoint - URL to send API request to.
 * @returns Either error or response.
 */
async function apiCall(method, endpoint) {
	return new Promise((resolve, reject) => {
		const availableMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
		if (typeof method !== 'string') return reject(new Error('Used method is not a string.'));
		if (typeof endpoint !== 'string') return reject(new Error('Used endpoint is not a string.'));

		if (!availableMethods.includes(method.toUpperCase())) return reject(new Error(`Invalid method '${method.toUpperCase()}'.`));
		if (!endpoint) return reject(new Error('Missing API endpoint.'));

		if (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH') {
			axios({
				method,
				url: endpoint,
				data: { username: apiAuth.login, password: apiAuth.password }, // Body data with auth
			})
				.then(response => resolve(response.data))
				.catch(error => reject(error));
		}

		if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
			axios({
				method,
				url: endpoint,
				auth: { username: apiAuth.login, password: apiAuth.password }, // Header with auth
				timeout: 5000
			})
				.then(response => resolve(response.data))
				.catch(error => reject(error));
		}
	});
}

module.exports = {
	registerGuildCommands,
	ephemeralToggle,
	convertMsToTime,
	interactionReply,
	apiCall,

	/**
	 * Find and return emoji by its name
	 * @param {number} serverID
	 * @param {string} emojiName
	 * @returns emoji object data
	 */
	getEmoji: function (serverID, emojiName) {
		let getEmoji = client.guilds.cache.get(serverID)?.emojis.cache.find((emoji) => emoji.name === emojiName);
		if (getEmoji) return getEmoji;
		else return (getEmoji = '🐛');
		// else return undefined;
	},
};
