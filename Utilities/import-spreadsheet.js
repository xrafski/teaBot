const { google } = require('googleapis');
// const keys = require('./settings/secret/trove-ethics-alliance-service-account.json');

/**
 * Get data from the google spreadsheet service.
 * @param {String} spreadSheetID ID of the spreadsheet to get data
 * @param {String} spreadSheetRange Range from the sheet (Blacklist!A5:Y5000 etc.)
 * @param {JSON} keys secret json file with service account keys.
 * @returns {Object} Object data from the google spreadsheet service.
 */
async function getSpreadSheetData(spreadSheetID, spreadSheetRange, keys) {
    return new Promise((resolve, reject) => {
        const spreadsheet = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        // Login to spreadsheet service
        spreadsheet.authorize(error => {
            if (error) return reject(error);
            gsrun(spreadsheet);
        });

        async function gsrun(cl) {
            const gsapi = google.sheets({ version: 'v4', auth: cl });

            // Get data object from the spreadsheet.
            const data = await gsapi.spreadsheets.values.get({
                spreadsheetId: spreadSheetID,
                range: spreadSheetRange
            }).catch(reject);


            if (!data) return reject(new Error('Couldn\'t get data from the spreadsheet.')); // Error if data object doesn't exist aka error above.
            else resolve(data);
        }
    });
}


module.exports.getSpreadSheetData = getSpreadSheetData;