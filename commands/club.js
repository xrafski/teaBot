const { botReply, TEAlogo, Discord, logger, getEmoji } = require("../teaBot");
const config = require("../bot-settings.json");
const fs = require('fs');

module.exports.help = {
  name: "club",
  description: "Show information about the club.",
  type: "public",
  usage: `ℹ️ Format: **${config.botDetails.prefix}club clubName**\nℹ️ Example(s):\n${config.botDetails.prefix}club laez\n${config.botDetails.prefix}club henort`
};

module.exports.run = async (bot, message, args) => {
  fs.readFile('./cache/certification.json', 'utf8', (error, data) => {
    if (error) {
      logger('error', 'club.js:1 () Load certification.json file', error);
      return botReply('Error to parse data, try again later.', message);
    }

    const newData = JSON.parse(data);
    if (!args[0] || args[0].length < 3) return botReply(`Wrong command format, type **${config.botDetails.prefix}help ${module.exports.help.name}** to see usage and examples!`, message);

    const searchValue = message.content.slice(config.botDetails.prefix.length + module.exports.help.name.length).trim().toLowerCase();
    return findTheClub(newData, searchValue)
      .then(club => {
        const { guildDescription, guildName, guildRepresentative, guildRequirements } = club;
        let { guildDiscordID, guildJoinworld, guildDiscordLink } = club;

        const embed_club_details = new Discord.MessageEmbed()
          .setColor('#f7f7f7')
          .setAuthor(`Club Details`, TEAlogo)
          .setTitle(`Club Name: \`${guildName}\``)
          .setDescription(`${guildDescription}\n‏‏‎ ‎‎`)
          .addFields(
            { name: 'Discord Server ID', value: guildDiscordID = guildDiscordID || 'Data is not provided', inline: false },
            { name: 'in-game club world', value: guildJoinworld = (guildJoinworld ? `\`/joinworld ${guildJoinworld?.toLowerCase()}\`` : 'Data is not provided'), inline: false },
            { name: 'Requirement(s)', value: guildRequirements, inline: false },
            { name: 'Discord Invite', value: guildDiscordLink = guildDiscordLink || 'Data is not provided', inline: false },
            { name: 'Representative', value: guildRepresentative, inline: false },
          )
          .setThumbnail(TEAlogo)
          .setTimestamp();
        botReply(embed_club_details, message);
        // .then(msg => messageRemoverWithReact(msg, message.author));
      })
      .catch(error => {
        switch (error) {
          case 'no_club': return botReply(`❌ This club is not part of ${getEmoji(config.botDetails.TEAserverID, 'TEA')}**Trove Ethics Alliance**.`, message);
          case 'invalid_regex': return botReply('❌ Invalid club name, make sure to type only alphanumeric characters!', message);
          default: {
            logger('error', 'club.js:2 () Check for the club', error);
            return botReply('❌ Error with the command, try again later.', message);
          }
        }
      });
  });

  function findTheClub(object, word) {
    return new Promise((resolve, reject) => {
      if (!word.match(/^[a-zA-Z0-9 ]+$/)) return reject('invalid_regex');
      if (word === 'henort') word = 'the  north';
      const regex = new RegExp(`(${word})`, 'gi');

      if (object.find(element => element.guildName?.toLowerCase() === word))
        return resolve(object.find(element => element.guildName?.toLowerCase() === word));

      for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          const element = object[key];

          if (element.guildName.match(regex)) {
            for (const iterator of config.certification.hiddenServers) {
              if (element.guildName === iterator.guildName) return reject('no_club');
            }
            return resolve(element);
          }
        }
      }
      reject('no_club');
    });
  }
};