const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'traveloop',
  password: process.env.PG_PASSWORD || 'password',
  port: process.env.PG_PORT || 5432,
});

const schema = fs.readFileSync('./database/schema.sql', 'utf8');

pool.query(schema)
  .then(() => pool.query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS description TEXT;'))
  .then(() => {
    console.log('Schema applied successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error applying schema', err);
    process.exit(1);
  });
