const { errorLog, TEAemoji } = require('../../teaBot');
const config = require("../../bot-settings.json");
const fs = require('fs');

const { google } = require('googleapis');
const keys = require('../../Laezaria-Bot-292d692ec77c.json');

module.exports.help = {
    name: "certupdate",
    description: "Manually updates the certification database.",
    type: "administrator",
    usage: `**${config.BotPrefix}certupdate**`
};

module.exports.run = async (bot, message) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                        certupdate                                        //
    //////////////////////////////////////////////////////////////////////////////////////////////

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
            spreadsheetId: config.certification.spreadsheetID,
            range: 'Club list!A4:V150'
        }).catch(error => errorLog(`certupdate.js:1 gsrun()\nGoogle Service backend error.`, error));

        // console.log(data.data.values);
        const TEA = await data.data.values;
        // console.log(TEA);

        let jsonObj = {};
        // console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        for (let i = 0; i < TEA.length; i++) {
            if (TEA[i][0]) {
                // console.error(TEA[i][0])
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
        // console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        // console.log(jsonObj);

        const cert = fs.readFileSync("./certification.json", "utf8");
        if (cert == JSON.stringify(jsonObj)) {
            return message.channel.send(`${TEAemoji()} No new content was found in the database to update.`)
                .then(message => message.delete({ timeout: 10000 }))
                .catch(() => { return });
        }

        fs.writeFileSync("./certification.json", JSON.stringify(jsonObj), "utf8");
        return message.channel.send(`${TEAemoji()} Certification database has been updated!`)
            .then(message => message.delete({ timeout: 10000 }))
            .catch(() => { return });
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