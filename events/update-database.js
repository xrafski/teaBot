const { bot, logger } = require('../teaBot');
const cron = require('node-cron');
const certification = require('../functions/update-certification');
const blacklist = require('../functions/update-threat-database');

bot.on('ready', () => { // https://crontab.guru/examples.html
    cron.schedule('0 10 * * *', () => { // run certification update function daily at 10AM CEST
        certification.certUpdate()
            .then(results => logger('update', `update-database.js:1 () 👉 Certification Update [Daily]`, results.info))
            .catch(error => logger('error', `update-database.js:2 ()) Certification Update [Daily]`, error));
    });

    // setTimeout(() => { // run certification update function at bot startup
    certification.certUpdate()
        .then(results => logger('update', `update-database.js:3 () 👉 Certification Update [Bot startup]`, results.info))
        .catch(error => logger('error', `update-database.js:4 () Certification Update [Bot startup]`, error));
    // }, 3000);

    /////////////////////////////////////////////////////////////////////////////////////////////

    cron.schedule('0 8 * * *', () => { // run threat update function daily at 8AM CEST
        blacklist.threatUpdate()
            .then(results => logger('update', `update-database.js:5 () 👉 Threat Database Update [Daily]`, results.info))
            .catch(error => logger('error', `update-database.js:6 () Threat Database Update [Daily]`, error));
    });

    // setTimeout(() => { // run threat database function update at bot startup
    blacklist.threatUpdate()
        .then(results => logger('update', `update-database.js:7 () 👉 Threat Database Update [Bot startup]`, results.info))
        .catch(error => logger('error', `update-database.js:8 () Threat Database Update [Bot startup]`, error));
    // }, 3000);
});