const { bot, Discord, TEAlogo, sendEmbedLog } = require('../teaBot');
const cron = require('node-cron');
const { google } = require('googleapis');
const config = require("../bot-settings.json");
const keys = require('../Laezaria-Bot-292d692ec77c.json');
const { logger } = require('../functions/logger');

bot.on('ready', () => { // https://crontab.guru/examples.html
    // Check TEA spreadsheet for new responses “At minute 30 past every 3rd hour.” (Reports/Appeals)
    cron.schedule('30 */3 * * *', () => {
        logger('update', `Checking appeal/report spreadsheet [cron]`, null, 'white');
        return checkTEAspreadsheet();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function checkTEAspreadsheet() {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        spreadsheet.authorize(function (error, tokens) {
            if (error) return logger('error', `tea-google-form.js:1 checkTEAspreadsheet() Login to google sheet service`, error);
            reportgsrun(spreadsheet);
            appealgsrun(spreadsheet);
        });

        async function reportgsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl })

            const reportS = await gsapi.spreadsheets.values.get({
                spreadsheetId: config.formAppealReport.spreadsheetIdentifier,
                range: 'Reports!A1:F10'
            }).catch(error => logger('error', `tea-google-form.js:1 reportgsrun() Get data from the spreadsheet`, error));

            if (!reportS) return;
            const reportsheet = reportS.data.values;
            if (!reportsheet[1]) return;

            // define the embed: report information from the "Reports" sheet
            let embed_reports_sheet_information = new Discord.MessageEmbed()
                .setColor('RED')
                .setAuthor('Trove Ethics Alliance - Report', TEAlogo)
                .addFields(
                    { name: reportsheet[0][1], value: reportsheet[1][1] = reportsheet[1][1] || 'Anonymous', inline: false }, //Contact information
                    { name: reportsheet[0][2], value: reportsheet[1][2], inline: false }, //Ingame-Name of the player being reported
                    { name: reportsheet[0][3], value: reportsheet[1][3], inline: false }, //Description of the reportable action taking place
                    { name: reportsheet[0][4], value: reportsheet[1][4] = reportsheet[1][4] || 'Date is not provided', inline: false }, //Date of incident (optional)
                    { name: reportsheet[0][5], value: reportsheet[1][5], inline: false }, //Post link(s) to evidence
                )
                .setFooter(`• ${reportsheet[1][0]} ${reportsheet[0][0]}`)
                .setThumbnail(TEAlogo)
            sendEmbedLog(embed_reports_sheet_information, config.formAppealReport.TEAreportChannel, 'TEA - Report');

            // Remove 1st row if not empty
            await gsapi.spreadsheets.batchUpdate(
                {
                    spreadsheetId: config.formAppealReport.spreadsheetIdentifier,
                    requestBody: {
                        requests: [
                            {
                                deleteDimension: {
                                    range: {
                                        sheetId: config.formAppealReport.reportsheetIdentifier,
                                        startIndex: 1,
                                        endIndex: 2,
                                        dimension: "ROWS"
                                    }
                                }
                            }
                        ]
                    }
                },
                function (error, response) {
                    if (error) return logger('error', `tea-google-form.js:2 reportgsrun() batchUpdate the spreadsheet`, error);
                });
        }

        async function appealgsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl })

            const appealS = await gsapi.spreadsheets.values.get({
                spreadsheetId: config.formAppealReport.spreadsheetIdentifier,
                range: 'Appeals!A1:F10'
            }).catch(error => logger('error', `tea-google-form.js:1 appealgsrun() Get data from the spreadsheet`, error));

            if (!appealS) return;
            const appealsheet = appealS.data.values;
            if (!appealsheet[1]) return;

            // define the embed: appeal information from the "Appeals" sheet
            let embed_appeals_sheet_information = new Discord.MessageEmbed()
                .setColor('YELLOW')
                .setAuthor('Trove Ethics Alliance - Appeal', TEAlogo)
                .addFields(
                    { name: appealsheet[0][1], value: appealsheet[1][1], inline: false }, // Current IGN
                    { name: appealsheet[0][2], value: appealsheet[1][2], inline: false }, // IGN listed on TTD Spreadsheet
                    { name: appealsheet[0][3], value: appealsheet[1][3], inline: false }, // Appeal
                )
                .setFooter(`• ${appealsheet[1][0]} ${appealsheet[0][0]}`)
                .setThumbnail(TEAlogo)
            sendEmbedLog(embed_appeals_sheet_information, config.formAppealReport.TEAappealChannel, 'TEA - Appeal');

            // Remove 1st row if not empty
            await gsapi.spreadsheets.batchUpdate(
                {
                    spreadsheetId: config.formAppealReport.spreadsheetIdentifier,
                    requestBody: {
                        requests: [
                            {
                                deleteDimension: {
                                    range: {
                                        sheetId: config.formAppealReport.appealsheetIdentifier,
                                        startIndex: 1,
                                        endIndex: 2,
                                        dimension: "ROWS"
                                    }
                                }
                            }
                        ]
                    }
                },
                function (error, response) {
                    if (error) return logger('error', `tea-google-form.js:2 appealgsrun() batchUpdate the spreadsheet`, error);
                });
        }
    }
});