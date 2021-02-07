const { bot, Discord, TEAlogo, sendEmbedLog, logger } = require("../teaBot");
const fs = require('fs');
const config = require('../bot-settings.json');

bot.on('guildMemberAdd', member => {
    const { guild, user } = member;
    const logChannel = guild.channels.cache.find(channel => channel.name === config.logs.channelName);
    if (!logChannel) return;

    if (logChannel) {
        fs.readFile('./cache/blacklist.json', 'utf8', (error, data) => {
            if (error) return logger('error', 'thread-welcome.js:1 Load certification file', error);

            findThread(JSON.parse(data), user.id)
                .then(threadObject => {
                    const { userEvidence, userName, userReason, userWarning } = threadObject;
                    let { userAlternate, userlastName, userNotes, userDiscord } = threadObject;

                    const embed_user_details = new Discord.MessageEmbed()
                        .setColor(setThreadColor(userWarning))
                        .setAuthor(`Thread user has joined this server!`, TEAlogo)
                        .setTitle(`⚠ Nickname: \`${userName}\``)
                        .setDescription(`**Reason:** ${userReason}\n‏‏‎ ‎‎`)
                        .addFields(
                            { name: 'Detected user:', value: `${user} (${user.tag})`, inline: false },
                            { name: 'Discord User ID(s)', value: userDiscord = userDiscord || 'Unknown', inline: false },
                            { name: 'Last known nickname', value: `\`${userlastName = userlastName || userName}\``, inline: false },
                            { name: 'Alternate accounts', value: `\`${userAlternate = userAlternate || 'No other known accounts'}\``, inline: false },
                            { name: 'Evidence(s)', value: userEvidence, inline: false },
                            { name: 'Additional notes', value: userNotes = userNotes || 'No notes', inline: false },
                            { name: 'Links', value: `Appeal is avaiable over [here](https://forms.gle/oR78HXAJcdSHBEvx7 'Appeal Google Form')\nPlayer report [here](https://forms.gle/8jR6NCXeZZPAsQPf6 'Report Google Form')`, inline: false },
                        )
                        .setThumbnail(TEAlogo)
                        .setTimestamp()
                    sendEmbedLog(embed_user_details, logChannel.id, 'Trove Ethics Alliance - Overwatch');
                    if (userName !== 'Trove Ethics Alliance') logger('warn', `thread-welcome.js:2 ⨀ Thread user (${userName}) joined '${guild.name}'`, null, 'yellow', true);
                })
                .catch(error => {
                    if (error === 'no_user') return;
                    logger('error', 'thread-welcome.js:3 findTread function', error)
                });
        });
    }
})

function findThread(object, userID) {
    return new Promise((resolve, reject) => {
        const regex = new RegExp(`(${userID})`, 'g');

        if (userID === bot.user.id)
            return resolve({
                "userName": "Trove Ethics Alliance",
                "userWarning": "g",
                "userlastName": "Overwatch System Test",
                "userReason": "This is a test of the overwatch system.",
                "userStatus": null,
                "userEvidence": `<#${config.other.officialChannelID}>`,
                "userAlternate": "TEA",
                "userDiscord": bot.user.id,
                "userNotes": '☑ If you see this message, it means that everything is fine.',
                "userPersonal": null
            });

        if (object.find(element => element.userDiscord === userID))
            return resolve(object.find(element => element.userDiscord === userID));

        for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {
                const element = object[key];

                if (element.userDiscord?.match(regex)) {
                    return resolve(element);
                }
            }
        }
        reject('no_user');
    })
}

function setThreadColor(color) {
    switch (color) {
        case 'g': return '#45ff24';
        case 'y': return '#ffff24';
        case 'r': return '#ff1a1a';
        case 'b': return '#0f0f0f';
        default: return '#fcfcfc';
    }
}