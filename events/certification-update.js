const { bot, errorLog } = require('../tea');
const fs = require('fs');
const { google } = require('googleapis');
const config = require("../bot-settings.json");
const keys = require('../Laezaria-Bot-292d692ec77c.json');

bot.on('ready', () => {
    setInterval(() => { // Check TEA spreadsheet and get recent club data to certification.json (every 12 hours).
        accessSpreadsheet();
    }, 3600000 * 12);

    //////////////////////////////////////////////////////////////////////////////////////////////

    function accessSpreadsheet() {
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
                    let newRepresentative = TEA[i][18]; // Club Representative
                    let newRepresentativeID = TEA[i][21]; // Club RepresentativeID
                    jsonObj[newGuild] = { "name": newName, "description": newDescription, "requirements": newRequirements, "link": newDiscordLink, "representative": { "name": newRepresentative, "id": newRepresentativeID } }
                }
            }

            const cert = fs.readFileSync("./certification.json", "utf8");
            if (cert == JSON.stringify(jsonObj)) return;
            // fs.writeFileSync("./certification.json", JSON.stringify(jsonObj, null, 2), "utf8");
            fs.writeFileSync("./certification.json", JSON.stringify(jsonObj), "utf8");
            return console.log(`Database synchronized!`);
        }
    }
});