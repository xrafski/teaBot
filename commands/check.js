const config = require("../bot-settings.json");
const { logger } = require("../functions/logger");
const { mysqlQueryPublic } = require("../functions/mysqlTools");
const { botReply, getEmoji, Discord, TEAlogo, messageRemoverWithReact } = require("../teaBot");

module.exports.help = {
    name: "check",
    description: "Check if user is in thread database",
    type: "public",
    usage: `ℹ️ Format: **${config.botPrefix}check nickname**\n\nℹ️ Example(s):\n${config.botPrefix}check RNG\n**Nickname must contain at least 3 characters!**`
};

module.exports.run = async (bot, message, args) => {
    if (!args[0] || args[0].length < 3) return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message, 10000);
    else {
        mysqlQueryPublic(`SELECT * FROM ${config.mysql.thread_table_name} WHERE alternateAccounts LIKE '%${args[0]}%'`)
            .then(results => {
                if (!results[0]) return botReply(`${getEmoji(config.TEAserverID, 'TEA')} User '**${(args[0].length) > 40 ? `${args[0].slice(0, 40)}...` : `${args[0]}`}**' not found in thread database!`, message, 10000);
                else {
                    const { alternateAccounts, discordID, evidence, lastKnownName, name, notes, privateWorld, reason, status, warning } = results[0];

                    const formatDiscordID = discordID?.replace(/[\\<>@#&! ]/g, "").split(',');
                    let threadInServer = '';

                    formatDiscordID?.forEach(element => {
                        const userObject = checkIfTreadHere(element);
                        if (userObject) threadInServer = threadInServer + `\n${userObject.tag} (${userObject.toString()})`;
                    });

                    if (threadInServer) {
                        const embed_thread_details = new Discord.MessageEmbed()
                            .setColor(gibColorBack(warning))
                            .setAuthor(`Thread Details`, TEAlogo)
                            .setTitle(`User: \`${name}\``)
                            .setDescription(`**Reason**: ${reason}\n‏‏‎ ‎‎`)
                            .addFields(
                                { name: 'Discord User ID(s)', value: discordID, inline: false },
                                { name: 'Last known nickname', value: `\`${lastKnownName}\``, inline: false },
                                { name: 'Alternate accounts', value: `\`${alternateAccounts}\``, inline: false },
                                { name: 'Evidence(s)', value: evidence, inline: false },
                                { name: 'Additional notes', value: notes, inline: false },
                                { name: 'Server Scan', value: `The following threat account(s) have been identified on this server:${threadInServer}`, inline: false },
                                { name: 'Links', value: `Appeal is avaiable over [here](https://forms.gle/oR78HXAJcdSHBEvx7 'Appeal Google Form')\nReport [here](https://forms.gle/8jR6NCXeZZPAsQPf6 'Report Google Form')`, inline: false },
                            )
                            .setThumbnail(TEAlogo)
                            .setTimestamp()
                        botReply(embed_thread_details, message)
                            .then(msg => messageRemoverWithReact(msg, message.author));
                    }
                    else {
                        const embed_thread_details = new Discord.MessageEmbed()
                            .setColor(gibColorBack(warning))
                            .setAuthor(`Thread Details`, TEAlogo)
                            .setTitle(`User: \`${name}\``)
                            .setDescription(`**Reason**: ${reason}\n‏‏‎ ‎‎`)
                            .addFields(
                                { name: 'Discord User ID(s)', value: discordID, inline: false },
                                { name: 'Last known nickname', value: `\`${lastKnownName}\``, inline: false },
                                { name: 'Alternate accounts', value: `\`${alternateAccounts}\``, inline: false },
                                { name: 'Evidence(s)', value: evidence, inline: false },
                                { name: 'Additional notes', value: notes, inline: false },
                                { name: 'Server Scan', value: `There is no associated user on this server with this threat.`, inline: false },
                                { name: 'Links', value: `Appeal is avaiable over [here](https://forms.gle/oR78HXAJcdSHBEvx7 'Appeal Google Form')\nReport [here](https://forms.gle/8jR6NCXeZZPAsQPf6 'Report Google Form')`, inline: false },
                            )
                            .setThumbnail(TEAlogo)
                            .setTimestamp()
                        botReply(embed_thread_details, message)
                            .then(msg => messageRemoverWithReact(msg, message.author));
                    }

                    function gibColorBack(params) {
                        switch (params) {
                            case 'g': return '#45ff24';
                            case 'y': return '#ffff24';
                            case 'r': return '#ff1a1a';
                            case 'b': return '#0f0f0f';
                            default: return '#fcfcfc';
                        }
                    }

                    function checkIfTreadHere(params) {
                        const userObject = message.guild.members.cache.get(params);
                        if (userObject) return userObject.user;
                        else return false;
                    }
                }
            })
            .catch(error => {
                logger('error', `check.js:1 () mysqlQuery`, error);
                console.error(error);
                botReply('❌ Database error, try again later.', message, 10000);
            });
    }
}