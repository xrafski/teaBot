const config = require("../bot-settings.json");
const { certUpdate } = require("../functions/certification-update");

module.exports.help = {
    name: "certupdate",
    description: "work in progress",
    type: "disabled",
    usage: `**${config.BotPrefix}certupdate**`
};

module.exports.run = async (bot, message, args) => {
    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                          uptime                                          //
    //////////////////////////////////////////////////////////////////////////////////////////////

    console.debug(`tea!certupdate command`);

    certUpdate()
        .then(xxx => console.debug('✅ tea!certupdate', xxx))
        .catch(error => console.error('🔴 tea!certupdate ❌ ERROR 🔴\n', error));
}