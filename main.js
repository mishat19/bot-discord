const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
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

client.cooldowns = new Collection();

//--------------------- POSITIF INTERET ---------------------

let removed = false;

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (reaction.emoji.name === '💌') {
            if (!user.bot) {
                removed = false;
                await require('./reactions/interet-positif')(client, reaction, user, removed);
            }
        }
    } catch (error) {
        console.log(error);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (reaction.emoji.name === '💌') {
            if (!user.bot) {
                removed = true;
                await require('./reactions/interet-positif')(client, reaction, user, removed);
            }
        }
    } catch (error) {
        console.log(error);
    }
});

//--------------------- NEGATIF INTERET ---------------------

client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (reaction.emoji.name === '💔') {
            if (!user.bot) {
                removed = false;
                await require('./reactions/interet-negatif')(client, reaction, user, removed);
            }
        }
    } catch (error) {
        console.log(error);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (reaction.emoji.name === '💔') {
            if (!user.bot) {
                removed = true;
                await require('./reactions/interet-negatif')(client, reaction, user, removed);
            }
        }
    } catch (error) {
        console.log(error);
    }
});

client.login(token);
