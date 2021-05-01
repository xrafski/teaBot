const config = require("../bot-settings.json");
const fs = require('fs');
const { botReply, TEAlogo, Discord, logger, embedMessage } = require("../teaBot");

module.exports.help = {
  name: "check",
  description: "Check if user is in threat database.",
  type: "public",
  usage: `ℹ️ Format: **${config.botPrefix}check userName**\nℹ️ Example(s):\n${config.botPrefix}user RNG\n${config.botPrefix}check Surge\n**Nickname must contain at least 3 characters!**`
};

module.exports.run = async (bot, message, args) => {
  fs.readFile('./cache/blacklist.json', 'utf8', (error, data) => {
    if (error) {
      logger('error', 'check.js:1 () Load blacklist.json file', error);
      return botReply('Error to parse data, try again later.', message);
    }

    const newData = JSON.parse(data);
    if (!args[0] || args[0].length < 3) return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);

    const searchValue = message.content.slice(config.botPrefix.length + module.exports.help.name.length).trim().toLowerCase();
    return findTheUser(newData, searchValue)
      .then(threatUser => {

        const { userName, userWarning, userReason, userEvidence } = threatUser;
        let { userlastName, userAlternate, userNotes, userDiscord } = threatUser;

        const formatDiscordID = userDiscord?.replace(/[\\<>@#&?! ]/g, "").split(',');
        let threatInServer = '';

        formatDiscordID?.forEach(element => {
          const threatFound = checkIfThreatHere(element);
          if (threatFound) threatInServer = threatInServer + `\n${threatFound.tag} (${threatFound.toString()})`;
        });

        if (threatInServer) {
          const embed_user_details = new Discord.MessageEmbed()
            .setColor(setThreatColor(userWarning))
            .setAuthor(`Threat Details`, TEAlogo)
            .setTitle(`Nickname: \`${userName}\``)
            .setDescription(`**Reason:** ${userReason}\n‏‏‎ ‎‎`)
            .addFields(
              { name: 'Discord User ID(s)', value: userDiscord = userDiscord || 'Data is not provided', inline: false },
              { name: 'Last known nickname', value: `\`${userlastName = userlastName || userName}\``, inline: false },
              { name: 'Alternate accounts', value: `\`${userAlternate = userAlternate || 'No other known accounts'}\``, inline: false },
              { name: 'Evidence(s)', value: userEvidence, inline: false },
              { name: 'Additional notes', value: userNotes = userNotes || 'No notes', inline: false },
              { name: 'Server Scan', value: `The following threat account(s) have been identified on this server:${threatInServer}`, inline: false },
              { name: 'Links', value: `Appeal is available over [here](https://forms.gle/oR78HXAJcdSHBEvx7 'Appeal Google Form')\nPlayer report [here](https://forms.gle/8jR6NCXeZZPAsQPf6 'Report Google Form')`, inline: false },
            )
            .setThumbnail(TEAlogo)
            .setTimestamp();
          botReply(embed_user_details, message);
          // .then(msg => messageRemoverWithReact(msg, message.author));
        } else {
          const embed_user_details = new Discord.MessageEmbed()
            .setColor(setThreatColor(userWarning))
            .setAuthor(`Threat Details`, TEAlogo)
            .setTitle(`Nickname: \`${userName}\``)
            .setDescription(`**Reason:** ${userReason}\n‏‏‎ ‎‎`)
            .addFields(
              { name: 'Discord User ID(s)', value: userDiscord = userDiscord || 'Unknown', inline: false },
              { name: 'Last known nickname', value: `\`${userlastName = userlastName || userName}\``, inline: false },
              { name: 'Alternate accounts', value: `\`${userAlternate = userAlternate || 'No other known accounts'}\``, inline: false },
              { name: 'Evidence(s)', value: userEvidence, inline: false },
              { name: 'Additional notes', value: userNotes = userNotes || 'No notes', inline: false },
              { name: 'Server Scan', value: `There is no associated user on this server with this threat.`, inline: false },
              { name: 'Links', value: `Appeal is available over [here](https://forms.gle/oR78HXAJcdSHBEvx7 'Appeal Google Form')\nPlayer report [here](https://forms.gle/8jR6NCXeZZPAsQPf6 'Report Google Form')`, inline: false },
            )
            .setThumbnail(TEAlogo)
            .setTimestamp();
          botReply(embed_user_details, message);
          // .then(msg => messageRemoverWithReact(msg, message.author));
        }
      })
      .catch(error => {
        switch (error) {
          case 'no_user': return botReply(embedMessage(`❌ This user is not detected as a threat in our database.\nHowever, if you think otherwise, please report over **[here](https://forms.gle/8jR6NCXeZZPAsQPf6 'Report Google Form')**.`), message);
          case 'invalid_regex': return botReply('❌ Invalid nickname, make sure to type only alphanumeric characters!', message);
          default: {
            logger('error', 'check.js:2 () Check for user', error);
            return botReply('❌ Error with the command, try again later.', message);
          }
        }
      });
  });

  function findTheUser(object, word) {
    return new Promise((resolve, reject) => {
      if (!word.match(/[a-zA-Z0-9 ]/)) return reject('invalid_regex');
      const regex = new RegExp(`(${word})`, 'gi');

      if (object.find(element => element.userName?.toLowerCase() === word || element.userlastName?.toLowerCase() === word || element.userAlternate?.toLowerCase() === word || element.userDiscord?.toLowerCase() === word))
        return resolve(object.find(element => element.userName?.toLowerCase() === word || element.userlastName?.toLowerCase() === word || element.userAlternate?.toLowerCase() === word || element.userDiscord?.toLowerCase() === word));

      for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          const element = object[key];

          if (element.userName?.match(regex) || element.userlastName?.match(regex) || element.userAlternate?.match(regex) || element.userDiscord?.match(regex)) return resolve(element);
        }
      }
      reject('no_user');
    });
  }

  function setThreatColor(color) {
    switch (color) {
      case 'g': return '#45ff24';
      case 'y': return '#ffff24';
      case 'r': return '#ff1a1a';
      case 'b': return '#0f0f0f';
      default: return '#fcfcfc';
    }
  }

  function checkIfThreatHere(params) {
    const userObject = message.guild.members.cache.get(params);
    if (userObject) return userObject.user;
    else return false;
  }
};