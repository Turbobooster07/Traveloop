const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const { userQueries } = require('./database/queries');

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

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phone, city, country, additionalInfo } = req.body;
  
  try {
    // Generate username (e.g. "john4512")
    const randomNum = crypto.randomInt(1000, 9999);
    const username = `${firstName.toLowerCase()}${randomNum}`;
    
    // Generate a smaller random password (3 chars hex = 6 characters)
    const plainPassword = crypto.randomBytes(3).toString('hex');
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    // Save to database
    const result = await pool.query(
      userQueries.registerUser,
      [username, passwordHash, firstName, lastName, email, phone, city, country, additionalInfo]
    );
    
    // Return the plain-text credentials so the frontend can display them to the user
    res.status(201).json({ 
      message: 'User registered successfully!',
      credentials: {
        username: username,
        password: plainPassword
      }
    });
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
