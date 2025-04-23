const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Recharger une commande.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('La commande à recharger.')
                .setRequired(true)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply(`Il n'y a pas de commande: \`${commandName}\`!`);
        }

        delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

        try {
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Commande \`${newCommand.data.name}\` rechargée!`);
        } catch (error) {
            console.error(error);
            await interaction.reply(`Erreur lors du rechargement de la commande: \`${command.data.name}\`:\n\`${error.message}\``);
        }
    },
};