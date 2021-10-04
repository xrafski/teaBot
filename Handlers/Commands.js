const { logger } = require("../Utilities/functions");
const AsciiTable = require('ascii-table');
const { Client } = require("discord.js");
const { glob } = require('glob');
const { promisify } = require('util');
const PG = promisify(glob);
let guildCommandsArray = []; // Public guild commands
let adminCommandsArray = []; // TEA Admin commands
let globalCommandsArray = []; // Global commands
/**
 * @param {Client} client 
 */
module.exports = async (client) => {
    logger('startup', `Loaded '${__filename.split("\\").slice(-2).join('/')}' Handler.`);

    let table = new AsciiTable('Commands Loaded');
    table.setHeading('Category', 'Name', 'File');

    (await PG(`${process.cwd()}/Commands/slash/*/*.js`)).map(async file => {
        const command = require(file);
        if (!command.name) return;
        // if (command.permission) command.defaultPermission = false

        if (command.category === 'GLOBAL') globalCommandsArray.push(command);
        else if (command.category === 'TEA') adminCommandsArray.push(command);
        else if (command.category === 'GUILD') guildCommandsArray.push(command);
        else return logger('warn', `Command '${command.name}' doesn't have a correct category '${command.category}'!`)

        client.slashCommands.set(command.name, command);
        table.addRow(command.category, command.name, file.split('/').slice(-4).join('/'));
    });
    console.log(table.toString());
};

module.exports.guildSlashCommandsArray = guildCommandsArray;
module.exports.adminSlashCommandsArray = adminCommandsArray;
module.exports.globalSlashCommandsArray = globalCommandsArray;