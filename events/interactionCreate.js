const { Events, Collection, MessageFlags, GatewayIntentBits} = require('discord.js');

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
                    await channel.send(`User: <@${interaction.user.id}>\nMotif du problème : ${titre}\nExplications : ${probleme}`);
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
            //} else if (interaction.isButton()){

            //} else if (interaction.isStringSelectMenu()){

            //}
        }
    },
};