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

    (await PG(`${process.cwd()}/Commands/slash/*/*.js`)).map(async file => {
        const command = require(file);
        if (!command.name) return;
        if (command.permission) command.defaultPermission = false

        if (command.category === 'GLOBAL') globalCommandsArray.push(command);
        else if (command.category === 'TEA') adminCommandsArray.push(command);
        else guildCommandsArray.push(command);

        client.slashCommands.set(command.name, command);

        console.log(`🔶 Handlers/Commands.js (1) Slash command loaded '${command.name}' in '${command.category ? command.category : 'NONE'}' category.`);
    });

    // client.on("ready", async () => {
    //     const MainGuild = client.guilds.cache.get("551785335638589451");

    //     MainGuild.commands.set(commandsArry).then(command => {
    //         const Roles = (commandName) => {
    //             const cmdPerms = commandsArry.find(c => c.name === commandName).perms;

    //             if (!cmdPerms) return null;

    //             return MainGuild.roles.cache.filter(r => r.permissions.has(cmdPerms) && !r.managed);
    //         };

    //         const fullPermissions = command.reduce((ac, x) => {
    //             const roles = Roles(x.name);
    //             if (!roles) return ac;

    //             const permissions = roles.reduce((a, v) => {
    //                 return [...a, { id: v.id, type: "ROLE", permission: true }];
    //             }, []);

    //             return [...ac, { id: x.id, permissions }];
    //         }, []);

    //         MainGuild.commands.permissions.set({ fullPermissions })
    //             .then(console.log(`🆗 Handlers/Commands.js (2) Slash command permissions set for '${MainGuild.name}' successfully!`))
    //             .catch(error => console.log(`❌ Handlers/Commands.js (3) Error to set guild slash commands permissions`, error));
    //     });
    // });
};

module.exports.slashCommandsArray = guildCommandsArray;
module.exports.adminSlashCommandsArray = adminCommandsArray;
module.exports.globalSlashCommandsArray = globalCommandsArray;