const Discord = require('discord.js');
const config = require("./bot-settings.json");
const fs = require('fs');
const dateFormat = require("dateformat");

const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

// define current bot version.
const BotVersion = '1.0.5';

// define icon image url for embeds
const TEAlogo = 'https://skillez.eu/images/discord/teabanner.png'

const emojiCharacters = {
	a: '🇦', b: '🇧', c: '🇨', d: '🇩',
	e: '🇪', f: '🇫', g: '🇬', h: '🇭',
	i: '🇮', j: '🇯', k: '🇰', l: '🇱',
	m: '🇲', n: '🇳', o: '🇴', p: '🇵',
	q: '🇶', r: '🇷', s: '🇸', t: '🇹',
	u: '🇺', v: '🇻', w: '🇼', x: '🇽',
	y: '🇾', z: '🇿', 0: '0⃣', 1: '1⃣',
	2: '2⃣', 3: '3⃣', 4: '4⃣', 5: '5⃣',
	6: '6⃣', 7: '7⃣', 8: '8⃣', 9: '9⃣',
	10: '🔟', '#': '#⃣', '*': '*⃣',
	'!': '❗', '?': '❓', 'i': 'ℹ️',
};

// Load commands and events
bot.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
	if (err) return ('error', 'teaBot.js:1 () Loading commands', err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return logger('log', 'There are no commands to load...');

	logger('info', `▬▬▬▬▬▬▬▬ LOADED COMMANDS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {

		let props = require(`./commands/${f}`);
		logger('log', `${i + 1}: ${props.help.type} - ${f}`);
		bot.commands.set(props.help.name, props);
	});
});

fs.readdir('./events/', (err, files) => {
	if (err) return logger('error', 'teaBot.js:2 () Loading events', err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return logger('info', 'There are no events to load...');

	logger('info', `▬▬▬▬▬▬▬▬ LOADED EVENTS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {
		require(`./events/${f}`);
		logger('log', `${i + 1}: ${f}`);
	});
});

process.on('unhandledRejection', error => {
	console.warn('Unhandled promise rejection:', error);
});

function ownerDM(message) {
	message = message || 'Message is not provided';
	const ownerObj = bot.users.cache.get(config.botOwnerID);
	if (ownerObj) ownerObj.send(message)
		.catch(error => logger('error', `teaBot.js:1 ownerDM() Send owner DM`, error));
	else return logger('error', `teaBot.js:2 ownerDM() Bot owner is undefined probably wrong uID in config.botOwnerID`);
}

function getCommand(commandName) {
	if (commandName) {
		if (bot.commands.get(commandName)) return bot.commands.get(commandName);
		else undefined;
	}
	else return bot.commands; // return all commands if commandName is not provided.
}

