// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageCreate
module.exports = {
    name: 'messageCreate', // Emitted whenever a message is created.
    once: false,

    async execute(client, message) {

        // Block all bot message and messages that do not start with a prefix.
        if (message.author.bot || !message.content.toLowerCase().startsWith(client.config.bot.prefix)) return;

        // Object Destructuring
        const { content } = message;
        const [cmd, ...args] = content
            .slice(client.config.bot.prefix.length) // Sli9ce prefix from the message content.
            .trim() // Trim whitespace from the remaining content.
            .split(/ +/g); // Split remaining content into an array separated by a space to create command arguments.

        // Set command variable and find command by its name or prefix.
        const command = client.classicCommands.get(cmd.toLowerCase()) || client.classicCommands.find(cc => cc.aliases?.includes(cmd.toLowerCase()));

        // Check if command exists and return the code if it doesn't.
        if (!command) return;

        // Run the command.
        await command.run(client, message, args);
    }
};