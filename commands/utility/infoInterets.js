const { MessageFlags, SlashCommandBuilder } = require("discord.js");
const { getInterestPoints, getDetailInterestPoints } = require('../../database/database');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('interet')
        .setDescription('Voir vos points d\'intérêts avec une personne')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('Personne à vérifier')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('complementaire')
                .setDescription('Détail des points d\intérêt')),
    async execute(interaction) {
        const personneVerification = interaction.options.getUser('utilisateur');
        const points = await getInterestPoints(interaction.user.id, personneVerification.id);
        const detail = interaction.options.getString('complementaire');

        if(detail){
            if(detail === 'detail' || detail === 'détail') {
                const pointsDetails = await getDetailInterestPoints(interaction.user.id, personneVerification.id);
                interaction.reply({content: `Vous avez **${points} point(s)** d\'intérêt (+${pointsDetails[0]} pts / -${pointsDetails[1]} pts) d\'intérêt avec ${personneVerification}`, flags: MessageFlags.Ephemeral});
            } else{
                interaction.reply({content: 'L\'option "complementaire" n\'est pas valide', flags: MessageFlags.Ephemeral});
            }
        } else{
            interaction.reply({content: `Vous avez **${points} point(s)** d\'intérêt avec ${personneVerification}`, flags: MessageFlags.Ephemeral});
        }
    }
}