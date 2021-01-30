const { bot } = require('../teaBot');
const cron = require('node-cron');
const certification = require('../functions/update-certification');
const blacklist = require('../functions/update-tread-database');
const { logger } = require('../functions/logger');

bot.on('ready', () => {  // https://crontab.guru/examples.html
    cron.schedule('0 10 * * *', () => { // run certification update function daily at 10AM CEST
        logger('update', `Certification Update [Daily]`, null, 'white');
        certification.certUpdate()
            .then(results => logger('log', `update-database.js:1 () 👉 Certification has been updated`, results))
            .catch(error => logger('error', `update-database.js:2 () Update club certifications`, error));
    });

    setTimeout(() => { // run certification update function at bot startup
        logger('update', `Certification Update [Bot startup]`, null, 'white');
        certification.certUpdate()
            .then(results => logger('log', `update-database.js:3 () 👉 Certification has been updated`, results))
            .catch(error => logger('error', `update-database.js:4 ()) EUpdate club certifications`, error));
    }, 60000);

    //////////////////////////////////////////////////////////////////////////////////////////////

    cron.schedule('0 8 * * *', () => { // run thread update function daily at 8AM CEST
        logger('update', `Thread Database Update [Daily]`, null, 'white');
        blacklist.treadUpdate()
            .then(results => logger('log', `update-database.js:5 () 👉 Thread database has been updated`, results))
            .catch(error => logger('error', `update-database.js:6 () Update thread database`, error));
    });

    setTimeout(() => { // run tread database function update at bot startup
        logger('update', `Tread Database Update [Bot startup]`, null, 'white');
        blacklist.treadUpdate()
            .then(results => logger('log', `update-database.js:7 () 👉 Thread database has been updated`, results))
            .catch(error => logger('error', `update-database.js:8 () Update thread database`, error));
    }, 60000 * 2);
});