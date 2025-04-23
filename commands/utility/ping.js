const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répondre Pong!'),
    async execute(interaction) {
        await interaction.reply({content: 'Pong!', ephemeral: true});
        //const reponse = await interaction.reply({content: 'Pong!', withResponse: true });
        //console.log(reponse.resource.message);
        //await interaction.reply({ content: 'Secret Pong!', flags: MessageFlags.Ephemeral });
        await wait(2_000);
        await interaction.editReply('Pong again!');
        //await interaction.deleteReply();
        await wait(2_000);
        await interaction.followUp('Pong again again!');
    },
};