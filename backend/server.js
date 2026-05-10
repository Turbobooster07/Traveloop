const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'traveloop',
  password: process.env.PG_PASSWORD || 'password',
  port: process.env.PG_PORT || 5432,
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client (Make sure PostgreSQL is running)', err.stack);
  }
  console.log('Connected to PostgreSQL successfully');
  release();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Example Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phone, city, country, additionalInfo } = req.body;
  
  // Here we would typically hash the password and insert into DB
  try {
    // Example query:
    // const result = await pool.query(
    //   'INSERT INTO users (first_name, last_name, email, phone, city, country, additional_info) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    //   [firstName, lastName, email, phone, city, country, additionalInfo]
    // );
    
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error saving to DB:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // TODO: Verify against PostgreSQL
  if (username === 'test' && password === 'password') {
    res.json({ token: 'mock-jwt-token-12345', message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
