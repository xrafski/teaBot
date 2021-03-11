const config = require("../bot-settings.json");
const { botReply, logger } = require("../teaBot");

module.exports.help = {
    name: "embed",
    description: "Send an embed message with RAW JSON data - <https://carl.gg/>",
    type: "administrator",
    usage: `ℹ️ Format: **${config.botPrefix}embed JSONdata** | message content\nℹ️ Example(s):\n${config.botPrefix}embed {"description":"embed message","author":{"name":"Test"},"color":1174281}\n${config.botPrefix}embed {"description":"embed message","author":{"name":"Test"},"color":62708} | My Test Embed`
};

module.exports.run = async (bot, message, args) => {
    if (message.deletable) message.delete({ timeout: 1000 }).catch(error => logger('embed.js:1 () Delete the message', error));

    const arguments = args.join(' ').split(' | ');
    if (arguments[1]) {
        try {
            JSON.parse(arguments[0]);
        } catch (error) {
            return botReply('Invalid JSON input.', message);
        }

        const messageBot = {
            content: arguments[1],
            embed: JSON.parse(arguments[0])
        };
        return message.channel.send(messageBot)
            .catch(error => logger('error', `embed.js:2 () Send the message`, error));
    } else if (arguments[0]) {
        try {
            JSON.parse(arguments[0]);
        } catch (error) {
            return botReply('Invalid JSON input.', message);
        }

        const messageBot = {
            embed: JSON.parse(arguments[0])
        };
        return message.channel.send(messageBot)
            .catch(error => logger(`embed.js:3 () Send the message`, error));
    } else return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);


    // // for webhook
    // const messageWebhook = {
    //     content: 'test message content',
    //     embeds: [
    //         { "description": "embed message preview", "author": { "name": "TEA" }, "color": 62708 },
    //         { "description": "embed message", "author": { "name": "Test" }, "color": 1174281 }
    //     ]
    // }

    // // for the bot
    // const messageBot = {
    //     content: 'test message content',
    //     embed: { "description": "embed message preview", "author": { "name": "TEA" }, "color": 2356224 }
    // }
};