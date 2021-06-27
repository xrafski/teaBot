const { botReply, logger, embedMessage } = require('../teaBot');
const config = require("../bot-settings.json");
const { updateEventStatus, checkEventCache, blockEventWhileProcessing } = require("../cache/tea-event-cache");
const { MongoClient } = require("../functions/mongodb-connection");
const { eventPriorityPrizeModel } = require("../schema/event-priority-prizes");
const { eventCodeModel } = require('../schema/event-codes');
const { eventSettingsModel } = require('../schema/event-settings');

module.exports.help = {
    name: "code",
    description: "Manage codes for event system.",
    type: "eventmanager",
    usage: `ℹ️ Format: multiple formats (check examples below)\nℹ️ Example(s):\n**${config.botDetails.prefix}code status** - check event status\n**${config.botDetails.prefix}code enable** - enable event system\n**${config.botDetails.prefix}code disable** - disable event system\n**${config.botDetails.prefix}code add** - interactive menu to add codes/prizes\n**${config.botDetails.prefix}code del** - remove codes/prizes\n**${config.botDetails.prefix}code unlock** - in case of a bug, manual command to unlock ${config.botDetails.prefix}event command`
};

module.exports.run = async (bot, message, args) => {
    const [codeModule, raffleModule, raffleDate] = args;
    const { author } = message;
    let menuTypeG; // store a string information about (code/prize) toLowerCase().
    let codeTypeG; // store a string information about code type (fixed/priority) toLowerCase().

    let menuCodeStrG; // store a string information about code name(ID).
    let menuPrizeNameG; // store a string information about prize name.
    let menuCodeHintG; // store a string information about hint message for the code.

    let menuPrizePriorityG; // store a string information about (high/low) toLowerCase().
    let menuGroupNameG; // store a string information about code group name aka club discord server id or 'global'.

    let menuClubIdentificatorG; // store a string information about club name for code indentification.

    switch (codeModule?.toLowerCase()) {
        case 'status': return botReply(`> ${author}\nEvent status: ${(checkEventCache('eventstatus') === true ? `**Enabled**` : `**Disabled**`)}\nEvent command processing status: ${(checkEventCache('blockevent') === true ? `**Enabled**` : `**Disabled**`)}`, message);
        case 'enable': {
            if (raffleModule?.toLowerCase() === 'raffle') {
                if (!raffleDate) return botReply(`> ${author} Missing day argument.\n> For example **${config.botDetails.prefix}code enable raffle 7** to pick winners and finish the event next week (at 8 PM CEST).`, message); // When user didn't specify the date.

                return updateRaffleData(raffleDate); // Update raffle data to user input.
            } else return updateEventValue(true); // Enable event command.
        }
        case 'disable': {
            if (raffleModule?.toLowerCase() === 'raffle') return updateRaffleData(`0`); // Change raffle date to zeros
            else return updateEventValue(false); // Disable event command.
        }

        case 'unlock': { // Unlock event processing.
            blockEventWhileProcessing(false);
            return botReply(`> ${author} Unlocked **${config.botDetails.prefix}event** command.`, message);
        }

        case 'add': return requestTypeQ();
        case 'del': return requestTypeQ(null, true);

        default: {
            if (config.botDetails.debugTest) console.log({ message: 'code.js eventCodeCache Object', eventStatus: checkEventCache('eventstatus'), blockEventCommand: checkEventCache('blockevent') });
            return botReply(`> ${author} Wrong command format, type **${config.botDetails.prefix}help ${module.exports.help.name}** to see usage and examples!`, message);
        }
    }


    function requestTypeQ(additionalText, deleteReq) { // Define if query is a code or a prize for priority code.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Please, select your request type:\n• code\n• prize`, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (!(userAnswer.toLowerCase() === 'code' || userAnswer.toLowerCase() === 'prize')) return requestTypeQ(`❌ Incorrect answer, only (code/prize) is available.`, deleteReq ? deleteReq : null); // Check if correct type is typed.
                            else {
                                menuTypeG = userAnswer.toLowerCase();
                                if (deleteReq) return deleteDocQ();
                                if (menuTypeG === 'prize') return prizeNameQ();
                                if (menuTypeG === 'code') return codeNameQ();
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 requestTypeQ() Error`, error);
            });
    }

    function prizeNameQ(additionalText) { // Define a name for a prize item.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Enter a prize name.`, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (userAnswer.length > 50 || userAnswer.length < 3) return prizeNameQ(`❌ Prize name is either too long or too short [3-50].`); // Check answer is not too short nor too long.
                            else {
                                menuPrizeNameG = userAnswer;
                                if (menuTypeG === 'prize') return prizeTypeQ();
                                if (menuTypeG === 'code') return addEventDocument();
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 prizeNameQ() Error`, error);
            });
    }

    function prizeTypeQ(additionalText) { // Define if prize is high or low priority.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Please, select prize prioirty:\n• high\n• low`, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (!(userAnswer.toLowerCase() === 'high' || userAnswer.toLowerCase() === 'low')) return prizeTypeQ(`❌ Incorrect answer, only (high/low) is available.`); // Check if correct type is typed.
                            else {
                                menuPrizePriorityG = userAnswer.toLowerCase();
                                return addEventDocument(); // Run a function to add a new prize document to the MongoDB.
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 prizeTypeQ() Error`, error);
            });
    }

    function codeNameQ(additionalText) { // Define a name for a code prize.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} type the custom code for people to use.\n> Use '**random**' to generate code with the following format: teaXXXXXX`, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (!userAnswer.match(/^[a-z0-9]{3,30}$/)) return codeNameQ(`❌ Invalid code format. [single word][lower case alphanumeric][3-30 characters long].`); // Check if code format is correct.
                            else if (userAnswer.toLowerCase() === 'random') {
                                const RandomInt = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
                                menuCodeStrG = `tea${RandomInt}`;
                                return codeHintQ(`✅ Generated code: **tea${RandomInt}**`);
                            }
                            else {
                                menuCodeStrG = userAnswer;
                                return codeHintQ();
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeNameQ() Error`, error);
            });
    }

    function codeHintQ(additionalText) { // Define a name for a prize item.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Enter hint message. Type '**skip**' to create a code without it\n> Examples: \`<https://skillez.eu/> | /joinworld RNG\` or \`<https://link.to.image>\``, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (userAnswer.length > 150 || userAnswer.length < 3) return codeHintQ(`❌ Hint is either too short or too long. [3-150].`); // Check if correct type is typed.
                            else if (userAnswer.toLowerCase() === 'skip') return codeGroupQ();
                            else {
                                menuCodeHintG = userAnswer;
                                return codeGroupQ();
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeHintQ() Error`, error);
            });
    }

    function codeGroupQ(additionalText) { // Define a raffle code group name.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Please, type **discord server ID** for a specific server only code, otherwise use '**global**' for a global code.`, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (userAnswer.length > 25 || userAnswer.length < 3) return codeGroupQ(`❌ Group name is either too short or too long. [3-25].`); // Check if group not too short nor too long.
                            else if (userAnswer.toLowerCase() === 'global') { // Check if answer is 'global'
                                menuGroupNameG = userAnswer;
                                return requestCodeTypeQ();
                            } else if (isNaN(userAnswer) === true) return codeGroupQ(`❌ Incorrect answer. Only numbers (serverID) or 'global' for global code.`);
                            else {
                                const serverExist = bot.guilds.cache.get(userAnswer);
                                if (serverExist) { // Check if server is detected by its ID.
                                    menuGroupNameG = userAnswer;
                                    return requestCodeTypeQ();
                                } else return codeGroupQ(`❌ Incorrect serverID. Seems like the bot is not a member of this server.`);
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeGroupQ() Error`, error);
            });
    }

    function requestCodeTypeQ(additionalText) { // Define if code is fixed or priority.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Please, select code type:\n• fixed\n• priority\n• raffle`, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (!(userAnswer.toLowerCase() === 'fixed' || userAnswer.toLowerCase() === 'priority' || userAnswer.toLowerCase() === 'raffle')) return requestCodeTypeQ(`❌ Incorrect answer, only (fixed/priority/raffle) is available.`); // Check if correct type is typed.
                            else {
                                codeTypeG = userAnswer.toLowerCase();
                                if (userAnswer.toLowerCase() === 'fixed') return prizeNameQ();
                                if (userAnswer.toLowerCase() === 'priority') return addEventDocument();
                                if (userAnswer.toLowerCase() === 'raffle') return codeRaffleClubQ();
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 requestCodeTypeQ() Error`, error);
            });
    }

    function codeRaffleClubQ(additionalText) { // Define a name for a prize item.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Enter a club name to indentificate the code. **Make sure to not mistype the name.**`, message) // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (userAnswer.length > 50 || userAnswer.length < 3) return codeRaffleClubQ(`❌ Club name is either too long or too short [3-50].`); // Check answer is not too short nor too long.
                            else {
                                menuClubIdentificatorG = userAnswer;
                                return addEventDocument();
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeRaffleClubQ() Error`, error);
            });
    }

    function deleteDocQ(additionalText) { // Define a function to remove prize/code from collection.
        return botReply(`${additionalText ? `__${additionalText}__ You can type **exit** to cancel.\n` : ``}> ${author} Enter ${menuTypeG === 'code' ? `a document ID field from the 'event-codes' collection (teaXXXXXX)` : `a document name field from the 'event-priority-prizes' collection (case sensitive)`}.`, message, null, null, 'https://i.imgur.com/Bza12YZ.gif') // Send a question to the user.
            .then(Question => {
                if (Question) { // Check if the bot sent question to the user, if so, collect next reply from the author.
                    message.channel.awaitMessages(m => m.author.id === author.id, { max: 1, time: 60000 }) // Create a awaitMessage.
                        .then(async Answer => {
                            const userAnswer = Answer.first().content;
                            if (userAnswer.startsWith(config.botDetails.prefix)) return; // Exit if other command was typed
                            else if (userAnswer.toLowerCase() === 'exit' || userAnswer.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message); // Exit on user (exit/cancel) request. 
                            else if (userAnswer.length > 50 || userAnswer.length < 3) return deleteDocQ(`❌ Your request is either too long or too short [3-50].`); // Check if correct type is typed.
                            else {

                                await MongoClient().then(async () => { // Connect to the MongoDB server.

                                    if (menuTypeG === 'code') {
                                        await eventCodeModel.findOneAndDelete({ id: userAnswer.toLowerCase() })
                                            .then(docRemoved => {
                                                if (docRemoved) {
                                                    logger('debug', `code.js:1 deleteDocQ() Deleted '${docRemoved.id}' document from the '${eventCodeModel.collection.name}' collection successfully.`);
                                                    botReply(`> ${author} Deleted **${docRemoved.id}** code document from the **${eventCodeModel.collection.name}** collection successfully!`, message);
                                                } else botReply(`> ${author} Document **${userAnswer}** is not found.`, message);
                                            })
                                            .catch(err => { // Error handler for MongoDB query.
                                                botReply(`> ${author} MongoDB query error, try again later!`, message);
                                                logger('error', `code.js:2 deleteDocQ() MongoDB create query failed.`, err);
                                            });
                                    }

                                    if (menuTypeG === 'prize') {
                                        await eventPriorityPrizeModel.findOneAndDelete({ name: userAnswer })
                                            .then(docRemoved => {
                                                if (docRemoved) {
                                                    logger('debug', `code.js:3 deleteDocQ() Deleted '${docRemoved.name}' document from the '${eventPriorityPrizeModel.collection.name}' collection successfully.`);
                                                    botReply(`> ${author} Deleted **${docRemoved.name}** prize document from the **${eventPriorityPrizeModel.collection.name}** collection successfully!`, message);
                                                } else botReply(`> ${author} Document **${userAnswer}** is not found.`, message);
                                            })
                                            .catch(err => { // Error handler for MongoDB query.
                                                botReply(`> ${author} MongoDB query error, try again later!`, message);
                                                logger('error', `code.js:4 deleteDocQ() MongoDB create query failed.`, err);
                                            });
                                    }

                                }).catch(err => { // Error handler for MongoDB connection.
                                    logger('error', `code.js:3 addEventDocument() Connect error to MongoDB`, err);
                                    botReply(`> ${author} MongoDB connection error, try again later!`, message);
                                });
                            }
                        }).catch(error => { // Error handler when awaitMessage fails.
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`> ${author} ❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => { // Error handler when message itself or .then() fails.
                botReply(`> ${author} ❌ An unknown error occured, please contact **${config.botDetails.owner.tag}** to fix this issue!`, message);
                errorLog(`code.js:1 deleteDocQ() Error`, error);
            });
    }

    async function addEventDocument() {
        // console.log(menuCodeStrG, menuTypeG, codeTypeG, menuPrizeNameG, menuCodeHintG, menuPrizePriorityG, menuRaffleGroupNameG);
        logger('debug', `'${menuCodeStrG}' | '${menuTypeG}' | '${codeTypeG}' | '${menuPrizeNameG}' | '${menuCodeHintG}' | '${menuPrizePriorityG}' | '${menuGroupNameG}'`);

        // Logic when creating a priority prize item.
        if (menuPrizePriorityG === 'high' && menuTypeG === 'prize' || menuPrizePriorityG === 'low' && menuTypeG === 'prize') {
            await MongoClient().then(async () => { // Connect to the MongoDB server.

                const dataFormat = { // Set data format for a new document.
                    name: menuPrizeNameG,
                    available: true,
                    priority: menuPrizePriorityG,
                };

                const newPrizeDocument = new eventPriorityPrizeModel(dataFormat); // Create MongoDB document.
                await eventPriorityPrizeModel.create(newPrizeDocument) // Insert document to the database.
                    .then(prize => {
                        logger('debug', `code.js:1 addEventDocument() Added '${prize.name}' prize to the '${eventPriorityPrizeModel.collection.name}' collection successfully.`);
                        botReply(embedMessage(`Added **${menuPrizePriorityG} priority prize** successfully!\n**ID**: '${prize.name}'\n\n**Prize**: '${prize.name}'\n**Priority**: '${prize.priority}'\n**CreatedAt**: '${new Date(Date.now()).toUTCString()}'`, author), message);
                    })
                    .catch(err => { // Error handler for MongoDB query.
                        if (err.code === 11000) botReply(`> ${author} Duplicate prize document in the database detected, try again with a different prize name.`, message);
                        logger('error', `code.js:2 addEventDocument() MongoDB create query failed.`, err);
                    });

            }).catch(err => { // Error handler for MongoDB connection.
                logger('error', `code.js:3 addEventDocument() Connect error to MongoDB`, err);
                botReply(`> ${author} MongoDB connection error, try again later!`, message);
            });
        }

        // Logic when creating a new code document.
        if (menuCodeStrG && codeTypeG && menuTypeG === 'code') {

            await MongoClient().then(async () => { // Connect to the MongoDB server.

                const dataFormat = { // Data object for document.
                    id: menuCodeStrG,
                    type: codeTypeG,
                    hint: menuCodeHintG ? menuCodeHintG : '',
                    available: true,
                    group: menuGroupNameG ? menuGroupNameG : 'global',
                    club: menuClubIdentificatorG ? menuClubIdentificatorG : '',
                    prize: {
                        claimed: false,
                        item: menuPrizeNameG ? menuPrizeNameG : '',
                        userID: '',
                        userTag: ''
                    }
                };

                const newPrizeDocument = new eventCodeModel(dataFormat); // Create MongoDB document.
                await eventCodeModel.create(newPrizeDocument) // Insert document to the database.
                    .then(codeDocInserted => {
                        logger('debug', `code.js:1 addEventDocument() Added '${codeDocInserted.id}' code to the '${eventCodeModel.collection.name}' collection successfully.`);
                        botReply(embedMessage(`Added **${codeTypeG}** type of code successfully!\n**ID**: '${codeDocInserted.id}'${codeDocInserted.hint ? `\n**Hint**: '${codeDocInserted.hint}'` : ''}${codeDocInserted.group ? `\n**Group**: '${codeDocInserted.group}'` : ''}${codeDocInserted.club ? `\n**Club**:  ${codeDocInserted.club}` : ''}${codeDocInserted.prize.item ? `\n**Prize**:  ${codeDocInserted.prize.item}` : ''}\n**CreatedAt**: '${new Date(Date.now()).toUTCString()}'`, author), message);
                    })
                    .catch(err => { // Error handler for MongoDB query.
                        if (err.code === 11000) botReply(`> ${author} Duplicate prize document in the database detected, try again with a different prize name.`, message);
                        logger('error', `code.js:2 addEventDocument() MongoDB create query failed.`, err);
                    });

            }).catch(err => { // Error handler for MongoDB connection.
                logger('error', `code.js:3 addEventDocument() Connect error to MongoDB`, err);
                botReply(`> ${author} MongoDB connection error, try again later!`, message);
            });
        }
    }

    /**
     * @param {boolean} status - boolean - enable/disable event system commands
     */
    async function updateEventValue(status) { // function to enable/disable event command.
        await updateEventStatus(status, (err, res) => {
            if (err) {
                logger('error', `code.js:1 updateEventValue() ${err}`);
                return botReply(`> ${author} Database error, try again later!`, message);
            }
            logger('log', `code.js:2 updateEventValue() ${res.message}`);
            botReply(`> ${author} ` + res.message + `\n> Event command (${config.botDetails.prefix}event) is now **enabled**.`, message);
        });
    }

    /**
    * @param {String} value - custom date - YYYY-MM-DD format string
    */
    async function updateRaffleData(value) {
        if (!value) return logger('error', `code.js:1 updateRaffleData() value input is missing in the function.`); // Check if value input exists.
        if (typeof value != 'string') return logger('error', `code.js:2 updateRaffleData() value input is not a string.`); // Check if value is a string typeof.
        if (!value.match(/^[0-9]*$/g)) return botReply(`> ${author} Invalid regex.\n> Please type amount of days when the raffle event should pick winners and end itself. For example **7** to finish next week.`, message); // Regex for numbers only

        // Check if event channel is detected.
        const eventChannel = bot.guilds.cache.get(config.servers.eventServerID)?.channels.cache.get(config.channels.raffleInfoChannelID);
        if (!eventChannel) {
            logger('warn', `code.js:3 updateRaffleData() Raffle event channel is not found.`);
            return botReply(`> ${author} Error with the settings, raffle event channel is not found.`, message);
        }

        // Create date object from value
        const date = new Date(Date.now());
        const setMyDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + parseInt(value), 20);


        await MongoClient().then(async () => { // Connect to the MongoDB server.

            // Try to update/send raffle event message.
            await eventSettingsModel.findOne({ id: 'event-status' })  // Check if settings are found and remove old raffle event message (if possible).
                .then(async settingDoc => {

                    if (settingDoc) {
                        const raffleMessage = await eventChannel.messages.fetch(settingDoc.raffleMessageID)
                            .catch(err => logger('warn', `code.js:4 updateRaffleData() Failed to fetch the raffle message.`, err));

                        let raffleMessageString = ''
                        if (value === '0') raffleMessageString = 'Raffle event is disabled.';

                        /**
                         * 
                         * @returns a message either updated or created.
                         */
                        function checkRaffleMessage() {
                            return new Promise((resolve, reject) => {
                                if (raffleMessage) raffleMessage.edit(raffleMessageString ? raffleMessageString : 'Details of the raffle event will be updated soon...')
                                    .then(resolve)
                                    .catch(reject);
                                else {
                                    eventChannel.send(raffleMessageString ? raffleMessageString : 'Details of the raffle event will be updated soon...')
                                        .then(resolve)
                                        .catch(reject);
                                }
                            });
                        }

                        checkRaffleMessage()
                            .then(msg => {
                                settingDoc.raffleMessageID = msg.id; // Update raffleMessageID field.
                                settingDoc.raffleEndAt = value === '0' ? '0' : setMyDate; // Update raffleEndAt with provided data or set 0.
                                settingDoc.save().catch(err => logger('error', `code.js:5 updateRaffleData() MongoDB save error.`, err)); // Save the document.
                                botReply(`> ${author} ${value === '0' ? 'Raffle is disabled now.\n' : `Raffle is enabled now.\n`}> Raffle message has been updated/created.\nSettings are saved in the database.`, message);
                            })
                            .catch(err => {
                                logger('error', `code.js:6 updateRaffleData() Failed to update/send raffle message.`, err);
                                botReply(`> ${author} Error to update/create raffle info message\n> ${err}`, message);
                            });

                    } else botReply(`> ${author} Event settings document is not found.`, message);


                }).catch((err) => {
                    console.error(err);
                    logger('error', `code.js:7 updateRaffleData() MongoDB query error.`, err);
                    botReply(`> ${author} MongoDB query error, try again later!`, message);
                })







            // eventSettingsModel.findOneAndUpdate({ id: 'event-status' }, { raffleEndAt: value }, { new: true })
            //     .then(doc => {

            //         if (doc) botReply(`> ${author} Raffle settings has been updated successfully!`, message);
            //         else botReply(`> ${author} Document for event settings if not found.`, message);

            //     }).catch(err => { // Error handler for MongoDB query error.
            //         logger('error', `code.js:3 updateRaffleData() MongoDB query error.`, err);
            //         botReply(`> ${author} MongoDB query error, try again later!`, message);
            //     });

        }).catch(err => { // Error handler for MongoDB connection.
            logger('error', `code.js:4 updateRaffleData() Connect error to MongoDB`, err);
            botReply(`> ${author} MongoDB connection error, try again later!`, message);
        });
    }
};