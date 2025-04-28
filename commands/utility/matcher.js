const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createReportModal } = require('./signalement.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('matcher')
        .setDescription('Demander un match à un profil')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('personne à matcher')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('motif')
                .setDescription('raison de la demande')
                .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('utilisateur');
        const utilisateurDemande = interaction.user;
        const motif = interaction.options.getString('motif');
        const channelName = `match-${cleanUsername(utilisateurDemande.username)}-${cleanUsername(target.username)}`;

        //Envoi demande
        const envoyer = new ButtonBuilder()
            .setCustomId('envoyer')
            .setLabel('Envoyer')
            .setEmoji('😎')
            .setStyle(ButtonStyle.Success)

        const annuler = new ButtonBuilder()
            .setCustomId('annuler')
            .setLabel('J\'ai trop peur')
            .setEmoji('😨')
            .setStyle(ButtonStyle.Secondary)

        //Envoi réponse
        const accepter = new ButtonBuilder()
            .setCustomId('accepter')
            .setLabel('J\'accepte')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success)

        const refuser = new ButtonBuilder()
            .setCustomId('refuser')
            .setLabel('Je refuse')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary)

        //Envoi message channelMatch épinglé
        const match = new ButtonBuilder()
            .setCustomId('match')
            .setLabel('Match')
            //.setEmoji('✨')
            .setStyle(ButtonStyle.Success)

        const echec = new ButtonBuilder()
            .setCustomId('echec')
            .setLabel('Échec')
            //.setEmoji('💢')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary)

        const signaler = new ButtonBuilder()
            .setCustomId('signaler')
            .setLabel('Signaler')
            //.setEmoji('🎟️️')
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder()
            .addComponents(envoyer, annuler)

        const reponseTarget = new ActionRowBuilder()
            .addComponents(accepter, refuser)

        const matchEpingle = new ActionRowBuilder()
            .addComponents(match, echec, signaler)

        const bots = interaction.guild.members.cache.filter(member => member.user.bot);
        const usersInterdits = [...bots.map(bot => bot.id), interaction.user.id];
        if (usersInterdits.includes(target.id)) {
            await interaction.reply( {content : 'Désolé, tu ne peux pas créer un match avec toi-même, je suis désolé de te l\'apprendre...', flags: MessageFlags.Ephemeral});
            return;
        }

        const envoi = await interaction.reply({
            content: `<@${interaction.user.id}>\n Veux-tu vraiment envoyer une demande à ${target} ?\n Cette personne recevra ta demande en Message Privé afin de valider ou refuser ta demande, vérifie bien d'avoir bien expliqué le motif de ta demande !`,
            components: [row],
            //withResponse: true,
            flags: MessageFlags.Ephemeral,
        });

        const envoiFilter = i => i.user.id === interaction.user.id;
        let userInteraction = false;

        //ENVOI DEMANDE

        try{
            const confirmation = await interaction.channel.awaitMessageComponent({filter: envoiFilter, time: 60_000});
            userInteraction = true;

            if(confirmation.customId === 'envoyer') {
                //--------------------------------------------
                //Vérification si channel déjà existant
                const channelVerif = interaction.guild.channels.cache.find(ch => ch.name === channelName);

                if(channelVerif){
                    await interaction.followUp({ content: 'Tu as déjà une demande de match acceptée.', flags: MessageFlags.Ephemeral});
                    await envoi.delete();
                    return;
                }
                await interaction.followUp({ content: 'Ta demande a été envoyée ! Tu vas recevoir une confirmation en MP sous peu.', flags: MessageFlags.Ephemeral});
                //await interaction.editReply({ content: 'Envoyé', components: []});
                await envoi.delete();
                try {
                    await interaction.user.send({ content: `${target} a bien reçu ta demande, j\'espère que tu recevras rapidement une réponse !` });
                } catch (error) {
                    console.error(`Erreur lors de l'envoi du MP à l'envoyeur :`, error);
                    await interaction.followUp({ content: 'Tu ne peux pas recevoir de Messages Privé.', flags: MessageFlags.Ephemeral});
                }

                try {
                    await target.send({
                        content: `<@${interaction.user.id}> souhaite créer un MATCH avec toi avec pour motif(s) : "${motif}".\n\n Tu peux accepter ou refuser sa demande, c'est comme tu le souhaites ! Mais sache que la vie est faites de surprise 😉`,
                        components: [reponseTarget],
                    });
                } catch (error) {
                    console.error(`Erreur lors de l'envoi du MP au receveur :`, error);
                    await interaction.followUp({ content: 'Cet utilisateur ne peut pas recevoir de Messages Privé.', flags: MessageFlags.Ephemeral });
                }
            } else{
                await interaction.editReply({ content: 'Annulation', components: []});
                await interaction.followUp({ content: 'Tout va bien, cela n\'est pas toujours facile ! 😊', flags: MessageFlags.Ephemeral});
            }
        } catch (error){
            if(!userInteraction){
                console.error('Erreur lors de l\'attente de la confirmation :', error);
                await interaction.editReply({ content: 'Tu as été trop long à te décider...', components: [], flags: MessageFlags.Ephemeral});
            }
        }

        //RECEPTION REPONSE

        function cleanUsername(username) {
            return username
                .toLowerCase()               // tout en minuscules
                .replace(/\s+/g, '-')         // remplace tous les espaces par des tirets
                .replace(/[^a-z0-9\-]/g, ''); // enlève tout ce qui n'est pas lettre, chiffre ou tiret
        }

        const filter = i => i.user.id === target.id;
        const responseHandler = async (i) => {
            if (!filter(i)) return;

            if (i.customId === 'accepter') {
                await i.update({content: 'Vous avez accepté la demande.', components: []});
                try {
                    await utilisateurDemande.send({content: `<@${target.id}> a accepté ta demande de match !`});
                    const channelMatch = await interaction.guild.channels.create({
                            parent: '1365735697851355296',
                            name: `${channelName}`,
                            type: 0,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.id, // @everyone
                                    deny: ['ViewChannel'],    // Interdit à tout le monde
                                },
                                {
                                    id: utilisateurDemande.id,
                                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'], // Autorise utilisateur demande
                                },
                                {
                                    id: target.id,
                                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'], // Autorise la cible
                                },
                                {
                                    id: interaction.client.user.id,
                                    allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ManageMessages'], // Autorise ton bot à tout gérer
                                }
                            ]
                    });
                    const messageMatch = await channelMatch.send({
                        content: `Bienvenue dans votre salon privé où vous pourrez apprendre à vous connaître dans l'intimité totale ! ${utilisateurDemande} a aimé ton profil ${target}, il aimerait faire ta connaissance et il te remercie d'avoir accepté sa demande 😊`,
                        components: [matchEpingle],
                        fetchReply: true //Récupérer message
                    });
                    await messageMatch.pin();

                    //Ecoute interactions
                    const messageFilter = i => ['match', 'echec', 'signaler'].includes(i.customId);
                    const messageCollector = messageMatch.createMessageComponentCollector({ filter: messageFilter });
                    const roleMatch = interaction.guild.roles.cache.get('1366033894213685343');

                    messageCollector.on('collect', async i => {
                        if (i.customId === 'match') {
                            const user = i.user.id === utilisateurDemande.id ? target : utilisateurDemande;
                            await i.reply({ content: `🎉 Tu as confirmé le match avec ${user} ! 🎉 \n\n Je suis heureux que vos profils aient matché, n'hésite pas à lui rappeler de confirmer le match si cela est réciproque !` });
                            try{
                                await interaction.guild.members.cache.get(i.user.id).roles.add(roleMatch);
                            } catch (error){
                                console.error('Erreur d\'ajout du rôle :', error);
                                await interaction.reply({ content: `Erreur lors de l'ajout du rôle <@${roleMatch}>, veuillez réessayer.`})
                            }
                        } else if (i.customId === 'echec') {
                            await i.reply({ content: 'Je suis désolé que le match n\'ait pas fonctionné, j\'espère que tu seras satisfait du prochain !' });
                            setTimeout(() => {
                                channelMatch.delete();
                           }, 3000);
                            // Ajouter ici la logique pour signaler un échec
                        } else if (i.customId === 'signaler') {
                            const reportModal = createReportModal();
                            await i.showModal(reportModal);
                        }
                    });

                } catch (error) {
                    console.error('Erreur lors de l\'envoi du message privé à l\'autre utilisateur :', error);
                    await interaction.followUp({
                        content: 'Erreur lors de l\'envoi du message privé à l\'autre utilisateur. Veuillez vérifier les paramètres de confidentialité de l\'utilisateur cible.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            } else if (i.customId === 'refuser') {
                await i.update({content: 'Vous avez refusé la demande.', components: []});
                try {
                    await utilisateurDemande.send({content: `<@${target.id}> a refusé ta demande de match.`});
                } catch (error) {
                    console.error('Erreur lors de l\'envoi du message privé à l\'autre utilisateur :', error);
                    await interaction.followUp({
                        content: 'Erreur lors de l\'envoi du message privé à l\'autre utilisateur. Veuillez vérifier les paramètres de confidentialité de l\'utilisateur cible.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            //Arrêt du listener
            interaction.client.off('interactionCreate', responseHandler);
        };

        //Ajout du listener
        interaction.client.on('interactionCreate', responseHandler);
    }
}