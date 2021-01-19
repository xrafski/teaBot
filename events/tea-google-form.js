const { bot, Discord, TEAlogo, sendEmbedLog, errorLog } = require('../teaBot');
const { google } = require('googleapis');
const config = require("../bot-settings.json");
const keys = require('../Laezaria-Bot-292d692ec77c.json');

//////////////////////////////////////////////////////////////////////////////////////////////
//                                  TEA SPREADSHEET HANDLER                                 //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', () => {
    // Check TEA spreadsheet for a new responses every 45mins (Reports/Appeals)
    setInterval(() => {
        // checkTEAspreadsheet(); // PLACEHOLDER
    }, 60000 * 45);

    //////////////////////////////////////////////////////////////////////////////////////////////

    function checkTEAspreadsheet() {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        spreadsheet.authorize(function (error, tokens) {
            if (error) return console.error(error);
            // console.log(`Connected!`);
            reportgsrun(spreadsheet);
            appealgsrun(spreadsheet);
        });

        async function reportgsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl })

            let reportS = await gsapi.spreadsheets.values.get({
                spreadsheetId: config.formAppealReport.spreadsheetIdentifier,
                range: 'Reports!A1:F10'
            }).catch(error => errorLog(`tea-google-form.js:1 reportgsrun()\nSomething wrong with google sheet service.`, error));

            let reportsheet = reportS.data.values;
            // console.log(reportsheet);

            if (!reportsheet[1]) return; // console.error(`1st row is empty (Reports) waiting for a new responds - return;`);

            let dateInfo = reportsheet[1][4];
            if (reportsheet[1][4] === "") {
                dateInfo = 'Date is not provided.';
            }

            let contactInfo = reportsheet[1][1];
            if (reportsheet[1][1] === "") {
                contactInfo = 'Anonymous';
            }

            // define the embed: report information from the "Reports" sheet
            let embed_reports_sheet_information = new Discord.MessageEmbed()
                .setColor('RED')
                .setAuthor('Trove Ethics Alliance - Report', TEAlogo)
                .addFields(
                    { name: reportsheet[0][1], value: contactInfo, inline: false }, //Contact information
                    { name: reportsheet[0][2], value: reportsheet[1][2], inline: false }, //Ingame-Name of the player being reported
                    { name: reportsheet[0][3], value: reportsheet[1][3], inline: false }, //Description of the reportable action taking place
                    { name: reportsheet[0][4], value: dateInfo, inline: false }, //Date of incident (optional)
                    { name: reportsheet[0][5], value: reportsheet[1][5], inline: false }, //Post link(s) to evidence
                )
                .setFooter(`• ${reportsheet[1][0]} ${reportsheet[0][0]}`)
                .setThumbnail(TEAlogo)

            await sendEmbedLog(embed_reports_sheet_information, config.formAppealReport.TEAreportChannel, 'TEA - Report')

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
                function (err, response) {
                    if (err) { errorLog(`tea-google-form.js:2 reportgsrun()\nSomething wrong with google sheet service.`, error); }
                });
        }

        async function appealgsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl })

            let appealS = await gsapi.spreadsheets.values.get({
                spreadsheetId: config.formAppealReport.spreadsheetIdentifier,
                range: 'Appeals!A1:F10'
            }).catch(error => errorLog(`tea-google-form.js:1 appealgsrun()\nSomething wrong with google sheet service.`, error));

            let appealsheet = appealS.data.values;
            // console.log(appealsheet);

            if (!appealsheet[1]) return; // console.error(`1st row is empty (Appeals) waiting for a new responds - return;`);

            // define the embed: appeal information from the "Appeals" sheet
            let embed_appeals_sheet_information = new Discord.MessageEmbed()
                .setColor('YELLOW')
                .setAuthor('Trove Ethics Alliance - Appeal', TEAlogo)
                .addFields(
                    { name: appealsheet[0][1], value: appealsheet[1][1], inline: false }, //Current IGN
                    { name: appealsheet[0][2], value: appealsheet[1][2], inline: false }, //IGN listed on TTD Spreadsheet
                    { name: appealsheet[0][3], value: appealsheet[1][3], inline: false }, //Appeal
                )
                .setFooter(`• ${appealsheet[1][0]} ${appealsheet[0][0]}`)
                .setThumbnail(TEAlogo)

            await sendEmbedLog(embed_appeals_sheet_information, config.formAppealReport.TEAappealChannel, 'TEA - Appeal')

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
                function (err, response) {
                    if (err) { errorLog(`tea-google-form.js:2 appealgsrun()\nSomething wrong with google sheet service.`, error); }
                });
        }
    }
});