const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Fonctionnement du bot'),
    async execute(interaction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('Choisir une option')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Choisir une option')
                    .setDescription('Menu intéractif')
                    .setValue('option')
                    .setEmoji('⚙️')
                    .setDefault(true),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Introduction')
                    .setDescription('Fonctionnement général du bot')
                    .setValue('introduction')
                    .setEmoji('🧭'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Match')
                    .setDescription('Système de Match')
                    .setValue('match')
                    .setEmoji('🫂'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Intérêt')
                    .setValue('interet')
                    .setDescription('Système de points d\'intérêt')
                    .setEmoji('💌')
            );

        const row = new ActionRowBuilder()
            .addComponents(select);

        await interaction.reply({
            content: 'Si tu souhaites savoir comment je fonctionne :',
            components: [row],
            ephemeral: true
        });
    },
};