const { bot, logger, botReply, getEmoji, convertMsToTime } = require("../teaBot");
const config = require('../bot-settings.json');

bot.on('messageReactionAdd', async (reaction, user) => {
    if (!(reaction.message.channel.id === config.channels.requestChannelID && reaction.emoji.name === '✅')) return; // Return if incorrect channel or/and emoji name is not ✅
    const { message } = reaction;

    message.fetch() // Fetch message data to get access to embeds[0]
        .then(async msg => {
            if (msg.embeds[0]?.footer?.text != 'TEA Clearance Request') return; // Ignore if it's not a clearance request

            // Check if 24hrs passed
            if (Date.now() < Math.round(message.createdTimestamp + (3600000))) {
                reaction.users.remove(user.id).catch(err => logger('warn', `clearance-reaction.js:1 warn to remove a reaction under the clearance request.`, err));
                return botReply(`> ${user} it's too early to use this reaction yet. Please wait **${convertMsToTime(Math.round(message.createdTimestamp + (3600000 * 24) - Date.now()))}** to try again.`, message, 15000);
            }

            // Check if club role exists
            const clubRole = msg.guild.roles.cache.find(r => r.name.toLowerCase() === msg.embeds[0].fields[1].value.toLowerCase());
            if (!clubRole) return botReply(`${user} **${msg.embeds[0].fields[1].value}** role not found on this server!`, msg);

            // Check if tea member role exists
            const memberOfAlliance = msg.guild.roles.cache.get(config.roles.memberOfTheAllianceID);
            if (!memberOfAlliance) return botReply(`${user} **Member of the Alliance** role not found on this server!`, msg);

            // Check if guest role exists
            const guestRole = msg.guild.roles.cache.get(config.roles.guestID);
            if (!guestRole) return botReply(`${user} **Guest** role not found on this server!`, msg);

            // Check if user that reacted has both key roles (Representative and clubRole from request)
            if (!(msg.guild.members.cache.get(user.id).roles.cache.some(role => role.id === config.roles.representativeID) && msg.guild.members.cache.get(user.id).roles.cache.some(role => role === clubRole))) return;

            // Get requester object from an embed object: [0] - <@ID>, [1] - user tag, [2] - user id
            const requesterUser = msg.embeds[0].fields[3].value.split(' • ');

            // Create variable with await
            const rolesAdded = await msg.guild.members.cache.get(requesterUser[2]).roles.add([clubRole, memberOfAlliance]).catch(error => logger('error', `clearance-reaction.js:2 Error to assign '${clubRole.name}' and '${memberOfAlliance.name}' role to the user ${requesterUser[1]} by the '${user.tag}'.`, error));
            const guestRoleRemoved = await msg.guild.members.cache.get(requesterUser[2]).roles.remove(guestRole).catch(error => logger('error', `clearance-reaction.js:3 Error to remove '${guestRole.name}' role to the user '${requesterUser[1]}' by the '${user.tag}'.`, error));

            // Check if both roles are assigned to the user
            if (rolesAdded && guestRoleRemoved) {
                logger('log', `clearance-reaction.js:4 Assigned '${clubRole.name}'/'${memberOfAlliance.name}' and removed '${guestRole.name}' role on the user '${requesterUser[1]}' by the '${user.tag}'.`);
                botReply(`> ${user} ${getEmoji(config.botDetails.TEAserverID, 'TEA')} Role **${clubRole.name}** has been added to the **${requesterUser[1]}** successfully!`, msg, 15000);
            }
            else if (!rolesAdded && !guestRoleRemoved) return botReply(`> ${user} ❌ Error to assign or remove roles (**${clubRole.name}**, **${memberOfAlliance.name}** and **${guestRole.name}**) to the \`${requesterUser[1]}\`!\nAttention required <@&${config.roles.discordTechnicianID}>`, msg);
            else if (!rolesAdded) return botReply(`> ${user} ❌ Error to add **${clubRole.name}** and **${memberOfAlliance.name}** role to the \`${requesterUser[1]}\`!\nAttention required <@&${config.roles.discordTechnicianID}>`, msg);
            else if (!guestRoleRemoved) return botReply(`> ${user} ❌ Error to remove **${guestRole.name}** from the \`${requesterUser[1]}\`!\nAttention required <@&${config.roles.discordTechnicianID}>`, msg);

        }).catch(error => {
            botReply(`> ${user} ❌ Error to fetch the message, try again later.`, message, 10000);
            logger('error', `clearance-reaction.js:5 Error to fetch the message by the (${user.tag}) with ✅ reaction.`, error);
        });

});