// config/db.js
const { Sequelize } = require('sequelize');

// Environment variables or hard-coded for the demo
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'water_service_db';
const DB_PORT = process.env.DB_PORT || 54321;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres', // important for Postgres
  logging: false,       // set to console.log if you want to see raw SQL
  dialectOptions: {
    // Optionally you can set searchPath here:
    // "options": { "searchPath": ["water_management", "public"] }
  },
  schema: 'water_management',  // Some versions of Sequelize support a top-level schema param

});

module.exports = sequelize;
