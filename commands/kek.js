const { errorLog, TEAemoji } = require('../tea');
const config = require("../bot-settings.json");
const fs = require('fs');

const { google } = require('googleapis');
const keys = require('../Laezaria-Bot-292d692ec77c.json');
const spreadsheetIdd = '1PPcesBQS6hONX_c5OouNdXTlxzch4iGiqoHzoq-S3ho';

module.exports.help = {
    name: "kek",
    description: "kek",
    type: "administrator",
    usage: `kek`
};

module.exports.run = async (bot, message) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                        certupdate                                        //
    //////////////////////////////////////////////////////////////////////////////////////////////
    accessSpreadsheet();
    return message.channel.send(`${TEAemoji()} Database has been updated!`)
        .then(message => message.delete({ timeout: 10000 }))
        .catch(() => { return });
}

//////////////////////////////////////////////////////////////////////////////////////////////

function accessSpreadsheet() {
    // console.error(`checkSpreadsheet() - Triggered`);

    const spreadsheet = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    spreadsheet.authorize(function (error, tokens) {
        if (error) return console.error(error);
        // console.log(`Connected!`);
        gsrun(spreadsheet);
    });

    async function gsrun(cl) {
        const gsapi = google.sheets({ version: 'v4', auth: cl })

        let data = await gsapi.spreadsheets.values.get({
            spreadsheetId: spreadsheetIdd,
            range: 'Club list!A4:U500'
        }).catch(error => errorLog(`test.js:1 gsrun()\nGoogle Service backend error.`, error));

        // console.log(data.data.values);
        const TEA = data.data.values;
        // console.log(TEA);

        var jsonObj = {};
        // console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        for (let i = 0; i < TEA.length; i++) {
            if (TEA[i][0]) {
                console.error(TEA[i][0])
                var newGuild = TEA[i][0]; // Server Discord ID
                var newName = TEA[i][1]; // Club Name
                var newDescription = TEA[i][6]; // Club Description
                var newRequirements = TEA[i][11]; // Club Language and requirements
                var newDiscordLink = TEA[i][14]; // Club Invite Link
                var newRepresentative = TEA[i][18]; // Club Representative
                jsonObj[newGuild] = { "name": newName, "description": newDescription, "requirements": newRequirements, "link": newDiscordLink, "representative": newRepresentative }
            }
        }
        // console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        console.log(jsonObj);
        fs.writeFileSync("./test.json", JSON.stringify(jsonObj), "utf8")
    }
}

function jsonFile(output) {
    // convert JSON object to string
    const data = JSON.stringify(output);

    // convert JSON object to string (for humans)
    const dataHuman = JSON.stringify(output, null, 2);

    fs.writeFile("cert.json", dataHuman, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}