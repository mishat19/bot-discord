const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),
    async execute(interaction) {
        // interaction.user is the object representing the User who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild
        await interaction.deferReply({ephemeral: true});
        await wait(4_000);
        await interaction.editReply(`Commande exécutée par ${interaction.user.username}, qui a rejoint le ${interaction.member.joinedAt}.`);
    },
};