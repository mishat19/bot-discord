const { Events, PresenceUpdateStatus, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        //client.user.setPresence({ activities: [{ name: 'Creating a match relations system', type: ActivityType.Watching }], status: PresenceUpdateStatus.Online });
        client.user.setActivity('Creating a Meetic bot');
    },
};