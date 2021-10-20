const config = require('./settings/google.json');
const { google } = require('googleapis');
const keys = require('./settings/secret/trove-ethics-alliance-service-account.json');
const { threatModel } = require('../Schema/treatDatabase');

async function getSpreadSheetData() {
    const timer = process.hrtime();
    return new Promise((resolve, reject) => {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        spreadsheet.authorize(error => {
            // Login to spreadsheet service
            if (error) return reject(error);
            gsrun(spreadsheet);
        });

        async function gsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl });

            const data = await gsapi.spreadsheets.values.get({ // Get data object from the spreadsheet.
                spreadsheetId: config.spreadsheet.threatDatabase.id,
                range: config.spreadsheet.threatDatabase.range
            }).catch(reject);


            if (!data) return reject(new Error('Couldn\'t get data from the spreadsheet.')); // Error if data object doesn't exist aka error above.
            // const TEA = data.data.values.filter(value => Object.keys(value).length != 0 && value[2] != '' && value[10] != ''); // filter out empty rows.
            const TEA = data.data.values.filter(row => row[1]?.length >= 3); // filter out rows without requirements: name (3 characters).

            const JSONobj = [];
            TEA.forEach(element => { // create a forEach[spreadsheed row] loop and push data to JSONobj array.

                // Transform undefined or empty cells into null object.
                const id = element[1]; // has to have at least 3 symbols (ALWAYS)
                const warning = element[2] === '' ? null : element[2];
                const reason = element[3] === '' ? null : element[3];
                const status = element[4] === '' ? null : element[4];
                const evidence = element[5] === '' ? null : element[5];
                const alternates = element[6] === '' ? null : element[6];
                const discord = element[7] === '' ? null : element[7];
                const notes = element[8] === '' ? null : element[8];
                const personal = element[9] === '' ? null : element[9];
                //     const userName = element[2];
                //     const userWarning = (element[4] === '' || !element[4] ? null : element[4]);
                //     const userlastName = (element[6] === '' || !element[6] ? null : element[6]);
                //     const userReason = element[8];
                //     const userStatus = (element[10] === '' || !element[10] ? null : element[10]);
                //     const userEvidence = ([element[12], element[13], element[14], element[15]].filter(Boolean).join('\n') === '' ? null : [element[12], element[13], element[14], element[15]].filter(Boolean).join('\n'));
                //     const userAlternate = (element[17] === '' || !element[17] ? null : element[17]);
                //     const userDiscord = (element[19] === '' || !element[19] ? null : element[19]);
                //     const userNotes = (element[21] === '' || !element[21] ? null : element[21]);
                //     const userPersonal = (element[23] === '' || !element[23] ? null : element[23]);

                JSONobj.push({ id, warning, reason, status, evidence, alternates, discord, notes, personal });
            });

            threatModel.deleteMany({})
                .then(() => {
                    threatModel.insertMany(JSONobj, (error, docs) => {
                        if (error) return reject(error);

                        const timeDiff = process.hrtime(timer);
                        resolve({ 'time': `${timeDiff[0]}.${timeDiff[1].toString().slice(0, 3)}s`, 'insertData': docs });
                    });
                }).catch(reject);
        }
    });
}


module.exports.getSpreadSheetData = getSpreadSheetData;