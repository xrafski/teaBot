const { bot } = require('../teaBot');
const cron = require('node-cron');
const certification = require('../functions/update-certification');
const blacklist = require('../functions/update-tread-database');

bot.on('ready', () => {  // https://crontab.guru/examples.html
    cron.schedule('0 10 * * *', () => { // run certification update function daily at 10AM CEST
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Certification Update [Daily] ${lastUpdate}`, 'color: #24ff24',);
        certification.certUpdate()
            .then(results => console.debug(`✅ update-database.js:1 👉 Certification has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:2 ${error.message}`));
    });

    setTimeout(() => { // run certification update function at bot startup
        const lastUpdate = new Date(Date.now()).toUTCString(); // at bot startup
        console.log(`%c⧭ Certification Update [Bot startup] ${lastUpdate}`, 'color: #24ff24',);
        certification.certUpdate()
            .then(results => console.debug(`✅ update-database.js:4 👉 Certification has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:5 ${error.message}`));
    }, 10000);

    //////////////////////////////////////////////////////////////////////////////////////////////

    cron.schedule('0 8 * * *', () => { // run thread update function daily at 8AM CEST
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Thread Database Update [Daily] ${lastUpdate}`, 'color: #24ff24',);
        certification.certUpdate()
            .then(results => console.debug(`✅ update-database.js:6 👉 Thread database has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:7 ${error.message}`));
    });

    setTimeout(() => { // run tread database function update at bot startup
        const lastUpdate = new Date(Date.now()).toUTCString();
        console.log(`%c⧭ Tread Database Update [Bot startup] ${lastUpdate}`, 'color: #daff61',);
        blacklist.treadUpdate()
            .then(results => console.debug(`✅ update-database.js:8 👉 Thread database has been updated: ${results}`))
            .catch(error => console.error(`update-database.js:9 ${error.message}`));
    }, 10000 * 2);
});