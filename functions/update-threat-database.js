// update-threat-database.js
// ================================

const config = require("../bot-settings.json");
const { google } = require('googleapis');
const keys = require('../Laezaria-Bot-292d692ec77c.json');
const fs = require('fs');

function threatUpdate() {
    const timer = process.hrtime();
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
                spreadsheetId: config.blacklist.spreadsheetID,
                range: config.blacklist.spreadsheetRange
            }).catch(reject);

            if (!data) return; // return if data object doesn't exist aka error above.
            const TEA = data.data.values.filter(value => Object.keys(value).length != 0 && value[2] != '' && value[10] != ''); // filter out empty rows.

            let JSONobj = [];
            TEA.forEach(element => { // create a forEach[spreadsheed row] loop and push data to JSONobj array.

                // Transform undefined or empty cells into null object.
                const userName = (!element[2] || element[2].length < 3 ? null : element[2]);
                const userWarning = (element[4] === '' || !element[4] ? null : element[4]);
                const userlastName = (element[6] === '' || !element[6] ? null : element[6]);
                const userReason = (element[8] === '' || !element[8] ? null : element[8]);
                const userStatus = (element[10] === '' || !element[10] ? null : element[10]);
                const userEvidence = [element[12], element[13], element[14], element[15]].filter(Boolean).join('\n');
                const userAlternate = (element[17] === '' || !element[17] ? null : element[17]);
                const userDiscord = (element[19] === '' || !element[19] ? null : element[19]);
                const userNotes = (element[21] === '' || !element[21] ? null : element[21]);
                const userPersonal = (element[23] === '' || !element[23] ? null : element[23]);

                // userName is used as a primary key in database so can't be empty.
                if (!userName) return;
                JSONobj.push({ 'userName': userName, 'userWarning': userWarning, 'userlastName': userlastName, 'userReason': userReason, 'userStatus': userStatus, 'userEvidence': userEvidence, 'userAlternate': userAlternate, 'userDiscord': userDiscord, 'userNotes': userNotes, 'userPersonal': userPersonal });
            });

            // Write JSONobj to the blacklist.json file
            try {
                fs.writeFileSync('./cache/blacklist.json', JSON.stringify(JSONobj, null, 2));
                const timeDiff = process.hrtime(timer);
                resolve({ 'info': `Finished in ${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s.`, 'data': JSONobj });
            } catch (error) {
                return reject(error);
            }
        }
    });
}

module.exports.threatUpdate = threatUpdate;