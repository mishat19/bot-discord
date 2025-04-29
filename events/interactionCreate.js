const { Events, Collection, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createReportModal } = require('../commands/utility/signalement');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if(interaction.isModalSubmit()){
            if (interaction.customId === 'signalement') {
                const titre = interaction.fields.getTextInputValue('titre');
                const probleme = interaction.fields.getTextInputValue('probleme');

                const client = interaction.client;
                const channel = client.channels.cache.get('1364328269079646218');

                if (channel && channel.isTextBased()) {
                    //Embed
                    const exampleEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle(`Signalement de ${interaction.user.username}`)
                        //.setURL('https://discord.js.org/')
                        //.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                        .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                        //.setDescription('Formulaire')
                        //.setThumbnail('https://i.imgur.com/AfFp7pu.png')
                        .addFields(
                            { name: 'Signaleur :', value : `<@${interaction.user.id}>`},
                            { name: 'Motif du signalement :', value: titre },
                            //{ name: '\u200B', value: '\u200B' },
                            { name: 'Détails :', value: probleme, inline: true },
                        )
                        //.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
                        //.setImage('https://i.imgur.com/AfFp7pu.png')
                        .setTimestamp()
                        .setFooter({ text: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                    channel.send({ embeds: [exampleEmbed] });
                } else {
                    console.error('Channel not found or not a text channel.');
                }

                await interaction.reply({
                    content: `Motif de votre problème : ${titre} et les explications apportées : ${probleme}`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        } else if (interaction.isChatInputCommand()){
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            const { cooldowns } = interaction.client; //const cooldowns = interaction.client.cooldowns;

            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1_000);
                    return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, flags: MessageFlags.Ephemeral });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }
        } else if(interaction.isStringSelectMenu()){
            if(interaction.customId === 'starter'){
                for(const value in interaction.values){
                    if(value === 'introduction'){
                        interaction.reply({ content: `${interaction.client.user} est un bot de rencontre qui souhaite **créer des rencontres** entre personnes afin qu'elles puissent` +
                            `apprendre à se connaître. Le but est de pouvoir **créer de nouvelles amitiés** en ligne voir des amitiés dans la **vraie vie** !`, flags: MessageFlags.Ephemeral });
                    } else if(value === 'match'){
                        interaction.reply({ content: `Dès que tu trouves qu'un profil peut te correspondre et que tu aimerais faire connaissance avec la personne mais que tu as peur` +
                                `de lui envoyer un message, grâce à la commande **/match** tu peux lui envoyer une demande pour lui dire que tu aimerais apprendre à la connaître.\n` +
                                `⚠️ La personne et toi seul peuvent voir les messages du salon, **__le propriétaire garanti ne pas regarder__** les salons de Match (voir ${`<#${'1356023003095502921'}>`}) \n\n` +
                                `Cette personne recevra en MP ta demande de contact et pourra l'accepter (ou la refuser). Si la personne l'accepte, c'est déjà un bon signe, c'est que tu` +
                            `l'intéresse également ! Ensuite, un salon sera spécialement créé pour que vous puissiez discuter ensemble et apprendre à vous connaître !\n\n` +
                            `Enfin, tu recevras un message de ma part dans le salon, qui sera épinglé pour le retrouver facilement, et tu pourras appuyer sur le bouton` +
                            `**Match** si tu aimes beaucoup cette personne et que tu es satisfait(e) de ta conversation avec. Si ce n'est pas le cas, tu peux appuyer sur le bouton` +
                            `**Échec**, cela fermera ton Match avec la personne. Enfin, si tu rencontres un quelconque problème, tu peux envoyer un message au propriétaire du serveur` +
                            `via le bouton **Signaler**.`, flags: MessageFlags.Ephemeral });

                    } else if(value === 'interet'){
                        interaction.reply({ content: 'Le système de réaction des points d\'intérêt est très simple à comprendre, il fonctionne en 2 points : \n\n' +
                            '💌 +1pt pour montrer au destinataire que son message t\a plu et qu\'il est sur la bonne voie pour gagner ton intérêt\n' +
                            '💔 -1pt pour montrer au destinataire que son message t\'a déçu, blessé et qu\'il n\'a pas \n' +
                            '', flags: MessageFlags.Ephemeral });
                    }
                }
            }
        }
    },
};