// logger.js
// ================================

const dateFormat = require("dateformat");
const config = require('../bot-settings.json');

function logger(type, text, error, color) {

    switch (color?.toLowerCase()) {
        case 'red': return sendLog('\u001b[1;31m');
        case 'green': return sendLog('\u001b[1;32m');
        case 'yellow': return sendLog('\u001b[1;33m');
        case 'blue': return sendLog('\u001b[1;34m');
        case 'purple': return sendLog('\u001b[1;35m');
        case 'cyan': return sendLog('\u001b[1;36m');
        case 'white': return sendLog('\u001b[1;37m');
        case 'test': return sendLog('\u001b[30;1m');
        default: return sendLog('');
    }

    function sendLog(clr) {
        const logDate = dateFormat(new Date(), "UTC:dd/mm/yyyy - h:MM:ss TT");
        if (!type) return logger('trace', 'logger.js:1 logger() Missing type for command in this trace');

        switch (type.toLowerCase()) {
            case 'debug':
                if (config.botDebug) return console.debug(`[${logDate} UTC] [DEBUG] 🟣 ${text}${(error ? ` | ${error}` : '')}`);
                else return;
            case 'log': return console.log(`[${logDate} UTC] [LOG]${clr} 🟢 ${text}${(error ? ` | ${error}` : '')}`);
            case 'info': return console.info(`[${logDate} UTC] [INFO]${clr} 🔵 ${text}${(error ? ` | ${error}` : '')}`);
            case 'warn': return console.warn(`[${logDate} UTC] [WARN]${clr} 🟡 ${text}${(error ? ` | ${error}` : '')}`);
            case 'error': return console.error(`[${logDate} UTC] [ERROR]${clr} 🔴 ${text}${(error ? ` | ${error}` : '')}`);
            case 'trace': return console.trace(`[${logDate} UTC] [TRACE]${clr} 🟤 ${text}${(error ? ` | ${error}` : '')}`);
            case 'update': return console.log(`[${logDate} UTC] [UPDATE]${clr} ⧭ ${text}${(error ? ` | ${error}` : '')}`);
            default: return console.log(`[${logDate} UTC] [DEFAULT] ⚪ ${type} | ${text} | ${error}`);
        }
    }
}

module.exports.logger = logger;