function botReply(text, message, time, attachFile, embedImage) {
	if (!message) return logger('error', `teaBot.js:1 botReply() message object is not provided`);
	const attachmentFile = (attachFile ? new Discord.MessageAttachment(attachFile) : undefined);
	const imageFileSplit = (embedImage ? embedImage.split('/').slice(-1).toString() : undefined);

	if (time) { // check if time is provided
		if (text) { // check if function has text provided
			if (imageFileSplit && attachmentFile) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
					.attachFiles([attachmentFile])
				return message.reply(text, embed_message)
					.then(msg => {
						if (msg.deletable) msg.delete({ timeout: time })
							.catch(error => logger('error', `teaBot.js:2 botReply() Delete the message`, error));
					})
					.catch(error => logger('error', `teaBot.js:3 botReply() Send the message`, error));
			} else if (imageFileSplit) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(text, embed_message)
					.then(msg => {
						if (msg.deletable) msg.delete({ timeout: time })
							.catch(error => logger('error', `teaBot.js:4 botReply() Delete the message`, error));
					})
					.catch(error => logger('error', `teaBot.js:5 botReply() Send the message`, error));
			} else if (attachmentFile) {
				return message.reply(text, attachmentFile)
					.then(msg => {
						if (msg.deletable) msg.delete({ timeout: time })
							.catch(error => logger('error', `teaBot.js:6 botReply() Delete the message`, error));
					})
					.catch(error => logger('error', `teaBot.js:7 botReply() Send the message`, error));
			} else {
				return message.reply(text)
					.then(msg => {
						if (msg.deletable) msg.delete({ timeout: time })
							.catch(error => logger('error', 'teaBot.js:8 botReply() Delete the message', error));
					})
					.catch(error => logger('error', `teaBot.js:9 botReply() Send the message`, error));
			}
		} else { // if without text
			if (imageFileSplit && attachmentFile) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
					.attachFiles([attachmentFile])
				return message.reply(embed_message)
					.then(msg => {
						if (msg.deletable) msg.delete({ timeout: time })
							.catch(error => logger('error', `teaBot.js:10 botReply() Delete the message`, error));
					})
					.catch(error => logger('error', `teaBot.js:11 botReply() Send the message`, error));
			} else if (imageFileSplit) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(embed_message)
					.then(msg => {
						if (msg.deletable) msg.delete({ timeout: time })
							.catch(error => logger('error', `teaBot.js:12 botReply() Delete the messaege`, error));
					})
					.catch(error => logger('error', `teaBot.js:13 botReply() Send the message`, error));
			} else if (attachmentFile) {
				return message.reply(attachmentFile)
					.then(msg => {
						if (msg.deletable) msg.delete({ timeout: time })
							.catch(error => logger('error', `teaBot.js:14 botReply() Delete the message`, error));
					})
					.catch(error => logger('error', `teaBot.js:15 botReply() Send the message`, error));
			} else return logger('error', `teaBot.js:16 botReply() There is no text nor attachment!`);
		}
	} else { // if there is no time provided
		if (text) { // check if function has text provided
			if (imageFileSplit && attachmentFile) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
					.attachFiles([attachmentFile])
				return message.reply(text, embed_message)
					.catch(error => logger('error', `teaBot.js:17 botReply() Send the message`, error));
			} else if (imageFileSplit) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(text, embed_message)
					.catch(error => logger('error', `teaBot.js:18 botReply() Send the message`, error));
			} else if (attachmentFile) {
				return message.reply(text, attachmentFile)
					.catch(error => logger('error', `teaBot.js:19 botReply() Send the message`, error));
			} else {
				return message.reply(text)
					.catch(error => logger('error', `teaBot.js:20 botReply() Send the message`, error));
			}
		} else { // if without text
			if (imageFileSplit && attachmentFile) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
					.attachFiles([attachmentFile])
				return message.reply(embed_message)
					.catch(error => logger('error', `teaBot.js:21 botReply() Send the message`, error));
			} else if (imageFileSplit) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(embed_message)
					.catch(error => logger('error', `teaBot.js:22 botReply() Send the message`, error));
			} else if (attachmentFile) {
				return message.reply(attachmentFile)
					.catch(error => logger('error', `teaBot.js:23 botReply() Send the message`, error));
			} else return logger('error', `teaBot.js:24 botReply() There is no text nor attachment!`);
		}
	}
}

function embedMessage(text, user) {
	if (!user) {
		// Send an embed message without footer
		const embed_message = new Discord.MessageEmbed()
			.setDescription(text)
			.setColor('#0095ff')
		return embed_message;
	} else {
		// Send an embed message with footer
		const embed_message = new Discord.MessageEmbed()
			.setDescription(text)
			.setColor('#0095ff')
			.setFooter(user.tag, user.displayAvatarURL())
		return embed_message;
	}
}

function getEmoji(serverID, emojiName) {
	let getEmoji = bot.guilds.cache.get(serverID).emojis.cache.find(emoji => emoji.name === emojiName);
	if (getEmoji) return getEmoji;
	else return getEmoji = '🐛';
	// else return undefined;
}

async function messageRemoverWithReact(message, author) {
	if (!message) return;
	await message.react('❌')
		.catch(error => logger('error', `teaBot.js:1 messageRemoverWithReact() Add reaction on the #${message.channel.name} in '${message.guild.name}' server`, error));

	const emojiFilter = (reaction, user) => {
		return ['❌'].includes(reaction.emoji.name) && !user.bot && author === user;
	}

	message.awaitReactions(emojiFilter, { max: 1, time: 60000 })
		.then(collected => {
			const reaction = collected.first();
			if (reaction.emoji.name === '❌' && message.deletable) return message.delete()
				.catch(error => logger('error', `teaBot.js:2 messageRemoverWithReact() Delete the message on the #${message.channel.name} in '${message.guild.name}' server`, error));
		})
		.catch(error => {
			if (message.deletable) message.delete()
				.catch(error => logger('error', `teaBot.js:3 messageRemoverWithReact() Delete the message on the #${message.channel.name} in '${message.guild.name}' server`, error));
			if (error.message === "Cannot read property 'emoji' of undefined") return;
			else logger('error', `teaBot.js:4 messageRemoverWithReact() Reaction error on the #${message.channel.name} in '${message.guild.name}' server`, error);
		});
}

