const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const https = require('https');
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

// Nominatim place search proxy
app.get('/api/places/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8&countrycodes=in`;

  const options = {
    headers: {
      'User-Agent': 'Traveloop/1.0 (travel planning app)',
      'Accept-Language': 'en'
    }
  };

  https.get(url, options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const places = JSON.parse(data);
        const results = places.map(p => ({
          name: p.display_name.split(',').slice(0, 3).join(',').trim(),
          full: p.display_name
        }));
        res.json(results);
      } catch (e) {
        res.json([]);
      }
    });
  }).on('error', () => res.json([]));
});

// Create a new trip
app.post('/api/trips', async (req, res) => {
  try {
    const { user_id, destination, start_date, end_date, status, description } = req.body;
    
    if (!user_id || !destination || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(tripQueries.createTrip, [
      user_id, destination, start_date, end_date, status || 'Upcoming', description || null
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create itinerary sections for a trip
app.post('/api/itinerary', async (req, res) => {
  const { trip_id, user_id, sections } = req.body;

  if (!user_id || !sections || sections.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Ensure itinerary_sections table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS itinerary_sections (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        description TEXT,
        from_date DATE,
        to_date DATE,
        budget NUMERIC(12,2),
        section_order INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Delete old sections for this trip if re-saving
    if (trip_id) {
      await pool.query('DELETE FROM itinerary_sections WHERE trip_id = $1', [trip_id]);
    }

    const inserted = [];
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const result = await pool.query(
        `INSERT INTO itinerary_sections (trip_id, user_id, title, description, from_date, to_date, budget, section_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          trip_id || null,
          user_id,
          s.title || `Section ${i + 1}`,
          s.description || null,
          s.from_date || null,
          s.to_date || null,
          s.budget ? parseFloat(s.budget) : null,
          i + 1
        ]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json({ message: 'Itinerary saved successfully', sections: inserted });
  } catch (error) {
    console.error('Itinerary save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get itinerary sections for a trip
app.get('/api/itinerary/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await pool.query(
      `SELECT * FROM itinerary_sections WHERE trip_id = $1 ORDER BY section_order ASC`,
      [tripId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get itinerary error:', error);
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

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(userQueries.getUserById, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
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
    },
    {
      id: 5,
      title: 'Santorini Sunset Cruise',
      location: 'Santorini, Greece',
      description: 'Sail across the caldera and watch the famous sunset.',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 6,
      title: 'Machu Picchu Trek',
      location: 'Cusco, Peru',
      description: 'Hike the historic Inca trail to the lost city.',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 7,
      title: 'Northern Lights Safari',
      location: 'Tromso, Norway',
      description: 'Chase the aurora borealis in the Arctic circle.',
      image: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 8,
      title: 'Great Barrier Reef Dive',
      location: 'Queensland, Australia',
      description: 'Scuba dive in the worlds largest coral reef system.',
      image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=600&h=400'
    },
    {
      id: 9,
      title: 'Banff National Park',
      location: 'Alberta, Canada',
      description: 'Explore the stunning turquoise lakes and mountains.',
      image: 'https://images.unsplash.com/photo-1561134643-66c98f98126d?auto=format&fit=crop&q=80&w=600&h=400'
    }
  ];
  res.json(recommendations);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
