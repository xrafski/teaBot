const { Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "add",
    description: "This is a test add command",
    defaultPermission: true,
    perms: "",
    category: "",
    type: 'CHAT_INPUT',
    options: [
        {
            name: 'number1',
            description: 'Type number 1',
            type: 'INTEGER',
            required: true,
        },
        {
            name: 'number2',
            description: 'Type number 2',
            type: 'INTEGER',
            required: true,
        }
    ],
    /**
     * @param {Client} client 1
     * @param {CommandInteraction} interaction 
     */
    async execute(client, interaction, args) {
        const [num1, num2] = args;
        await interaction.reply({ content: `The result is ${num1 + num2}`, ephemeral: true });
    }
};