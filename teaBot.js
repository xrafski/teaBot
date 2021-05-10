const Discord = require('discord.js');
const config = require("./bot-settings.json");
const fs = require('fs');
const dateFormat = require("dateformat");
const mongoose = require('mongoose');
const { MongoClient } = require('./functions/mongodb-connection');

const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

// define current bot version.
const BotVersion = '1.0.13a';

// define icon image url for embeds
const TEAlogo = 'https://i.imgur.com/7VUCJ75.png';

const emojiCharacters = { // some ASCII emojis to make my life easier
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

fs.readdir('./commands/', (err, files) => { // Load commands
	if (err) return ('error', 'teaBot.js:1 () Error to load commands', err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return logger('log', 'There are no commands to load...');

	logger('info', `▬▬▬▬▬▬▬▬ LOADED COMMANDS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {

		let props = require(`./commands/${f}`);
		logger('log', `${i + 1}: ${f} - (${props.help.type})`);
		bot.commands.set(props.help.name, props);
	});
});

fs.readdir('./events/', (err, files) => { // Load events
	if (err) return logger('error', 'teaBot.js:2 () Error to load events', err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return logger('info', 'There are no events to load...');

	logger('info', `▬▬▬▬▬▬▬▬ LOADED EVENTS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {
		require(`./events/${f}`);
		logger('log', `${i + 1}: ${f}`);
	});
});

MongoClient() // connect to the mongoDB database
	.then(() => bot.login(config.botDetails.token))
	.catch(err => {
		logger('error', 'teaBot.js:1 MongoClient() Error to connect to the MongoDB', err);
		process.exit(1);
	});

process.on('unhandledRejection', error => {
	console.warn('Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
	mongoose.connection.close({}, () => {
		process.exit(0);
	});
});

process.on('exit', (code) => {
	console.warn(`About to exit with code: ${code}`);
});

//////////////////////////////////////////////////////////////////////////////

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
		else return undefined;
	}
	else return bot.commands; // return all commands if commandName is not provided.;
}

function botReply(text, message, time, attachFile, embedImage) {
	if (!message) return logger('trace', `teaBot.js:1 botReply() message object is not provided`);
	const attachmentFile = (attachFile ? new Discord.MessageAttachment(attachFile) : undefined);
	const imageFileSplit = (embedImage ? embedImage.split('/').slice(-1).toString() : undefined);

	if (time) { // check if time is provided
		if (text) { // check if function has text provided
			if (imageFileSplit && attachmentFile) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
					.attachFiles([attachmentFile]);
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
					.setImage(`attachment://${imageFileSplit}`);
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
					.attachFiles([attachmentFile]);
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
					.setImage(`attachment://${imageFileSplit}`);
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
					.attachFiles([attachmentFile]);
				return message.reply(text, embed_message)
					.catch(error => logger('error', `teaBot.js:17 botReply() Send the message`, error));
			} else if (imageFileSplit) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`);
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
					.attachFiles([attachmentFile]);
				return message.reply(embed_message)
					.catch(error => logger('error', `teaBot.js:21 botReply() Send the message`, error));
			} else if (imageFileSplit) {
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`);
				return message.reply(embed_message)
					.catch(error => logger('error', `teaBot.js:22 botReply() Send the message`, error));
			} else if (attachmentFile) {
				return message.reply(attachmentFile)
					.catch(error => logger('error', `teaBot.js:23 botReply() Send the message`, error));
			} else return logger('warn', `teaBot.js:24 botReply() There is no text nor attachment!`);
		}
	}
}

function embedMessage(text, user) {
	if (!user) {
		// Send an embed message without footer
		const embed_message = new Discord.MessageEmbed()
			.setDescription(text)
			.setColor('#0095ff');
		return embed_message;
	} else {
		// Send an embed message with footer
		const embed_message = new Discord.MessageEmbed()
			.setDescription(text)
			.setColor('#0095ff')
			.setFooter(user.tag, user.displayAvatarURL());
		return embed_message;
	}
}

function getEmoji(serverID, emojiName) {
	let getEmoji = bot.guilds.cache.get(serverID)?.emojis.cache.find(emoji => emoji.name === emojiName);
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
	};

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
							avatar: 'https://i.imgur.com/XqgWBtL.png',
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

function logger(type, text, error) {
	if (type?.toLowerCase() === 'debug' && config.botDebug === false) return; // check if debug is enabled
	text = text?.replace(/\s+/g, ' ');

	const logDate = dateFormat(new Date(), "UTC:dd/mm/yyyy - hh:MM:ss TT");
	if (!type) return logger('trace', 'logger.js:1 logger() Missing type for command in this trace');

	switch (type.toLowerCase()) {
		case 'debug': return console.debug(`[${logDate} UTC] [DEBUG] 🟣 ${text}${(error ? ` | ${error}` : '')}`);
		case 'log': return console.log(`[${logDate} UTC] [LOG] 🟢 ${text}${(error ? ` | ${error}` : '')}`);
		case 'info': return console.info(`[${logDate} UTC] [INFO] 🔵 ${text}${(error ? ` | ${error}` : '')}`);
		case 'warn': return console.warn(`[${logDate} UTC] [WARN] 🟠 ${text}${(error ? ` | ${error}` : '')}`);
		case 'error': return console.error(`[${logDate} UTC] [ERROR] 🔴 ${text}${(error ? ` | ${error}` : '')}`);
		case 'event': return console.log(`[${logDate} UTC] [EVENT] ⚪ ${text}${(error ? ` | ${error}` : '')}`);
		case 'mongo': return console.log(`[${logDate} UTC] [MONGODB] 📝 ${text}${(error ? ` | ${error}` : '')}`);
		case 'trace': return console.trace(`[${logDate} UTC] [TRACE] 🟡 ${text}${(error ? ` | ${error}` : '')}`);
		case 'update': return console.log(`[${logDate} UTC] [UPDATE] 🟤 ${text}${(error ? ` | ${error}` : '')}`);
		default: return console.log(`[${logDate} UTC] [DEFAULT] ⚫ ${type} | ${text} | ${error}`);
	}
}

module.exports = {
	bot, // bot client object.
	Discord, // discord module.
	TEAlogo, // defines icon image url for embeds.
	BotVersion, // defines current bot version.
	emojiCharacters, // defines some discord emojis.

	ownerDM, // a function to send DM to the bot owner.
	getCommand, // a function to get a specific command or all commands.
	botReply, // a function to send messages back as the bot.
	embedMessage, // a function to easily embed message with provided text.
	getEmoji, // a function to get emoji object from a specific server via its name, if invalid emoji is provided, then returns 🐛 back.
	messageRemoverWithReact, // a function to manage await reactions much easier.
	sendEmbedLog, // a function to manage sending webhooks automatically and create a new one if necessary.
	removeUserLastMessage, // a function to remove last user message after 2 seconds.
	logger // a function to manage logs.
};