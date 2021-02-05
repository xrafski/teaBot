const { bot } = require('../teaBot');
const cron = require('node-cron');
const certification = require('../functions/update-certification');
const blacklist = require('../functions/update-tread-database');
const { logger } = require('../functions/logger');

bot.on('ready', () => { // https://crontab.guru/examples.html
    cron.schedule('0 10 * * *', () => { // run certification update function daily at 10AM CEST
        certification.certUpdate()
            .then(results => logger('update', `update-database.js:1 | 👉 Certification Update [Daily] has been updated`, results.info))
            .catch(error => logger('error', `update-database.js:2 | Certification Update [Daily]`, error));
    });

    setTimeout(() => { // run certification update function at bot startup
        certification.certUpdate()
            .then(results => logger('update', `update-database.js:3 | 👉 Certification Update [Bot startup] has been updated`, results.info))
            .catch(error => logger('error', `update-database.js:4 | Certification Update [Bot startup]`, error));
    }, 10000);

    //////////////////////////////////////////////////////////////////////////////////////////////

    cron.schedule('0 8 * * *', () => { // run thread update function daily at 8AM CEST
        blacklist.treadUpdate()
            .then(results => logger('update', `update-database.js:5 | 👉 Thread Database Update [Daily] has been updated`, results.info))
            .catch(error => logger('error', `update-database.js:6 | Thread Database Update [Daily]`, error));
    });

    setTimeout(() => { // run tread database function update at bot startup
        blacklist.treadUpdate()
            .then(results => logger('update', `update-database.js:7 | 👉 Tread Database Update [Bot startup] has been updated`, results.info))
            .catch(error => logger('error', `update-database.js:8 | Tread Database Update [Bot startup]`, error));
    }, 10000 * 2);
});