function sendEmbedLog(MessageTest, channelID, webHookName) {
	return new Promise((resolve, reject) => {
		const logChannel = bot.channels.cache.get(channelID);
		if (!logChannel) return reject({ 'info': `Target channel is not found.`, 'data': null });
		else {
			logChannel.fetchWebhooks()
				.then(hooks => {
					const existingHook = hooks.find(hook => hook.owner === bot.user && hook.name === webHookName);
					if (!existingHook) {
						logChannel.createWebhook(webHookName, {
							avatar: 'https://skillez.eu/images/discord/teaicon.png',
							reason: 'Webhook required to send log messages.'
						})
							.then(hook => {
								logger('log', `teaBot.js:1 sendEmbedLog() A new webhook '${webHookName}' has been created for the #${logChannel.name} channel in the '${logChannel.guild.name}'`);
								hook.send(MessageTest)
									.then(msg => resolve(msg))
									.catch(error => reject({ 'info': `Error to send a webhook message to the #${logChannel.name} channel`, 'data': error }));
							})
							.catch(error => reject({ 'info': `Error to create a new webhook for the #${logChannel.name} channel`, 'data': error }));
					} else {
						existingHook.send(MessageTest)
							.then(msg => resolve(msg))
							.catch(error => reject({ 'info': `Error to send a webhook message to the #${logChannel.name} channel`, 'data': error }));
					}
				})
				.catch(error => reject({ 'info': `Error to fetch webhooks for the #${logChannel.name} channel`, 'data': error }));
		}
	});
}

function removeUserLastMessage(message) {
	if (!message.author.lastMessage) return;
	message.author.lastMessage.channel.messages.fetch(message.author.lastMessage.id)
		.then(userLastMessage => {
			if (userLastMessage.deletable) userLastMessage.delete({ timeout: 2000 })
				.catch(error => logger('error', `teaBot.js:1 removeUserLastMessage() '${(userLastMessage.content.length > 40 ? `${userLastMessage.content.slice(0, 40)}...` : `${userLastMessage.content}`)}' sent by '${userLastMessage.author.tag}' in '${userLastMessage.guild.name}' server`, error));
		})
		.catch(error => logger('error', `teaBot.js:2 removeUserLastMessage() Fetch user last message in '${message.guild.name}' server`, error));
}

