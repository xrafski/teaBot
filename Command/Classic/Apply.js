const { Permissions, MessageEmbed } = require('discord.js');
const { apiCall, getEmote } = require('../../Utilities/functions');
const moment = require('moment');
const logger = require('../../Utilities/logger');
const links = require('../../Utilities/settings/links.json');

module.exports = {
    name: 'apply', // Command name.
    aliases: [], // Command aliases.
    description: 'Club registry to Trove Ethics Alliance', // Command description.
    enabled: true, // Whether to enable this command.

    run: async (client, message) => {
        logger.command(`${__filename.replace(/\\/g, '/').split('/').slice(-3).join('/')} used by '${message.author.tag}' in the '${message.guild.name}' guild.`); // Log who used the command.

        let varClubNameStr; // Club Name ✅
        let varClubLevelStr; // Level ✅
        let varClubJoinworldStr; // Joinworld command ✅
        let varClubDescriptionStr; // Description ✅
        let varClubRequirementStr; // Requirements ✅
        let varClubRepresentativeStr; // Representative ✅
        let varDiscordInviteStr; // Discord invite code ✅
        let varRequestUserObj; // Person who used this command ✅
        let varDiscordCountInt; // Server member count ✅

        // Set variable with time to answer each question.
        const questionResponseTime = 1000 * 60 * 5; // 5 minutes.

        // Allow to answer question only from command user.
        const filter = msg => msg.author.id === message.author.id;

        // Deconstruct object.
        const { guild, member, author } = message;

        // Check if command used in TEA main server.
        if (client.guilds.cache.get(client.config.TEAserver.id) === guild) {

            // Return a message saying that command is not available in main server.
            return message.reply({
                content: `> ${getEmote('locked')} ${author}, you can't use this here.\n> Please, invite our ${getEmote('TEA')} bot to your server and to use this command over there.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                style: 5,
                                label: 'Click here to invite TEA Bot!',
                                url: links.teaBotInvite,
                                disabled: false,
                                type: 2
                            }
                        ]
                    }
                ]
            })
                .catch(err => logger.log('Command/Classic/Apply.js (1) Error to send message reply', err)); // Catch message reply error.
        }

        // Check if used is allowed to use this command (SERVER ADMIN).
        if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return message.reply({ content: `> ${getEmote('locked')} ${author}, this command is available only for server admins!` })
                .catch(err => logger.log('Command/Classic/Apply.js (2) Error to send message reply', err));
        }

        // Check if guild has meet minimal member count requirements to join TEA.
        if (guild.memberCount < 5) {

            // Send a reply message about the minimal member requirement.
            return message.reply({ content: `> ${getEmote('locked')} Unfortunately ${author}, this server doesn't meet our minimal requirements (${guild.memberCount}/**5** members), try again later.` })
                .catch(err => logger.log('Command/Classic/Apply.js (3) Error to send message reply', err)); // Catch message reply error.
        }

        // Check if guild is already certified via API.
        apiCall('GET', `certificate/${guild.id}`, null, (err, guildCert) => {
            if (err) {
                logger.log('Command/Classic/Apply.js (4) Error to get API response', err); // Log API error.

                // Send message to front end about the error.
                return message.reply({ content: `${getEmote('error')} Failed to receive data from API.\n> Try again later ;(` })
                    .catch(err => logger.log('Command/Classic/Apply.js (5) Error to send message reply', err)); // Catch message reply error.
            }

            // Check if guildCert exists and return a message if it does.
            if (guildCert) {

                // Send a reply message about guild certificate.
                return message.reply({ content: `> ${author} **${guild.name}** is already **certified** as a member of **Trove Ethics Alliance**.\n> ${getEmote('verified')} You can check certificate with \`/certificate\` command.` })
                    .catch(err => logger.log('Command/Classic/Apply.js (6) Error to send message reply', err)); // Catch message reply error.
            }
            // Else if guild is not certified.
            else {
                // Assign amount of guild members, author to variable and run question chain.
                varDiscordCountInt = guild.memberCount;
                varRequestUserObj = author;
                return clubNameQuestion();
            }
        });

        function clubNameQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please enter club name.\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Apply.js (7) Error to send message reply', err));
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
                            .catch(err => logger.log('Command/Classic/Apply.js (8) Error to send message reply', err));
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 3) {
                        return clubNameQuestion('Club name is too short [3 characters].');
                    }

                    // Check if answer is not longer than 20 characters.
                    if (userAnswer.length > 20) {
                        return clubNameQuestion('Club name is too long [20 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varClubNameStr = userAnswer;
                    return clubLevelQuestion();
                })
                .catch(err => logger.log('Command/Classic/Apply.js (9) Error to send message reply', err)); // Catch message reply error.
        }

        function clubLevelQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please enter club level.\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Apply.js (10) Error to send message reply', err));
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
                            .catch(err => logger.log('Command/Classic/Apply.js (11) Error to send message reply', err));
                    }

                    // Check if answer is a valid number.
                    if (isNaN(userAnswer)) {
                        return clubLevelQuestion('Invalid number, enter a number between 1 and 11');
                    }

                    // Check if answer is below 1.
                    if (Number(userAnswer) < 1) {
                        return clubLevelQuestion('Club level is too low.');
                    }

                    // Check if answer above 11.
                    if (Number(userAnswer) > 11) {
                        return clubLevelQuestion('Club level is too high.');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varClubLevelStr = userAnswer;
                    return clubJoinworldCommand();
                })
                .catch(err => logger.log('Command/Classic/Apply.js (12) Error to send message reply', err)); // Catch message reply error.
        }

        function clubJoinworldCommand(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please, type ${varClubNameStr} in-gane joinworld command.\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Apply.js (13) Error to send message reply', err));
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
                            .catch(err => logger.log('Command/Classic/Apply.js (14) Error to send message reply', err));
                    }

                    // Check if answer starts with '/joinworld' word.
                    if (userAnswer.toLowerCase().startsWith('/joinworld')) {
                        return clubJoinworldCommand('Answer can\'t include \'/joinworld\' keyword.');
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 3) {
                        return clubJoinworldCommand('Answer is too short [3 characters].');
                    }

                    // Check if answer is not longer than 40 characters.
                    if (userAnswer.length > 30) {
                        return clubJoinworldCommand('Answer is too long [30 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varClubJoinworldStr = userAnswer;
                    return clubDescriptionQuestion();
                })
                .catch(err => logger.log('Command/Classic/Apply.js (15) Error to send message reply', err)); // Catch message reply error.
        }

        function clubDescriptionQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please, type ${varClubNameStr} description.\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Apply.js (16) Error to send message reply', err));
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
                            .catch(err => logger.log('Command/Classic/Apply.js (17) Error to send message reply', err));
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 10) {
                        return clubDescriptionQuestion('Description is too short [10 characters].');
                    }

                    // Check if answer is not longer than 1000 characters.
                    if (userAnswer.length > 1000) {
                        return clubDescriptionQuestion('Description is too long [1000 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varClubDescriptionStr = userAnswer;
                    return clubRequirementsQuestion();
                })
                .catch(err => logger.log('Command/Classic/Apply.js (18) Error to send message reply', err)); // Catch message reply error.
        }

        function clubRequirementsQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please, type ${varClubNameStr} requirements.\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Apply.js (19) Error to send message reply', err));
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
                            .catch(err => logger.log('Command/Classic/Apply.js (20) Error to send message reply', err));
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 3) {
                        return clubRequirementsQuestion('Requirements are too short [3 characters].');
                    }

                    // Check if answer is not longer than 50 characters.
                    if (userAnswer.length > 50) {
                        return clubRequirementsQuestion('Requirements are too long [50 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varClubRequirementStr = userAnswer;
                    return clubRepresentativeQuestion();
                })
                .catch(err => logger.log('Command/Classic/Apply.js (21) Error to send message reply', err)); // Catch message reply error.
        }

        function clubRepresentativeQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please, type ${varClubNameStr} representative (discord#tag, Discord User ID, Trove Nickname etc.).\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Apply.js (22) Error to send message reply', err));
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
                            .catch(err => logger.log('Command/Classic/Apply.js (23) Error to send message reply', err));
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 3) {
                        return clubRepresentativeQuestion('Representative is too short [3 characters].');
                    }

                    // Check if answer is not longer than 70 characters.
                    if (userAnswer.length > 70) {
                        return clubRepresentativeQuestion('Representative is too long [70 characters].');
                    }

                    // Assing variable to user answer and run another question if all statements passed.
                    varClubRepresentativeStr = userAnswer;
                    return clubDiscordQuestion();
                })
                .catch(err => logger.log('Command/Classic/Apply.js (24) Error to send message reply', err)); // Catch message reply error.
        }

        function clubDiscordQuestion(additionalText) {

            // Additional text to add for the question.
            additionalText = (additionalText ? `${getEmote('warn')} **${additionalText}**\n` : '');

            // Send a message with the question.
            message.reply({ content: `${additionalText}> ${author} you can type \`cancel\` to exit.\n\n**Club Information**\n\`\`\`Please, enter ${varClubNameStr} discord invite code without discord.gg link.\`\`\`` })
                .then(async qMsg => {

                    // Create await variable with awaitMessage collector for a single reply from command user author (filter) under a specified time (questionResponseTime).
                    const awaitMsgCollector = await qMsg.channel.awaitMessages({ filter, max: 1, time: questionResponseTime });

                    // If variable doesn't get answer.
                    if (awaitMsgCollector.size === 0) {
                        return message.reply({ content: `${author} ❌ There was no message within the time limit (${Math.round(questionResponseTime / 60000)}mins)! - Cancelled.` })
                            .catch(err => logger.log('Command/Classic/Apply.js (25) Error to send message reply', err));
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
                            .catch(err => logger.log('Command/Classic/Apply.js (26) Error to send message reply', err));
                    }

                    // Check if asnwer starts with URL
                    if (userAnswer.toLowerCase().startsWith('https://')) {
                        return clubDiscordQuestion('Type code without link.');
                    }

                    // Check if answer is at least 3 characters long.
                    if (userAnswer.length < 3) {
                        return clubDiscordQuestion('Invite code is too short [3 characters].');
                    }

                    // Check if answer is not longer than 40 characters.
                    if (userAnswer.length > 40) {
                        return clubDiscordQuestion('Invite code is too long [40 characters].');
                    }

                    // Assing variable to user answer and run confirmation prompt if all statements passed.
                    varDiscordInviteStr = userAnswer;
                    return ConfirmationPromt();
                })
                .catch(err => logger.log('Command/Classic/Apply.js (27) Error to send message reply', err)); // Catch message reply error.
        }

        async function ConfirmationPromt() {

            // Fetch a user information.
            const fetchedUser = await guild.members.fetch(varRequestUserObj.id)
                .catch(err => logger.log('Command/Classic/Apply.js (28) Error to fetch a user', err)); // Catch fetch member error.

            // Create embed message.
            const prompt_embed = new MessageEmbed()
                .setColor('#0095ff')
                .setFooter({ text: 'Click ✅ to confirm and send the form.' })
                .addFields(
                    { name: 'Club Name ▼', value: varClubNameStr, inline: false },
                    { name: 'Club Description ▼', value: varClubDescriptionStr, inline: false },
                    { name: 'Level ▼', value: varClubLevelStr, inline: false },
                    { name: 'Joinworld ▼', value: varClubJoinworldStr, inline: false },
                    { name: 'Requirements ▼', value: varClubRequirementStr, inline: false },
                    { name: 'Representative ▼', value: `\`${varClubRepresentativeStr}\``, inline: false },
                    { name: 'Discord Invite ▼', value: `<https://discord.gg/${varDiscordInviteStr}>`, inline: false },
                    { name: 'Requester ▼', value: `${fetchedUser} • ${fetchedUser?.user?.tag} • ${fetchedUser?.id}`, inline: false },
                );

            // Send a message to confirm action.
            return message.reply({ content: `> ${getEmote('info')} ${author}, are you **sure** to send this form?`, embeds: [prompt_embed] })
                .then(async promptQuestion => {

                    // Try to add reactions to the message.
                    try {
                        await promptQuestion.react('✅');
                        await promptQuestion.react('❌');
                    } catch (err) {
                        if (err.message === 'Unknown Message') return;
                        logger.log('Command/Classic/Apply.js (29) Error to add reaction to the message', err);
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
                            .catch(err => logger.log('Command/Classic/Apply.js (30) Error to send message reply', err));
                    }

                    // Assign first reaction as a variable.
                    const reaction = awaitReactCollector.first();

                    // Make a switch to handle different reactions.
                    switch (reaction.emoji.name) {
                        case '✅': return postRegistry();
                        case '❌': return message.reply({ content: `> As you wish ${author}, cancelled!` });
                        default: return;
                    }
                })
                .catch(err => logger.log('Command/Classic/Apply.js (31) Error to send message reply', err)); // Catch message reply error.
        }

        async function postRegistry() {

            // Find registry channel on the main TEA server.
            const entryChannel = await client.guilds.cache.get(client.config.TEAserver.id).channels.cache.get(client.config.TEAserver.entryChannelID);

            // Check if channel exists.
            if (!entryChannel) {
                logger.log('Command/Classic/Apply.js (32) Missing registry channel on TEA main server', '.');
                return message.reply({ content: `> ${getEmote('error')} ${author}, error to send club registry request, try again later ;(` })
                    .catch(err => logger.log('Command/Classic/Apply.js (33) Error to send message reply', err)); // Catch message reply error.
            }

            // Fetch the user information.
            const fetchedUser = await guild.members.fetch(varRequestUserObj.id)
                .catch(err => logger.log('Command/Classic/Apply.js (34) Error to fetch a user', err)); // Catch fetch member error.

            // Define the embed to be sent to the registry channel.
            const embed_registry = new MessageEmbed()
                .setColor('#0095ff')
                .setAuthor({ name: `Alliance registry: '${varClubNameStr}' ${varDiscordCountInt ? `(${varDiscordCountInt})` : ''}`, iconURL: links.icon })
                .setThumbnail(guild.iconURL({ dynamic: true, size: 4096, format: 'png' }))
                .addFields(
                    { name: 'Club Name ▼', value: varClubNameStr, inline: false },
                    { name: 'Description ▼', value: varClubDescriptionStr, inline: false },
                    { name: 'Level ▼', value: varClubLevelStr, inline: false },
                    { name: 'Joinworld ▼', value: varClubJoinworldStr, inline: false },
                    { name: 'Requirements ▼', value: varClubRequirementStr, inline: false },
                    { name: 'Representative ▼', value: `\`${varClubRepresentativeStr}\``, inline: false },
                    { name: 'Discord Invite ▼', value: `<https://discord.gg/${varDiscordInviteStr}>`, inline: false },
                    { name: 'Requester ▼', value: `${fetchedUser} • ${fetchedUser?.user?.tag} • ${fetchedUser?.id}`, inline: false },
                )
                .setFooter({ text: `• Trove Ethics Alliance Registry | ${moment(Date.now()).utc().format('Do MMM YYYY @ hh:mm A z')}`, iconURL: links.icon });

            // Send formatted message to the registry channel.
            entryChannel.send({ content: `\`${varClubNameStr}\``, embeds: [embed_registry] })
                .then(registryMsg => {
                    message.reply({
                        content: `> ${getEmote('accept')} ${author}, club registry request successfully sent!`,
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        style: 5,
                                        label: 'Click here to view registry message.',
                                        url: registryMsg.url,
                                        disabled: false,
                                        type: 2
                                    },
                                    {
                                        style: 5,
                                        label: 'Make sure you are a member of our server.',
                                        url: links.teaServerInvite,
                                        disabled: false,
                                        type: 2
                                    }
                                ]
                            }
                        ]
                    })
                        .catch(err => logger.log('Command/Classic/Apply.js (35) Error to send message reply', err)); // Catch message reply error.
                })
                .catch(err => {

                    // Log that event in console.
                    logger.log('Command/Classic/Apply.js (36) Error to send registry message', err);

                    // Send a reply message about failure.
                    message.reply(`> ${author} Error to send club registry request, try again later ;-(`, message)
                        .catch(err => logger.log('Command/Classic/Apply.js (37) Error to send message reply', err)); // Catch message reply error.
                });
        }
    }
};
