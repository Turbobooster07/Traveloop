const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const { userQueries, tripQueries } = require('./database/queries');

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

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(userQueries.getUserByUsername, [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (match) {
      // Remove password hash before sending user data
      delete user.password_hash;
      
      res.json({ 
        message: 'Login successful',
        user: user 
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new trip
app.post('/api/trips', async (req, res) => {
  try {
    const { user_id, destination, start_date, end_date, status } = req.body;
    
    if (!user_id || !destination || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(tripQueries.createTrip, [
      user_id, destination, start_date, end_date, status || 'Upcoming'
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user trips
app.get('/api/trips/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(tripQueries.getTripsByUser, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommendations (Mock data for now)
app.get('/api/recommendations', (req, res) => {
  const recommendations = [
    {
      id: 1,
      title: 'Snorkeling in Bali',
      location: 'Bali, Indonesia',
      description: 'Explore the vibrant coral reefs and marine life.',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 2,
      title: 'Eiffel Tower Tour',
      location: 'Paris, France',
      description: 'Skip the line and enjoy breathtaking views of Paris.',
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 3,
      title: 'Grand Canyon Helicopter',
      location: 'Arizona, USA',
      description: 'Experience the majesty of the canyon from the air.',
      image: 'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 4,
      title: 'Kyoto Temple Walk',
      location: 'Kyoto, Japan',
      description: 'Discover the serene beauty of ancient temples.',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600&h=400'
    }
  ];
  res.json(recommendations);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
