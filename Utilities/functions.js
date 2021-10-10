const client = require('../teaBot');
const logger = require('./logger');

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

		if (guildObject.id === client.config.commandCenter.guildID) {
			guildObject.commands
				.set(slashCommandsArray)
				.then(async commands => {
					const permissions = client.config.commandCenter.payload;

					for (const command of commands) {
						const cmd = command[1];

						if (client.slashCommands.find(slash => slash.name === cmd.name)?.category === 'TEA') {
							await cmd.permissions.set({ permissions })
								.catch(err => logger('warn', `Utilities/function.js registerGuildCommands (1) Error to set permissions for '${cmd.name}' in the '${guildObject.name}' guild.`, err));
						}
					}
					resolve(`🆗 Registered with permissions '${commands.size}' (${commands.map(cmd => cmd.name).join(' • ')}) Slash Commands for '${guildObject.name}' successfully!`);
				})
				.catch(reject);


		} else {
			guildObject.commands
				.set(slashCommandsArray)
				.then(output => resolve(`🆗 Registered '${output.size}' (${output.map(cmd => cmd.name).join(' • ')}) Slash Commands for '${guildObject.name}' successfully!`))
				.catch(reject);
		}


	});
}

// function registerGuildCommands(guildObject, slashCommandsArray) {
// 	return new Promise((resolve, reject) => {
// 		if (typeof guildObject !== 'object') {
// 			return reject(new Error('Invalid guild object is provided'));
// 		}
// 		if (typeof slashCommandsArray !== 'object') {
// 			return reject(new Error('Invalid slashCommandsArray is provided'));
// 		}
// 		// const guildObject = client.guilds.cache.get(guildID);
// 		// if (!guildObject) return reject(`Error to get the guild Object from provided ID '${guildID}'.`);

// 		guildObject.commands
// 			.set(slashCommandsArray)
// 			.then((command) => {
// 				const Roles = (commandName) => {
// 					const cmdPerms = slashCommandsArray.find(
// 						(c) => c.name === commandName
// 					).perms;
// 					if (!cmdPerms) return null;
// 					return guildObject.roles.cache.filter(
// 						(r) => r.permissions.has(cmdPerms) && !r.managed
// 					);
// 				};

// 				const fullPermissions = command.reduce((ac, x) => {
// 					const roles = Roles(x.name);
// 					if (!roles) return ac;

// 					const permissions = roles.reduce((a, v) => {
// 						return [...a, { id: v.id, type: 'ROLE', permission: true }];
// 					}, []);

// 					return [...ac, { id: x.id, permissions }];
// 				}, []);

// 				guildObject.commands.permissions
// 					.set({ fullPermissions })
// 					.then(
// 						resolve(
// 							`🆗 Registered and set permissions of '${guildObject.name}' Slash Commands successfully!`
// 						)
// 					)
// 					.catch(reject);
// 				// .then(console.log(`🆗 Handlers/Commands.js (2) Slash command permissions set for '${selectedGuild.name}' successfully!`))
// 				// .catch(error => console.log(`❌ Handlers/Commands.js (3) Error to set guild slash commands permissions`, error));
// 			})
// 			.catch(reject);
// 	});
// }

/**
 * Function to check which command should be hidden
 * @param {string} commandName name of a command
 * @returns boolean
 */
function ephemeralToggle(commandName) {
	const slashEphemeral = require('../Utilities/settings/slashEphemeral.json');
	if (slashEphemeral.includes(commandName)) {
		logger('debug', `Utilities/functions.js ephemeralToggle (1) Returned TRUE for ${commandName}`);
		return true;
	} else {
		logger('debug', `Utilities/functions.js ephemeralToggle (2) Returned FALSE for ${commandName}`);
		return false;
	}
}

module.exports = {
	registerGuildCommands,
	ephemeralToggle,

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
