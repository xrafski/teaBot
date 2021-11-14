const { getEmoji } = require('../../Utilities/functions');
const logger = require('../../Utilities/logger');

// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageCreate
module.exports = {
    name: 'messageCreate', // Emitted whenever a message is created.
    once: false,

    async execute(client, message) {

        // Object Destructuring
        const { content, author, channel, embeds, url } = message;

        // ✅ NOTIFICATION HANDLER ✅
        // Check if message is in the correct channel and contains an embed with a specific footer text.
        if (channel.id === client.config.TEAserver.entryChannelID && embeds[0]?.footer?.text.startsWith('• Trove Ethics Alliance')) {

            // Assing notification channel object as a variable.
            const notificationChannel = client.guilds.cache.get(client.config.TEAserver.id)?.channels.cache.get(client.config.roles.clearanceNotificationRoleID);

            // Check if notification channel exists.
            if (!notificationChannel) return logger.log('Event/Client/messageCreate.js (1) Error to find entry notification channel', 'Notification Handler');

            // If clearance request.
            if (embeds[0].footer.text.includes('Clearance')) {

                // Assing a role object to a variable.
                const clearanceNotifRole = client.guilds.cache.get(client.config.TEAserver.id).roles.cache.get(client.config.roles.clearanceNotificationRoleID);

                // Make code easier to read
                const embedUserArr = embeds[0].fields[4].value.split(' • ');

                // Send the clearance notification message to the notification channel.
                return notificationChannel.send({
                    content: `${getEmoji(client.config.TEAserver.id, 'notification')} ${clearanceNotifRole ? clearanceNotifRole : 'Clearance notification role is not found!'}\n> ${embedUserArr[0]} (${embedUserArr[1]}) has sent a __clearance__ request to the **${embeds[0].fields[1].value}** club!`,
                    allowedMentions: { parse: ['roles'] },
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    style: 5,
                                    label: 'Click to check out the request.',
                                    url,
                                    disabled: false,
                                    type: 2
                                }
                            ]
                        }
                    ]
                })
                    .catch(err => logger.log('Event/Client/messageCreate.js (2) Error to send clearance notification message', err)); // Catch clearance notification message error.
            }

            // If registry request.
            if (embeds[0].footer.text.includes('Registry')) {
                // Return a logger message when there is not registry notification role found.
                const registryNotifRole = client.guilds.cache.get(client.config.TEAserver.id).roles.cache.get(client.config.roles.registryNotificationRoleID);

                // Make code easier to read
                const embedUserArr = embeds[0].fields[7].value.split(' • ');

                // Send the club registry notification message to the notification channel.
                return notificationChannel.send({
                    content: `${getEmoji(client.config.TEAserver.id, 'notification')} ${registryNotifRole ? registryNotifRole : 'Registry notification role is not found!'}\n> ${embedUserArr[0]} (${embedUserArr[1]}) has sent a __club registry__ request for the **${embeds[0].fields[0].value}** club!`,
                    allowedMentions: { parse: ['roles'] },
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    style: 5,
                                    label: 'Click to check out the request.',
                                    url,
                                    disabled: false,
                                    type: 2
                                }
                            ]
                        }
                    ]
                })
                    .catch(err => logger.log('Event/Client/messageCreate.js (3) Error to send club registry notification message', err)); // Catch club registry notification message error.
            }
        }


        // ✅ REGULAR COMMAND HANDLER ✅
        // Block all bot message and messages that do not start with a prefix.
        if (author.bot || !content.toLowerCase().startsWith(client.config.bot.prefix)) return;

        // Object Destructuring
        const [cmd, ...args] = content
            .slice(client.config.bot.prefix.length) // Sli9ce prefix from the message content.
            .trim() // Trim whitespace from the remaining content.
            .split(/ +/g); // Split remaining content into an array separated by a space to create command arguments.

        // Set command variable and find command by its name or prefix.
        const command = client.classicCommands.get(cmd.toLowerCase()) || client.classicCommands.find(cc => cc.aliases?.includes(cmd.toLowerCase()));

        // Check if command exists.
        if (command) {

            // Run the command.
            return await command.run(client, message, args);
        } else {

            // Return - do nothing
            return;
        }
    }
};