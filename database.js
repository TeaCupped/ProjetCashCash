const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'cashcash.db');
const db = new DatabaseSync(dbPath);

module.exports = db;
