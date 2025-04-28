const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
//Récupérer tous les dossiers de COMMANDS (utility)
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    //Récupérer tous les fichiers des dossiers de COMMANDS (ici ceux d'UTILITY)
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Prendre SlashCommandBuilder#toJSON() export de chaque commande pour deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

//Interaction avec API
const rest = new REST().setToken(token);

//Déployer commandes
(async () => {
    try {
        console.log(`Rafraichissement ${commands.length} commandes application (/).`);

        //La méthode PUT pour rafraichir toutes commandes du serveur avec le SET courant
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            //Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Réussite rechargement ${data.length} commandes application (/).`);
    } catch (error) {
        console.error(error);
    }
})();