const { Events } = require('discord.js');
const { initializeDatabase } = require('../database/database');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        //client.user.setPresence({ activities: [{ name: 'Creating a match relations system', type: ActivityType.Watching }], status: PresenceUpdateStatus.Online });
        client.user.setActivity('Creating a Meetic bot');

        initializeDatabase();

        //Récupération anciens messages
        client.guilds.cache.forEach(async guild => {
            guild.channels.cache.forEach(async channel => {
                if (channel.isTextBased()) {
                    try {
                        await channel.messages.fetch({ limit: 100 }); // Récupérer les 100 derniers messages
                        //console.log(`Messages récupérés dans le salon ${channel.name} de la guilde ${guild.name}.`);
                    } catch (error) {
                        console.error(`Erreur lors de la récupération des messages dans le salon ${channel.name} de la guilde ${guild.name}:`, error);
                    }
                }
            });
        });
    },
};