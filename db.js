require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    ssl: process.env.PG_SSL_REQUIRE === 'true' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