function logger(type, text, error, color, sendChannelLog) {
	text = text?.replace(/\s+/g, ' ').split(' ⨀ ');

	switch (color?.toLowerCase()) {
		case 'red': return sendLog('\u001b[1;31m');
		case 'green': return sendLog('\u001b[1;32m');
		case 'yellow': return sendLog('\u001b[1;33m');
		case 'blue': return sendLog('\u001b[1;34m');
		case 'purple': return sendLog('\u001b[1;35m');
		case 'cyan': return sendLog('\u001b[1;36m');
		case 'white': return sendLog('\u001b[1;37m');
		default: return sendLog('');
	}

	function sendLog(clr) {
		const logDate = dateFormat(new Date(), "UTC:dd/mm/yyyy - h:MM:ss TT");
		if (!type) return logger('trace', 'logger.js:1 logger() Missing type for command in this trace');

		switch (type.toLowerCase()) {
			case 'debug':
				if (config.botDebug) return console.debug(`[${logDate} UTC] [DEBUG]${clr} 🟣 ${text?.join(' ⨀ ')}${(error ? ` | ${error}` : '')}\u001b[0m`);
				else return;
			case 'log': {
				console.log(`[${logDate} UTC] [LOG]${clr} 🟢 ${text?.join(' ⨀ ')}${(error ? ` | ${error}` : '')}\u001b[0m`);
				if (sendChannelLog) return sendEmbedLog(logEmbed(text, error, color), config.logs.botChannelLogID, config.logs.loggerName)
					.catch(error => logger('error', 'teaBot.js:1 sendLog() sendEmbedLog error', error?.info));
				else return;
			}
			case 'info': {
				console.info(`[${logDate} UTC] [INFO]${clr} 🔵 ${text?.join(' ⨀ ')}${(error ? ` | ${error}` : '')}\u001b[0m`);
				if (sendChannelLog) return sendEmbedLog(logEmbed(text, error, color), config.logs.botChannelLogID, config.logs.loggerName)
					.catch(error => logger('error', 'teaBot.js:2 sendLog() sendEmbedLog error', error?.info));
				else return;
			}
			case 'warn': {
				console.warn(`[${logDate} UTC] [WARN]${clr} 🟡 ${text?.join(' ⨀ ')}${(error ? ` | ${error}` : '')}\u001b[0m`);
				if (sendChannelLog) return sendEmbedLog(logEmbed(text, error, color), config.logs.botChannelLogID, config.logs.loggerName)
					.catch(error => logger('error', 'teaBot.js:3 sendLog() sendEmbedLog error', error?.info));
				else return;
			}
			case 'error': {
				console.error(`[${logDate} UTC] [ERROR]${clr} 🔴 ${text?.join(' ⨀ ')}${(error ? ` | ${error}` : '')}\u001b[0m`);
				if (sendChannelLog) return sendEmbedLog(logEmbed(text, error, color), config.logs.botChannelLogID, config.logs.loggerName)
					.catch(error => logger('error', 'teaBot.js:4 sendLog() sendEmbedLog error', error?.info));
				else return;
			}
			case 'trace': return console.trace(`[${logDate} UTC] [TRACE]${clr} 🟤 ${text?.join(' ⨀ ')}${(error ? ` | ${error}` : '')}\u001b[0m`);
			case 'update': {
				console.log(`[${logDate} UTC] [UPDATE]${clr} ⧭ ${text?.join(' ⨀ ')}${(error ? ` | ${error}` : '')}\u001b[0m`);
				if (sendChannelLog) return sendEmbedLog(logEmbed(text, error, color), config.logs.botChannelLogID, config.logs.loggerName)
					.catch(error => logger('error', 'teaBot.js:5 sendLog() sendEmbedLog error', error?.info));
				else return;
			}
			default: return console.log(`[${logDate} UTC] [DEFAULT] ⚪ ${type} | ${text?.join(' ⨀ ')} | ${error}`);
		}

		function logEmbed(text, error, color) {
			switch (color?.toLowerCase()) {
				case 'red': return sendTheEmbed(text, error, '#ff1a1a');
				case 'green': return sendTheEmbed(text, error, '#1dff1a');
				case 'yellow': return sendTheEmbed(text, error, '#f7ff0a');
				case 'blue': return sendTheEmbed(text, error, '#006ef5');
				case 'purple': return sendTheEmbed(text, error, '#a727e7');
				case 'cyan': return sendTheEmbed(text, error, '#1ac9ff');
				case 'white': return sendTheEmbed(text, error, '#fafafa');
				default: return sendTheEmbed(text, error, '#030303');
			}

			function sendTheEmbed(text, error, color) {
				if (error) {
					const embed_log_message = new Discord.MessageEmbed()
						.setDescription(text[1])
						.setColor(color)
						.addFields({ name: type.toUpperCase(), value: error, inline: false })
						.setFooter(text[0], bot.user.displayAvatarURL())
						.setTimestamp()
					return embed_log_message;
				} else {
					const embed_log_message = new Discord.MessageEmbed()
						.setDescription(text[1])
						.setColor(color)
						.setFooter(text[0], bot.user.displayAvatarURL())
						.setTimestamp()
					return embed_log_message;
				}
			}
		}
	}
}

module.exports = {
	bot: bot, // bot client object.
	Discord: Discord, // discord module.
	TEAlogo: TEAlogo, // defines icon image url for embeds.
	BotVersion: BotVersion, // defines current bot version.
	emojiCharacters: emojiCharacters, // defines some discord emojis.

	ownerDM: ownerDM, // a function to send DM to the bot owner.
	getCommand: getCommand, // a function to get a specific command or all commands.
	botReply: botReply, // a function to send messages back as the bot.
	embedMessage: embedMessage, // a function to easily embed message with provided text.
	getEmoji: getEmoji, // a function to get emoji object from a specific server via its name, if invalid emoji is provided, then returns 🐛 back.
	messageRemoverWithReact: messageRemoverWithReact, // a function to manage await reactions much easier.
	sendEmbedLog: sendEmbedLog, // a function to manage sending webhooks automatically and create a new one if necessary.
	removeUserLastMessage: removeUserLastMessage, // a function to remove last user message after 2 seconds.
	logger: logger // a function to manage logs.
}