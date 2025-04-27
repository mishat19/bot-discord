const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');

const createReportModal = () => {
    const modal = new ModalBuilder()
        .setCustomId('signalement')
        .setTitle('Signalement');

    const titre = new TextInputBuilder()
        .setCustomId('titre')
        .setLabel("Raison de votre signalement")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Insultes, moqueries,...');

    const probleme = new TextInputBuilder()
        .setCustomId('probleme')
        .setLabel("Détaillez votre problème")
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(titre);
    const secondActionRow = new ActionRowBuilder().addComponents(probleme);

    modal.addComponents(firstActionRow, secondActionRow);

    return modal;
};

module.exports = {
    createReportModal,
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('modal')
        .setDescription('Signaler un problème'),
    async execute(interaction) {
        const modal = createReportModal();
        await interaction.showModal(modal);
    }
};