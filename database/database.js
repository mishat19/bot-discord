const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialiser Sequelize
const sequelize = new Sequelize('bot', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    storage: path.join(__dirname, 'data', 'database.db'),
});

// Définir un modèle pour la table 'interests'
const Interest = sequelize.define('Interest', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    envoyeur: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    receveur: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    ptsPositifs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    ptsNegatifs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    ptsInterets: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    hooks: {
        beforeCreate: (interest, options) => {
            interest.ptsInterets = interest.ptsPositifs - interest.ptsNegatifs;
        },
        beforeUpdate: (interest, options) => {
            interest.ptsInterets = interest.ptsPositifs - interest.ptsNegatifs;
        }
    }
});

// Fonction pour initialiser la base de données
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await Interest.sync(); // Synchroniser le modèle avec la base de données
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Fonction pour ajouter ou mettre à jour les points d'intérêts
async function addInterestPoints(envoyeur, receveur, points) {
    const [interest, created] = await Interest.findOrCreate({
        where: { envoyeur, receveur },
        defaults: { ptsPositifs: points }
    });

    if (!created) {
        interest.ptsPositifs += points;
        await interest.save();
    }
}

async function removeInterestPoints(envoyeur, receveur, points) {
    const [interest, created] = await Interest.findOrCreate({
        where: { envoyeur, receveur },
        defaults: { ptsNegatifs: points }
    });

    if (!created) {
        interest.ptsNegatifs += points;
        await interest.save();
    }
}

// Fonction pour récupérer les points d'intérêts entre deux utilisateurs
async function getInterestPoints(envoyeur, receveur) {
    const interest = await Interest.findOne({
        where: {
            [Sequelize.Op.or]: [
                { envoyeur, receveur },
                { envoyeur: receveur, receveur: envoyeur }
            ]
        }
    });
    return interest ? interest.ptsInterets : 0;
}

module.exports = {
    initializeDatabase,
    addInterestPoints,
    removeInterestPoints,
    getInterestPoints
};