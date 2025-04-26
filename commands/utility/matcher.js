const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, MessageFlags } = require('discord.js');

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
            //.setEmoji('💗')
            .setStyle(ButtonStyle.Success)

        const echec = new ButtonBuilder()
            .setCustomId('echec')
            .setLabel('Échec')
            //.setEmoji('💥')
            .setStyle(ButtonStyle.Secondary)

        const signaler = new ButtonBuilder()
            .setCustomId('signaler')
            .setLabel('Signaler')
            //.setEmoji('👁️‍🗨️')
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder()
            .addComponents(envoyer, annuler)

        const reponseTarget = new ActionRowBuilder()
            .addComponents(accepter, refuser)

        const matchEpingle = new ActionRowBuilder()
            .addComponents(match, echec, signaler)

        const envoi = await interaction.reply({
            content: `<@${interaction.user.id}>\n Veux-tu vraiment envoyer une demande à ${target} ?\n Cette personne recevra ta demande en Message Privé afin de valider ou refuser ta demande, vérifie bien d'avoir bien expliqué le motif de ta demande !`,
            components: [row],
            //withResponse: true,
            ephemeral: true,
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
                        content: `<@${interaction.user.id}> souhaite créer un MATCH avec toi pour raison(s) : "${motif}".\n\n Tu peux accepter ou refuser sa demande, c'est comme tu le souhaites ! Mais sache que la vie est faites de surprise 😉`,
                        components: [reponseTarget],
                    });
                } catch (error) {
                    console.error(`Erreur lors de l'envoi du MP au receveur :`, error);
                    await interaction.followUp({ content: 'Cet utilisateur ne peut pas recevoir de Messages Privé.', ephemeral: true });
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
                            type: 0
                    });
                    const messageMatch = await channelMatch.send({
                        content: 'Bienvenue dans votre salon !',
                        components: [matchEpingle],
                        fetchReply: true //Récupérer message
                    });
                    await messageMatch.pin();

                } catch (error) {
                    console.error('Erreur lors de l\'envoi du message privé à l\'autre utilisateur :', error);
                    await interaction.followUp({
                        content: 'Erreur lors de l\'envoi du message privé à l\'autre utilisateur. Veuillez vérifier les paramètres de confidentialité de l\'utilisateur cible.',
                        ephemeral: true
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
                        ephemeral: true
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