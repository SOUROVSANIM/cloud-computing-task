require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require', // Supabase requires SSL
});

module.exports = sql;
