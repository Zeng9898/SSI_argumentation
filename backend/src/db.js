require('dotenv').config();
const { Pool } = require('pg');

// Docker Compose passes DATABASE_URL; local dev falls back to individual vars
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host:     process.env.POSTGRES_HOST || 'db',
      port:     parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB,
      user:     process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });

module.exports = pool;
