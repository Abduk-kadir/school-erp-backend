// config/databaseManager.js
const Sequelize = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const dbCache = new Map(); // year -> db instance

function getDatabaseName(year) {
  return `school_${year}`;        // ← Updated to match your actual DB name
}

async function createSequelizeForYear(year) {
  const dbName = getDatabaseName(year);

  const sequelize = new Sequelize(
    dbName,
    config.username,
    config.password,
    {
      host: config.host || 'localhost',
      dialect: config.dialect || 'mysql',
      logging: false,                    // Set to true only for debugging
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    }
  );

  const initModels = require('../models');
  const db = initModels(sequelize);

  await sequelize.authenticate();
  console.log(`✅ Database connected & cached: ${dbName} (Year: ${year})`);

  dbCache.set(year, db);
  return db;
}

async function getDbForYear(year) {
  if (!year) {
    throw new Error('School year is required');
  }

  if (dbCache.has(year)) {
    // console.log(`♻️ Reusing cached connection for year: ${year}`);
    return dbCache.get(year);
  }

  return await createSequelizeForYear(year);
}

// Optional: Close all connections when server shuts down
process.on('SIGINT', async () => {
  console.log('Closing all database connections...');
  for (const [year, db] of dbCache) {
    await db.sequelize.close();
  }
});

module.exports = {
  getDbForYear,
  getDatabaseName
};