const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
//const intents = new Discord.GatewayIntentBits(53608447);
const client = new Client({ intents: [GatewayIntentBits.Guilds] }); //Guild référence à un serveur Discord

//bot.on('ready', async () => { console.log(`${bot.user.tag} est connecté`);}) //Déclencher quand action
client.once(Events.ClientReady, readyClient => {
    console.log(`${readyClient.user.tag} est lancé !`);
});

client.login(token);