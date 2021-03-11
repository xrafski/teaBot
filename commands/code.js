const config = require("../bot-settings.json");
const { updateEventStatus, checkEventCache, updateCodeCache, blockEventWhileProcessing } = require("../cache/tea-event-cache");
const { MongoClient } = require("../functions/mongodb-connection");
const { eventFixedCodeModel } = require("../schema/event-codes-fixed");
const { eventPriorityCodeModel } = require("../schema/event-codes-priority");
const { eventPriorityPrizeModel } = require("../schema/event-priority-prizes");
const { botReply, logger, embedMessage } = require('../teaBot');

module.exports.help = {
    name: "code",
    description: "Manage codes for event system.",
    type: "administrator",
    usage: `ℹ️ Format: multiple formats (check examples below)\nℹ️ Example(s):\n**${config.botPrefix}code status** - check event status\n**${config.botPrefix}code enable** - enable event system\n**${config.botPrefix}code disable** - disable event system\n**${config.botPrefix}code add** - interactive menu to add codes\n**${config.botPrefix}code del codeStr codeType** - remove codes\n**${config.botPrefix}code prize add** - interactive menu to add priority prizes\n**${config.botPrefix}code unlock** - in case of a bug, manual command to unlock ${config.botPrefix}event command`
};

module.exports.run = async (bot, message, args) => {
    const [codeModule, codeStr, codeType] = args;
    const { author } = message;
    let menuCodeStr;
    let menuCodeType;
    let menuItemName;
    let menuCodeHint;

    let menuPrizePriority;

    switch (codeModule?.toLowerCase()) {
        case 'status': return botReply(`Event status: ${(checkEventCache('eventstatus') === true ? `**Enabled**` : `**Disabled**`)}\nEvent command processing status: ${(checkEventCache('blockevent') === true ? `**Enabled**` : `**Disabled**`)}`, message);
        case 'enable': {
            return await updateEventStatus(true, (err, res) => {
                if (err) {
                    logger('error', `code.js:1 switch enable() ${err}`);
                    return botReply('Database error, try again later!', message);
                }
                logger('log', `code.js:2 switch enable() ${res.message}`);
                botReply(res.message + `\nEvent commands (${config.botPrefix}claim, ${config.botPrefix}event) are now **enabled**.`, message);
            });
        }

        case 'disable': {
            return await updateEventStatus(false, (err, res) => {
                if (err) {
                    logger('error', `code.js:1 switch disable() ${err}`);
                    return botReply('Database error, try again later!', message);
                }
                logger('log', `code.js:2 switch disable() ${res.message}`);
                botReply(res.message + `\nEvent commands (${config.botPrefix}claim, ${config.botPrefix}event) are now **disabled**.`, message);
            });
        }

        case 'unlock': {
            blockEventWhileProcessing(false);
            return botReply(`Unlocked **${config.botPrefix}event** command.`, message);
        }

        case 'add': return codeTypeQuestion();

        case 'del': {
            if (!codeType) return botReply(`Missing code type: 'fixed'/'priority'/'prize'`, message);

            if (codeType.toLowerCase() === 'fixed') {

                return MongoClient().then(async () => { // connect to MongoDB

                    await eventFixedCodeModel.findOneAndDelete({ id: codeStr.toLowerCase() })
                        .then(doc => {

                            if (doc) {  // if document is found and deleted
                                updateCodeCache(doc.id, null); // remove key from the cache
                                botReply(`Document assigned to '**${doc.id}**' fixed code successfully deleted!`, message);
                                logger('log', `code.js:1 switch del() Document assigned with '${doc.id}' fixed code deleted from 'event-codes-fixed' collection.`);
                            }
                            // if document is not found
                            else botReply(`There is no document assigned to '**${codeStr.toLowerCase()}**' fixed code.`, message);

                        })
                        .catch(err => {
                            logger('error', `code.js:2 switch del() MongoDB model query error`, err);
                            botReply(`Error to run MongoDB model query, try again later`, message);
                        });

                }).catch(err => {
                    logger('error', `code.js:3 switch del() Connect error to MongoDB.`, err);
                    botReply(`MongoDB connection error, try again later`, messag);
                });
            }

            else if (codeType.toLowerCase() === 'priority') {

                return MongoClient().then(async () => { // connect to MongoDB

                    await eventPriorityCodeModel.findOneAndDelete({ id: codeStr.toLowerCase() })
                        .then(doc => {

                            if (doc) {  // if document is found and deleted
                                updateCodeCache(doc.id, null); // remove key from the cache
                                botReply(`Document assigned to '**${doc.id}**' priority code successfully deleted!`, message);
                                logger('log', `code.js:4 switch del() Document assigned with '${doc.id}' priority code deleted from 'event-codes-priority' collection.`);
                            }
                            // if document is not found
                            else botReply(`There is no document assigned to '**${codeStr.toLowerCase()}**' priority code.`, message);

                        })
                        .catch(err => {
                            logger('error', `code.js:5 switch del() MongoDB model query error`, err);
                            botReply(`Error to run MongoDB model query, try again later`, message);
                        });

                }).catch(err => {
                    logger('error', `code.js:6 switch del() Connect error to MongoDB.`, err);
                    botReply(`MongoDB connection error, try again later`, messag);
                });
            }

            else if (codeType.toLowerCase() === 'prize') {

                return MongoClient().then(async () => { // connect to MongoDB

                    await eventPriorityPrizeModel.findOneAndDelete({ timestamp: codeStr.toLowerCase() })
                        .then(doc => {

                            if (doc) {  // if document is found and deleted
                                botReply(`Document assigned to '**${doc.name}**' ${doc.priority} priority code successfully deleted!`, message);
                                logger('log', `code.js:7 switch del() Document assigned with '${doc.timestamp}' ${doc.priority} priority code deleted from 'event-priority-prizes' collection.`);
                            }
                            // if document is not found
                            else botReply(`There is no document assigned to '**${codeStr.toLowerCase()}**' priority prize.`, message);

                        })
                        .catch(err => {
                            logger('error', `code.js:8 switch del() MongoDB model query error`, err);
                            botReply(`Error to run MongoDB model query, try again later`, message);
                        });

                }).catch(err => {
                    logger('error', `code.js:9 switch del() Connect error to MongoDB.`, err);
                    botReply(`MongoDB connection error, try again later`, messag);
                });
            }

            else return botReply(`Invalid code type, available types: fixed/priority/prize`, message);
        }

        case 'prize': {
            if (codeStr?.toLowerCase() === 'add') return prizeItemName();
            else return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);
        }

        default: {
            if (config.botDebug) console.log({ message: 'code.js eventCodeCache Object', eventCodeCache: checkEventCache('eventcodes'), eventStatus: checkEventCache('eventstatus'), blockEventCommand: checkEventCache('blockevent') });
            return botReply(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`, message);
        }
    }

    function prizeItemName(additionalText) { // prize chain
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\n> **Enter prize name**:`, message)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect next reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 })
                        .then(Answer => {
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // exit if other command was typed
                            else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message);
                            else if (Answer.first().content.length < 3 || Answer.first().content.length > 50) return codeItemName('❌ Prize name [3-50] characters long.');
                            else {
                                menuItemName = Answer.first().content;
                                menuCodeType = 'prize';
                                return prizePriorityQuestion();
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact **${config.ownerTag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeItemNameQuestion() Error`, error);
            });
    }

    function prizePriorityQuestion(additionalText) { // prize chain
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\n> **Select priority type**: **high** or **low**`, message)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect next reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 })
                        .then(async Answer => {
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // exit if other command was typed

                            switch (Answer.first().content.toLowerCase()) {
                                case 'exit': case 'cancel': return botReply(`❌ Cancelled.`, message);

                                case 'low': {
                                    menuPrizePriority = 'low';
                                    return await addCode(menuCodeStr, menuCodeType, menuItemName, menuCodeHint, menuPrizePriority);
                                }
                                case 'high': {
                                    menuPrizePriority = 'high';
                                    return await addCode(menuCodeStr, menuCodeType, menuItemName, menuCodeHint, menuPrizePriority);
                                }

                                default: return prizePriorityQuestion('❌ Unknown code priority status.');
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (${Math.round(responseTime / 60000)}mins)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact **${config.ownerTag}** to fix this issue!`, message);
                errorLog(`code.js:1 prizePriorityQuestion() Error`, error);
            });
    }

    function codeItemNameQuestion(additionalText) { // fixed chain
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\n> **Enter prize name**:`, message)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect next reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 })
                        .then(Answer => {
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // exit if other command was typed
                            else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message);
                            else if (Answer.first().content.length < 3 || Answer.first().content.length > 50) return codeItemName('❌ Prize name [3-50] characters long.');
                            else {
                                menuItemName = Answer.first().content;
                                return codeStrQuestion();
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact **${config.ownerTag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeItemNameQuestion() Error`, error);
            });
    }

    function codeTypeQuestion(additionalText) { // fixed/priority
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\n> **Select code type**: [**fixed** or **priority**]`, message)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect next reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 })
                        .then(Answer => {
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // exit if other command was typed

                            switch (Answer.first().content.toLowerCase()) {
                                case 'exit': case 'cancel': return botReply(`❌ Cancelled.`, message);

                                case 'fixed': {
                                    menuCodeType = 'fixed';
                                    return codeItemNameQuestion();
                                }
                                case 'priority': {
                                    menuCodeType = 'priority';
                                    return codeStrQuestion();
                                }

                                default: return codeTypeQuestion('❌ Unknown code format.');
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact **${config.ownerTag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeTypeQuestion() Error`, error);
            });
    }

    function codeStrQuestion(additionalText) { // both types
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\n[single word][lower case alphanumeric][3-69 characters long]\n> **Type the custom code for people to use.**`, message)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect next reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 })
                        .then(Answer => {
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // exit if other command was typed
                            else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message);
                            else if (!Answer.first().content.match(/^[a-z0-9]{3,69}$/)) return codeStrQuestion(`❌ Invalid code text format`);
                            else {
                                menuCodeStr = Answer.first().content;
                                return codeHintQuestion();
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact **${config.ownerTag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeStrQuestion() Error`, error);
            });
    }

    function codeHintQuestion(additionalText) { // fixed/priority
        if (!additionalText) additionalText = '';
        else additionalText = additionalText + '\n(you can type **exit** to cancel)\n';
        return botReply(`${additionalText}\nIf you dont want to add hint type **none**\nExamples: \`<https://skillez.eu/> | /joinworld RNG\` or \`<https://link.to.image>\`\n> **Type hint text**: [4-100 characters long].`, message)
            .then(Question => {
                if (Question) { // check if the bot sent question to the user, if so, collect next reply from the message.author.
                    message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000 })
                        .then(async Answer => {
                            if (Answer.first().content.startsWith(config.botPrefix)) return; // exit if other command was typed
                            else if (Answer.first().content.length < 4 || Answer.first().content.length > 100) return codeHintQuestion(`❌ Your hint is either too short or too long.`);
                            else if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel') return botReply(`❌ Cancelled.`, message);
                            else if (Answer.first().content.toLowerCase() === 'none') return await addCode(menuCodeStr, menuCodeType, menuItemName, menuCodeHint, menuPrizePriority);
                            else {
                                menuCodeHint = Answer.first().content;
                                return await addCode(menuCodeStr, menuCodeType, menuItemName, menuCodeHint, menuPrizePriority);
                            }
                        }).catch(error => {
                            if (error.message === "Cannot read property 'content' of undefined") return botReply(`❌ There was no message within the time limit (1min)! - Cancelled.`, message);
                            else return;
                        });
                }
            })
            .catch(error => {
                botReply(`❌ An unknown error occured, please contact **${config.ownerTag}** to fix this issue!`, message);
                errorLog(`code.js:1 codeHintQuestion() Error`, error);
            });
    }

    async function addCode(menuCodeStr, menuCodeType, menuItemName, menuCodeHint, menuPrizePriority) {

        if (menuCodeType === 'fixed') { // add fixed type code

            await MongoClient().then(async () => {

                const dataFormat = {
                    id: menuCodeStr,
                    type: menuCodeType,
                    timestamp: Date.now(),
                    hint: menuCodeHint || '',
                    available: true,
                    prize: {
                        claimed: false,
                        item: menuItemName,
                        userID: '',
                        userTag: ''
                    }
                };

                const newCodeDocument = new eventFixedCodeModel(dataFormat);
                await eventFixedCodeModel.create(newCodeDocument)
                    .then(code => {

                        if (code) { // check if document is inserted correctly
                            updateCodeCache(code.id, { available: code.available, type: code.type, hint: code.hint });
                            logger('log', `code.js:1 addCode() Added '${code.id}' code to the 'event-codes-fixed' collection successfully.`);
                            botReply(embedMessage(`Added **fixed type** of code successfully!\n**ID**: '${code.id}'\n**Prize**: '${code.prize.item}'${code.hint ? `\n**Hint**: '${code.hint}'` : ``}\n**CreatedAt**: '${new Date(Number(code.timestamp)).toUTCString()}'`, author), message);

                        } else throw new Error(`Document was is not created.`);
                    })
                    .catch(err => {
                        if (err.code === 11000) return botReply(`'**${menuCodeStr}**' code already exists in the database!`, message);
                        logger('error', `code.js:2 addCode() MongoDB create query failed`, err);
                        botReply(`Database query error, try again later!`, message);
                    });


            }).catch(err => {
                logger('error', `code.js:3 addCode() Connect error to MongoDB`, err);
                botReply(`MongoDB connection error, try again later!`, message);
            });
        }

        else if (menuCodeType === 'priority') { // add priority type code

            await MongoClient().then(async () => {

                const dataFormat = {
                    id: menuCodeStr,
                    available: true,
                    type: menuCodeType,
                    hint: menuCodeHint || '',
                    timestamp: Date.now(),
                    userID: '',
                    userTag: '',
                    prizeID: '',
                    claimed: false
                };

                const newCodeDocument = new eventPriorityCodeModel(dataFormat);
                await eventPriorityCodeModel.create(newCodeDocument)
                    .then(code => {

                        if (code) { // check if document is inserted correctly
                            updateCodeCache(code.id, { available: code.available, type: code.type, hint: code.hint });
                            logger('log', `code.js:4 addCode() Added '${code.id}' code to the 'event-codes-priority' collection successfully.`);
                            botReply(embedMessage(`Added **priority type** of code successfully!\n**ID**: '${code.id}'${code.hint ? `\n**Hint**: '${code.hint}'` : ``}\n**CreatedAt**: '${new Date(Number(code.timestamp)).toUTCString()}'`, author), message);

                        } else throw new Error(`Document was is not created.`); // return error if document is not inserted
                    })
                    .catch(err => {
                        if (err.code === 11000) return botReply(`'**${menuCodeStr}**' code already exists in the database!`, message);
                        logger('error', `code.js:5 addCode() MongoDB create query failed`, err);
                        botReply(`Database query error, try again later!`, message);
                    });


            }).catch(err => {
                logger('error', `code.js:6 addCode() Connect error to MongoDB`, err);
                botReply(`MongoDB connection error, try again later!`, message);
            });

        }

        else if (menuPrizePriority) { // add priority prize

            await MongoClient().then(async () => {

                const dataFormat = {
                    name: menuItemName,
                    available: true,
                    priority: menuPrizePriority,
                    timestamp: Date.now()
                };

                const newPrizeDocument = new eventPriorityPrizeModel(dataFormat);
                await eventPriorityPrizeModel.create(newPrizeDocument)
                    .then(prize => {

                        if (prize) { // check if document is inserted correctly
                            logger('log', `code.js:7 addCode() Added '${prize.name}'(${prize.timestamp}) prize to the 'event-priority-prizes' collection successfully.`);
                            botReply(embedMessage(`Added **${menuPrizePriority} priority prize** successfully!\n**ID**: '${prize.timestamp}'\n**Prize**: '${prize.name}'\n**Priority**: '${prize.priority}'\n**CreatedAt**: '${new Date(Number(prize.timestamp)).toUTCString()}'`, author), message);

                        } else throw new Error(`Document was is not created.`);
                    })
                    .catch(err => {
                        if (err.code === 11000) return botReply(`Duplicate prize document in the database detected, try again in a few seconds.`, message);
                        logger('error', `code.js:8 addCode() MongoDB create query failed`, err);
                        botReply(`Database query error, try again later!`, message);
                    });


            }).catch(err => {
                logger('error', `code.js:9 addCode() Connect error to MongoDB`, err);
                botReply(`MongoDB connection error, try again later!`, message);
            });
        }

        else return botReply(`Unknown code type!\nOnly ('fixed'/'priority') are allowed`, message); // if something undefined went in the function
    }
};