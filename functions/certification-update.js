// certification-update.js
// ================================

const config = require("../bot-settings.json");
const { google } = require('googleapis');
const keys = require('../Laezaria-Bot-292d692ec77c.json');

const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 1,
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

pool.on('acquire', function (connection) {
    // console.debug('certification-update.js:1 - Connection %d acquired', connection.threadId);
    console.debug(`%c⧭ certification-update.js:1 - Connection ${connection.threadId} acquired`, 'color: #ffffff');
});

pool.on('release', function (connection) {
    // console.debug('certification-update.js:2 - Connection %d released', connection.threadId);
    console.debug(`%c⧭ certification-update.js:2 - Connection ${connection.threadId} released`, 'color: #ffffff');
});

pool.on('enqueue', function () {
    // console.debug('certification-update.js:3 - Waiting for available connection slot!');
    console.debug('%c⧭ certification-update.js:3 - Waiting for available connection slot!', 'color: #ff1100');
});

function certificationUpdate() {
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
                spreadsheetId: config.certification.spreadsheetID,
                range: config.certification.spreadsheetRange
            }).catch(reject);

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
            JSONobj.push(['551785335638589451', 'Test Server [Primary]', null, null, null, null, null]);
            JSONobj.push(['739519144344551497', 'Test Server #1', null, null, null, null, null]);
            JSONobj.push(['740996597424586852', 'Test Server #2', null, null, null, null, null]);
            JSONobj.push(['741573084469002274', 'Test Server #3', null, null, null, null, null]);
            JSONobj.push(['741573155642015744', 'Test Server #4', null, null, null, null, null]);
            JSONobj.push(['741573211203960853', 'Test Server #5', null, null, null, null, null]);

            // Additional records for hidden TEA servers.
            JSONobj = [...JSONobj, ['790711561537716226', 'Trove Bug Reports (HIDDEN)', null, null, null, null, null]];

            pool.getConnection(function (error, connection) {
                if (error) {
                    reject(error);
                    return; console.error(`certification-update.js:1 certificationUpdate() ❌ MySQL login error: '${error.code}'`);
                }
                runQuery(connection);
            })


            function runQuery(connection) {
                // Use the connection to TRUNCATE the current table data
                connection.query('TRUNCATE certification_table', function (error, results, fields) {
                    if (error) {
                        connection.release();
                        reject(error);
                        return; console.error(`certification-update.js:2 certificationUpdate() ❌ TRUNCATE query error: '${error.code}'`);
                    }

                    // Run another query to put data into cleared table
                    connection.query('INSERT INTO certification_table (guildDiscordID, guildName, guildJoinworld, guildDescription, guildRequirements, guildDiscordLink, guildRepresentative) VALUES ?', [JSONobj], function (error, results, fields) {
                        if (error) {
                            connection.release();
                            reject(error);
                            return; console.error(`certification-update.js:3 certificationUpdate() ❌ INSERT query error: '${error.code}'`);
                        }

                        // if all was good relase the connection and resolve function
                        connection.release();
                        const timeDiff = process.hrtime(timer);
                        // const timeInMs = (timeDiff[0]* 1000000000 + timeDiff[1]) / 1000000; // convert first to ns then to ms
                        resolve(`👉 Certification has been updated with ${results.warningCount} warning/s in ${timeDiff[0]}.${timeDiff[1].toString().slice(0,3)}s.`);
                    })
                })
            }
        }
    })
}

module.exports.certUpdate = certificationUpdate;