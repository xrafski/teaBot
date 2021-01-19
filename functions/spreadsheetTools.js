// spreadsheetTools.js
// ================================

const config = require("../bot-settings.json");
const { google } = require('googleapis');
const keys = require('../Laezaria-Bot-292d692ec77c.json');

function clubRosterData() {
    return new Promise((resolve, reject) => {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        spreadsheet.authorize(function (error, tokens) { // Login to spreadsheet service
            if (error) return reject(error);
            gsrun(spreadsheet);
        });

        async function gsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl });

            const data = await gsapi.spreadsheets.values.get({ // Get data object from the spreadsheet.
                spreadsheetId: config.certification.spreadsheetID,
                range: 'Club list!A4:V250'
            }).catch(error => reject(error));

            if (!data) return; // return if data object doesn't exist aka error above.
            const TEA = data.data.values.filter(value => Object.keys(value).length != 0); // filter out empty rows.
            // console.debug(TEA);

            let JSONobj = [];
            TEA.forEach(element => { // create a forEach[spreadsheed row] loop and push data to JSONobj array.

                // Transform undefined or empty string cells into null object.
                const guildName = (element[0] === '' || !element[0] ? null : element[0]);
                const guildJoinworld = (element[3] === '' || !element[3] ? null : element[3]);
                const guildDescription = (element[5] === '' || !element[5] ? null : element[5]);
                const guildRequirements = (element[10] === '' || !element[10] ? null : element[10]);
                const guildDiscordLink = (element[13] === '' || !element[13] ? null : element[13]);
                const guildRepresentative = (element[17] === '' || !element[17] ? null : element[17]);
                const guildDiscordID = (element[20] === '' || !element[20] ? null : element[20]);

                // guildName is used as a primary key in database so can't be empty.
                if (!guildName) return;

                // push spreadsheet row element to JSONobj array
                JSONobj.push([guildDiscordID, guildName, guildJoinworld, guildDescription, guildRequirements, guildDiscordLink, guildRepresentative]);
            });

            // Test Servers (DeleteMe)
            // JSONobj.push(['551785335638589451', 'Test Server [Primary]', null, null, null, null, null]);
            // JSONobj.push(['739519144344551497', 'Test Server #1', null, null, null, null, null]);
            // JSONobj.push(['740996597424586852', 'Test Server #2', null, null, null, null, null]);
            // JSONobj.push(['741573084469002274', 'Test Server #3', null, null, null, null, null]);
            // JSONobj.push(['741573155642015744', 'Test Server #4', null, null, null, null, null]);
            // JSONobj.push(['741573211203960853', 'Test Server #5', null, null, null, null, null]);

            // Additional records for hidden TEA servers.
            JSONobj = [...JSONobj, ['790711561537716226', 'Trove Bug Reports (HIDDEN)', null, null, null, null, null]];

            // If all above was done then resolve the promise with the filtered spreadsheet data.
            return resolve(JSONobj);
        }
    });
}

module.exports.clubRosterData = clubRosterData;