const { bot, logger, botReply, getEmoji } = require("../teaBot");
const config = require('../bot-settings.json');

bot.on('messageReactionAdd', async (reaction, user) => {
    if (!(reaction.message.channel.id === config.channels.requestChannelID && reaction.emoji.name === '✅')) return; // return if incorrect channel or/and emoji name is not ✅
    const { message, emoji } = reaction;

    message.fetch() // fetch message data to get access to embeds[0]
        .then(async msg => {

            if (msg.embeds[0]?.footer?.text != 'TEA Clearance Request') return; // ignore if it's not a clearance request
            // check if club role exists
            const clubRole = msg.guild.roles.cache.find(r => r.name.toLowerCase() === msg.embeds[0].fields[1].value.toLowerCase());
            if (!clubRole) return botReply(`${user} **${msg.embeds[0].fields[1].value}** role not found on this server!`, msg);
            // check if tea member role exists

            const memberOfAlliance = msg.guild.roles.cache.get(config.roles.memberOfTheAllianceID);
            if (!memberOfAlliance) return botReply(`${user} **Member of the Alliance** role not found on this server!`, msg);

            // check if user that reacted has both key roles (Representative and clubRole from request)
            if (!(msg.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.roles.representativeID) && msg.guild.members.cache.get(user.id).roles.cache.some(role => role === clubRole))) return;

            //get requester object from an embed object: [0] - <@ID>, [1] - user tag, [2] - user id
            const requesterUser = msg.embeds[0].fields[3].value.split(' • ');

            // create variable with await
            const clubRoleAdded = await msg.guild.members.cache.get(requesterUser[2]).roles.add(clubRole).catch(error => logger('error', `clearance-reaction.js:1 Error to assign '${clubRole.name}' role to the user ${requesterUser[1]} by the '${user.tag}'.`, error));
            const memberRoleAdded = await msg.guild.members.cache.get(requesterUser[2]).roles.add(memberOfAlliance).catch(error => logger('error', `clearance-reaction.js:2 Error to assign '${memberOfAlliance.name}' role to the user '${requesterUser[1]}' by the '${user.tag}'.`, error));

            // check if both roles are assigned to the user
            if (clubRoleAdded && memberRoleAdded) {
                logger('log', `clearance-reaction.js:3 Assigned '${clubRole.name}' and '${memberOfAlliance.name}' role to the user '${requesterUser[1]}' by the '${user.tag}' with ${emoji.name} reaction.`);
                botReply(`> ${user} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Role **${clubRole.name}** has been added to the **${requesterUser[1]}** successfully!`, msg, 15000);
            } else return botReply(`> ${user} ❌ Error to add **${clubRole.name}** or/and **${memberOfAlliance.name}** role to the \`${requesterUser[1]}\`!\nAttention required <@&${config.roles.discordTechnicianID}>`, msg);

        }).catch(error => {
            botReply(`> ${user} ❌ Error to fetch the message, try again later.`, message, 10000);
            logger('error', `clearance-reaction.js:5 Error to fetch the message by the (${user.tag}) with ✅ reaction.`, error)
        });

});