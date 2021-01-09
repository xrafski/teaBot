const { bot, errorLog } = require('../tea');
const fs = require('fs');
const cron = require('node-cron');
const { google } = require('googleapis');
const config = require("../bot-settings.json");
const keys = require('../Laezaria-Bot-292d692ec77c.json');

bot.on('ready', () => {
    cron.schedule('*/30 * * * *', () => { // https://crontab.guru/examples.html
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.error('Certification update:', lastUpdate);
        // certificationSpreadsheet();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function certificationSpreadsheet() {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        spreadsheet.authorize(function (error, tokens) {
            if (error) return console.error(error);
            gsrun(spreadsheet);
        });

        async function gsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl })

            let data = await gsapi.spreadsheets.values.get({
                spreadsheetId: config.certificationSpreadSheetID,
                range: 'Club list!A4:V150'
            }).catch(error => errorLog(`certification-update.js:1 gsrun()\nGoogle Service backend error.`, error));

            const TEA = await data.data.values;

            let jsonObj = {};
            for (let i = 0; i < TEA.length; i++) {
                if (TEA[i][0]) {
                    let newGuild = TEA[i][0]; // Server Discord ID
                    let newName = TEA[i][1]; // Club Name
                    let newDescription = TEA[i][6]; // Club Description
                    let newRequirements = TEA[i][11]; // Club Language and requirements
                    let newDiscordLink = TEA[i][14]; // Club Invite Link
                    // jsonObj[newGuild] = { "name": newName, "description": newDescription, "requirements": newRequirements, "link": newDiscordLink, "representative": { "name": newRepresentative, "id": newRepresentativeID } }
                      jsonObj[newGuild] = { "name": newName, "description": newDescription, "requirements": newRequirements, "link": newDiscordLink, "representative": { "name": newRepresentative, "id": newRepresentativeID } }
                }
            }

            const cert = fs.readFileSync("./certification.json", "utf8");
            if (cert == JSON.stringify(jsonObj)) return;
            // fs.writeFileSync("./certification.json", JSON.stringify(jsonObj, null, 2), "utf8");
            fs.writeFileSync("./certification.json", JSON.stringify(jsonObj), "utf8");

            // Update certification file on google drive
            return certificationFileBackup();
        }
    }

    function certificationFileBackup() {
        const scopes = [
            'https://www.googleapis.com/auth/drive'
        ];

        const auth = new google.auth.JWT(
            keys.client_email, null,
            keys.private_key, scopes
        );

        const drive = google.drive({ version: "v3", auth });

        drive.files.list({}, (error, res) => {
            if (error) return errorLog('certification-update.js:1 certificationFileBackup() Google Drive API Error', error);
            const files = res.data.files;

            const TEAbotFolder = files.find(file => file.name === 'tea-bot');
            const TEAcertificationFile = files.find(file => file.name === 'certification.json');
            if (!TEAbotFolder || !TEAcertificationFile) return errorLog('certification-update.js:2 certificationFileBackup()\ntea-bot folder or certification.json not found.');

            // Update certification file
            if (TEAcertificationFile) {
                const media = {
                    mimeType: 'application/json',
                    body: fs.createReadStream('./certification.json')
                };

                drive.files.update({
                    fileId: TEAcertificationFile.id,
                    media: media
                }, (error, file) => {
                    if (error) errorLog('certification-update.js:3 certificationFileBackup()\nError to update certification file.', error);
                    // else console.log('Updated certification file - Status: ', file.statusText);
                });
            }
        });
    }
});