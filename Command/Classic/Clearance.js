const { MessageEmbed } = require('discord.js');
const { apiCall, getEmote } = require('../../Utilities/functions');
const moment = require('moment');
const logger = require('../../Utilities/logger');
const links = require('../../Utilities/settings/links.json');

module.exports = {
    name: 'clearance', // Command name.
    aliases: [], // Command aliases.
    description: 'Request access in the TEA server', // Command description.
    enabled: true, // Whether to enable this command.

    run: async (client, message) => {
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-3).join('/')} used by '${message.author.tag}' in the '${message.guild.name}' guild.`); // Log who used the command.

        let varNicknameStr; // Nickname ✅
        let varClubNameStr; // Club Name ✅
        let varClubRoleStr; // Role in the club ✅
        let varReasonStr; // Reason to join ✅
        let varRequestUserObj; // User object ✅

        // Set variable with time to answer each question.
        const questionResponseTime = 1000 * 60 * 5; // 5 minutes.

        // Allow to answer question only from command user.
        const filter = msg => msg.author.id === message.author.id;

        // Deconstruct object.
        const { guild, author } = message;

        // Check if command used in different server than a TEA main.
        if (client.guilds.cache.get(client.config.TEAserver.id) != guild) {

            // Return a message saying that command is not available in main server.
            return message.reply({
                content: `> ${getEmote('locked')} ${author}, you can't use this here.\n> Please, join our official server and use this command over there.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                style: 5,
                                label: 'Click here to join TEA',
                                url: links.teaServerInvite,
                                disabled: false,
                                type: 2
                            }
                        ]
                    }
                ]
            })
                .catch(err => logger.log('Command/Classic/Clearance.js (1) Error to send message reply', err)); // Catch message reply error.
        } else {

            // Run command chain if all above passed.
            return userNicknameQuestion();
        }

        function userNicknameQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`What's your Trove In-Game Username?\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (2) Error to send message reply', err));
                    }

                    // Assing variable to answer content.
                    const userAnswer = awaitMsgCollector.first().content;

                    // Check if answer executes a different command.
                    if (userAnswer.toLowerCase().startsWith(client.config.bot.prefix)) {
                        return;
                    }

                    // Check if asnwer is alphanumeric.
                    if (/^[a-z0-9_ ]+$/i.test(userAnswer) === false) {
                        return userNicknameQuestion('Only alphanumeric characters are allowed.');
                    }

                    // Check if user want to exit form.
                    if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') {
                        return message.reply({ content: `${author} ❌ Cancelled...` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (3) Error to send message reply', err));
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 3) {
                        return userNicknameQuestion('Nickname is too short [3 characters].');
                    }

                    // Check if answer is not longer than 20 characters.
                    if (userAnswer.length > 20) {
                        return userNicknameQuestion('Nickname is too long [20 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varNicknameStr = userAnswer;
                    return clubNameQuestion();
                })
                .catch(err => logger.log('Command/Classic/Clearance.js (4) Error to send message reply', err)); // Catch message reply error.
        }

        function clubNameQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`Please enter club name.\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (5) Error to send message reply', err));
                    }

                    // Assing variable to answer content.
                    const userAnswer = awaitMsgCollector.first().content;

                    // Check if answer executes a different command.
                    if (userAnswer.toLowerCase().startsWith(client.config.bot.prefix)) {
                        return;
                    }

                    // Check if asnwer is alphanumeric.
                    if (/^[a-z0-9_ ]+$/i.test(userAnswer) === false) {
                        return clubNameQuestion('Only alphanumeric characters are allowed.');
                    }

                    // Check if user want to exit form.
                    if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') {
                        return message.reply({ content: `${author} ❌ Cancelled...` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (6) Error to send message reply', err));
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 3) {
                        return clubNameQuestion('Club name is too short [3 characters].');
                    }

                    // Check if answer is not longer than 20 characters.
                    if (userAnswer.length > 20) {
                        return clubNameQuestion('Club name is too long [20 characters].');
                    }

                    // Run another question if all statements passed.
                    return checkClub(userAnswer);
                })
                .catch(err => logger.log('Command/Classic/Clearance.js (7) Error to send message reply', err)); // Catch message reply error.
        }

        /**
         * Check if provided guild name is part of TEA.
         * @param {String} guildName Club name
         */
        function checkClub(guildName) {

            // Check if guild is certified via API.
            apiCall('GET', `certificate/${guildName}`, null, (err, guildCert) => {
                if (err) {
                    logger.log('Command/Classic/Clearance.js (8) Error to get API response', err); // Log API error.

                    // Send message to front end about the error.
                    return message.reply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                        .catch(err => logger.log('Command/Classic/Clearance.js (9) Error to send message reply', err)); // Catch message reply error.
                }

                // Check if guildCert exists and return a message if it does.
                if (guildCert) {

                    // Assing variable to existing club name and run another question.
                    varClubNameStr = guildCert.club;
                    return userClubRoleQuestion();
                }
                // Else if guild is not certified.
                else {

                    // Send a reply message about missing guild certificate.
                    return message.reply({ content: `> ${getEmote('decline')} ${author} **${guildName}** is not part of **Trove Ethics Alliance** and you can't request access to this club.` })
                        .catch(err => logger.log('Command/Classic/Clearance.js (10) Error to send message reply', err)); // Catch message reply error.
                }

            });
        }

        function userClubRoleQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`What's your role in ${varClubNameStr}?\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (11) Error to send message reply', err));
                    }

                    // Assing variable to answer content.
                    const userAnswer = awaitMsgCollector.first().content;

                    // Check if answer executes a different command.
                    if (userAnswer.toLowerCase().startsWith(client.config.bot.prefix)) {
                        return;
                    }

                    // Check if asnwer is alphanumeric.
                    if (/^[a-z0-9_ ]+$/i.test(userAnswer) === false) {
                        return userClubRoleQuestion('Only alphanumeric characters are allowed.');
                    }

                    // Check if user want to exit form.
                    if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') {
                        return message.reply({ content: `${author} ❌ Cancelled...` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (12) Error to send message reply', err));
                    }

                    // Check if answer is at least 2 characters long.
                    if (userAnswer.length < 2) {
                        return userClubRoleQuestion('Club role name is too short [2 characters].');
                    }

                    // Check if answer is not longer than 30 characters.
                    if (userAnswer.length > 30) {
                        return userClubRoleQuestion('Club role name is too long [30 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varClubRoleStr = userAnswer;
                    return userJoinReasonQuestion();
                })
                .catch(err => logger.log('Command/Classic/Clearance.js (13) Error to send message reply', err)); // Catch message reply error.
        }

        function userJoinReasonQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Clearance Information**\n\`\`\`Reason for joining?\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (14) Error to send message reply', err));
                    }

                    // Assing variable to answer content.
                    const userAnswer = awaitMsgCollector.first().content;

                    // Check if answer executes a different command.
                    if (userAnswer.toLowerCase().startsWith(client.config.bot.prefix)) {
                        return;
                    }

                    // Check if user want to exit form.
                    if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') {
                        return message.reply({ content: `${author} ❌ Cancelled...` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (15) Error to send message reply', err));
                    }

                    // Check if answer is at least 5 characters long.
                    if (userAnswer.length < 5) {
                        return userJoinReasonQuestion('Reason is too short [5 characters].');
                    }

                    // Check if answer is not longer than 600 characters.
                    if (userAnswer.length > 600) {
                        return userJoinReasonQuestion('Reason is too long [600 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varReasonStr = userAnswer;
                    return ConfirmationPromt();
                })
                .catch(err => logger.log('Command/Classic/Clearance.js (16) Error to send message reply', err)); // Catch message reply error.
        }

        /**
         * Send a confirmation proms asking user to confirm or decline the form.
         * @returns Either response on decline or send a message to tea entry channel.
         */
        async function ConfirmationPromt() {

            // Fetch a user information.
            const fetchedUser = await guild.members.fetch(author.id)
                .catch(err => logger.log('Command/Classic/Clearance.js (17) Error to fetch a user', err)); // Catch fetch member error.

            if (!fetchedUser) {
                return message.reply({ content: `${author} ❌ Error to fetch a user. Please try again later ;(` })
                    .catch(err => logger.log('Command/Classic/Clearance.js (18) Error to send message reply', err)); // Catch message reply error.
            }

            // Assign fetched used to variable
            varRequestUserObj = fetchedUser.user;

            // Create embed message.
            const prompt_embed = new MessageEmbed()
                .setColor('#0095ff')
                .setFooter('Click ✅ to confirm and send the form.')
                .addFields(
                    { name: 'Username ▼', value: `\`${varNicknameStr}\``, inline: false },
                    { name: 'Club Name ▼', value: varClubNameStr, inline: true },
                    { name: 'Role ▼', value: varClubRoleStr, inline: false },
                    { name: 'Reason ▼', value: varReasonStr, inline: false },
                    { name: 'Requester ▼', value: `${varRequestUserObj} • ${varRequestUserObj.tag} • ${varRequestUserObj.id}`, inline: false },
                );

            // Send a message to confirm action.
            return message.reply({ content: `> ${author} Are you **sure** to send this form?`, embeds: [prompt_embed] })
                .then(async promptQuestion => {

                    // Try to add reactions to the message.
                    try {
                        await promptQuestion.react('✅');
                        await promptQuestion.react('❌');
                    } catch (err) {
                        if (err.message === 'Unknown Message') return;
                        logger.log('Command/Classic/Clearance.js (19) Error to add reaction to the message', err);
                    }

                    // Accept interaction only from command author.
                    const emojiFilter = (reaction, user) => {
                        return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && author === user;
                    };

                    // Create await variable with awaitReactions collector for a single reaction from command user author (filter) under a specified time (questionResponseTime).
                    const awaitReactCollector = await promptQuestion.awaitReactions({ filter: emojiFilter, max: 1, time: questionResponseTime });

                    // If MessageCollector doesn't get answer.
                    if (awaitReactCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no reaction within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Clearance.js (20) Error to send message reply', err));
                    }

                    // Assign first reaction as a variable.
                    const reaction = awaitReactCollector.first();

                    // Make a switch to handle different reactions.
                    switch (reaction.emoji.name) {
                        case '✅': return postClearance();
                        case '❌': return message.reply({ content: `> As you wish ${author}, cancelled!` });
                        default: return;
                    }
                })
                .catch(err => logger.log('Command/Classic/Clearance.js (21) Error to send message reply', err)); // Catch message reply error.
        }

        /**
         * Function to post clearance request to the tea entry channel.
         * @returns A message confirmation message about the request sent in in the tea entry channel.
         */
        async function postClearance() {

            // Find registry channel on the main TEA server.
            const entryChannel = await client.guilds.cache.get(client.config.TEAserver.id).channels.cache.get(client.config.TEAserver.entryChannelID);

            // Check if channel exists.
            if (!entryChannel) {
                logger.log('Command/Classic/Clearance.js (22) Missing registry channel on TEA main server', '.');
                return message.reply({ content: `> ${getEmote('error')} ${author}, error to send club registry request, try again later ;(` })
                    .catch(err => logger.log('Command/Classic/Clearance.js (23) Error to send message reply', err)); // Catch message reply error.
            }

            // Define the embed to be sent to the registry channel.
            const embed_registry = new MessageEmbed()
                .setColor('ORANGE')
                .setAuthor(`Clearance request to '${varClubNameStr}' club.`, links.icon)
                .setThumbnail(varRequestUserObj.displayAvatarURL({ dynamic: true, size: 4096, format: 'png' }))
                .addFields(
                    { name: 'Username ▼', value: `\`${varNicknameStr}\``, inline: false },
                    { name: 'Club Name ▼', value: varClubNameStr, inline: true },
                    { name: 'Role ▼', value: varClubRoleStr, inline: false },
                    { name: 'Reason ▼', value: varReasonStr, inline: false },
                    { name: 'Requester ▼', value: `${varRequestUserObj} • ${varRequestUserObj.tag} • ${varRequestUserObj.id}`, inline: false },
                )
                .setFooter(`• Trove Ethics Alliance Clearance | ${moment(Date.now()).utc().format('Do MMM YYYY @ hh:mm A z')}`, links.icon);

            // Send formatted message to the registry channel.
            entryChannel.send({ content: `\`${varNicknameStr}\``, embeds: [embed_registry] })
                .then(registryMsg => {
                    message.reply({
                        content: `> ${getEmote('accept')} ${author}, club clearance request successfully sent!`,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        style: 5,
                                        label: 'Click here to view clearance request.',
                                        url: registryMsg.url,
                                        disabled: false,
                                        type: 2
                                    }
                                ]
                            }
                        ]
                    })
                        .catch(err => logger.log('Command/Classic/Clearance.js (24) Error to send message reply', err)); // Catch message reply error.
                })
                .catch(err => {

                    // Log that event in console.
                    logger.log('Command/Classic/Clearance.js (25) Error to send registry message', err);

                    // Send a reply message about failure.
                    message.reply(`> ${author} Error to send club registry request, try again later ;-(`, message)
                        .catch(err => logger.log('Command/Classic/Clearance.js (26) Error to send message reply', err)); // Catch message reply error.
                });
        }
    }
};
