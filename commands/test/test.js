const fetch = require("node-fetch");

module.exports.help = {
    name: "test",
    description: ".....",
    type: "public",
    usage: `.....`
};

module.exports.run = async (bot, message) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           test                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    const jsonData = await fetch('https://skillez.eu/discord/test.json')
        .then(res => res.json())
        .then(json => { return json });

    console.log(jsonData);
}