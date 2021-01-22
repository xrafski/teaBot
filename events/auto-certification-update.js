const { bot, errorLog } = require('../teaBot');
const cron = require('node-cron');
const certification = require('../functions/certification-update');

bot.on('ready', () => {
    cron.schedule('0 10 * * *', () => { // https://crontab.guru/examples.html // Daily at 10AM CEST
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Certification Update [Daily] ${lastUpdate}`, 'color: #24ff24',);
        certification.certUpdate()
            .then(console.debug)
            .catch(error => console.error(`auto-certification-update.js:1 ${error.message}`));
    });

    setTimeout(() => {
        const lastUpdate = new Date(Date.now()).toUTCString(); // at bot startup
        console.log(`%c⧭ Certification Update [Bot startup] ${lastUpdate}`, 'color: #24ff24',);
        certification.certUpdate()
            .then(console.debug)
            .catch(error => console.error(`auto-certification-update.js:2 ${error.message}`));
    }, 10000);

    //////////////////////////////////////////////////////////////////////////////////////////////

    function certificationFileBackup() { // backup JSON to google drive
        const scopes = [
            'https://www.googleapis.com/auth/drive'
        ];

        const auth = new google.auth.JWT(
            keys.client_email, null,
            keys.private_key, scopes
        );

        const drive = google.drive({ version: "v3", auth });

        drive.files.list({}, (error, res) => {
            if (error) return errorLog('auto-certification-update.js:1 certificationFileBackup() Google Drive API Error', error);
            const files = res.data.files;

            const TEAbotFolder = files.find(file => file.name === 'tea-bot');
            const TEAcertificationFile = files.find(file => file.name === 'certification.json');
            if (!TEAbotFolder || !TEAcertificationFile) return errorLog('auto-certification-update.js:2 certificationFileBackup()\ntea-bot folder or certification.json not found.');

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
                    if (error) errorLog('auto-certification-update.js:3 certificationFileBackup()\nError to update certification file.', error);
                    // else console.log('Updated certification file - Status: ', file.statusText);
                });
            }
        });
    }
});