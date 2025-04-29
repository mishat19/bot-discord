const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

//Init Sequelize
const sequelize = new Sequelize({
    //host: 'localhost',
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'database.db'),
});

//Table INTEREST
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
        beforeCreate: (interest) => {
            interest.ptsInterets = interest.ptsPositifs - interest.ptsNegatifs;
        },
        beforeUpdate: (interest) => {
            interest.ptsInterets = interest.ptsPositifs - interest.ptsNegatifs;
        }
    }
});

//Init base de données
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await Interest.sync(); // Synchroniser le modèle avec la base de données
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

//Ajouter/MAJ points POSITIFS d'intérêts
async function PositifsInteretPoints(envoyeur, receveur, points) {
    const [interest, created] = await Interest.findOrCreate({
        where: { envoyeur, receveur },
        defaults: { ptsPositifs: points }
    });

    if (!created) {
        interest.ptsPositifs += points;
        await interest.save();
    }
}

//Supprimer/MAJ points NEGATIFS d'intérêts
async function NegatifsInteretPoints(envoyeur, receveur, points) {
    const [interest, created] = await Interest.findOrCreate({
        where: { envoyeur, receveur },
        defaults: { ptsNegatifs: points }
    });

    if (!created) {
        interest.ptsNegatifs += points;
        await interest.save();
    }
}

//Points d'intérêt entre envoyeur/receveur
async function getInterestPoints(envoyeur, receveur) {
    const interest = await Interest.findOne({
        where: { envoyeur, receveur }
    });
    return interest ? interest.ptsInterets : 0;
}

//Détail points d'intérêt entre envoyeur/receveur
async function getDetailInterestPoints(envoyeur, receveur) {
    const interest = await Interest.findOne({
        where: { envoyeur, receveur }
    });
    return [interest.ptsPositifs, interest.ptsNegatifs];
}

module.exports = {
    initializeDatabase,
    PositifsInteretPoints,
    NegatifsInteretPoints,
    getInterestPoints,
    getDetailInterestPoints,
};