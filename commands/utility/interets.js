const { Events, MessageFlags } = require('discord.js');

module.exports = async (client, reaction, user, ) => {
    // Vérifier si la réaction a été ajoutée par un utilisateur (et non par un bot)
    if (!user.bot) {
        // Exécuter l'action souhaitée
        console.log(`${user.tag} a ajouté une réaction '👍' au message avec l'ID ${reaction.message.id}.`);

        const channel = reaction.message.channel;
        await channel.send({ content: `+1pt d'intérêt avec cet utilisateur !`, flags: MessageFlags.Ephemeral });
    }
};