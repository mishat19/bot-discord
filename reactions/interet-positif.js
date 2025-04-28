const { MessageFlags } = require('discord.js');
const { PositifsInteretPoints } = require('../database/database');

module.exports = async (client, reaction, user, removed ) => {
    // Vérifier si la réaction a été ajoutée par un utilisateur (et non par un bot)
    if (!user.bot) {
        if(removed){
            // Exécuter l'action souhaitée
            await PositifsInteretPoints(user.id, reaction.message.author.id, -1);
            //console.log(`${user.tag} a supprimé une réaction '💌' au message avec l'ID ${reaction.message.id} au message de ${reaction.message.author.username}.`);

            const channel = reaction.message.channel;
            await channel.send({ content: `<@${user.id}> a retiré une réaction '💌' au message avec l'ID ${reaction.message.id} au message de <@${reaction.message.author.id}>.` });
        } else{
            // Exécuter l'action souhaitée
            await PositifsInteretPoints(user.id, reaction.message.author.id, 1);
            //console.log(`${user.tag} a ajouté une réaction '💌' au message avec l'ID ${reaction.message.id} au message de ${reaction.message.author.username}.`);

            const channel = reaction.message.channel;
            await channel.send({ content: `<@${user.id}> a ajouté une réaction '💌' au message avec l'ID ${reaction.message.id} au message de <@${reaction.message.author.id}>.` });

        }
    }
};