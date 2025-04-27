const fs = require('node:fs'); //Lire dossier commandes
const path = require('node:path'); //Aide accéder fichiers/dossiers
const { Client, Collection, Events, GatewayIntentBits, PresenceUpdateStatus } = require('discord.js');
const { token } = require('./config.json');
//const intents = new Discord.GatewayIntentBits(53608447);
const client = new Client({ intents: [GatewayIntentBits.Guilds] }); //Guild référence à un serveur Discord

client.commands = new Collection(); //Class Collection extension de map
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.cooldowns = new Collection(); //Key = commande, Value = dernière utilisation par utilisateur

//Ajout de réactions intérêts
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.name === '👍') {
        if (!user.bot) {
            require('./reactionHandler')(client, reaction, user);
        }
    }
});

client.login(token);