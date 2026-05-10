const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const https = require('https');
require('dotenv').config();

const { userQueries, tripQueries, communityQueries } = require('./database/queries');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

  // Ensure necessary columns exist for migrations
  const migrations = [
    { table: 'users', column: 'profile_pic', type: 'TEXT' },
    { table: 'community_posts', column: 'image_url', type: 'TEXT' }
  ];

  const runMigrations = async () => {
    for (const m of migrations) {
      try {
        await pool.query(`
          DO $$ 
          BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${m.table}' AND column_name='${m.column}') THEN
              ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type};
            END IF;
          END $$;
        `);
      } catch (err) {
        console.error(`Migration error for ${m.table}.${m.column}:`, err);
      }
    }
    release();
  };

  runMigrations();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phone, city, country, additionalInfo } = req.body;
  
  try {
    const randomNum = crypto.randomInt(1000, 9999);
    const username = `${firstName.toLowerCase()}${randomNum}`;
    const plainPassword = crypto.randomBytes(3).toString('hex');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const result = await pool.query(
      userQueries.registerUser,
      [username, passwordHash, firstName, lastName, email, phone, city, country, additionalInfo, null]
    );
    
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS itinerary_cities (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES itinerary_sections(id) ON DELETE CASCADE,
        city_name VARCHAR(255) NOT NULL,
        city_order INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS itinerary_stops (
        id SERIAL PRIMARY KEY,
        city_id INTEGER REFERENCES itinerary_cities(id) ON DELETE CASCADE,
        stop_name VARCHAR(255) NOT NULL,
        stop_type VARCHAR(50),
        description TEXT,
        timing VARCHAR(100),
        check_in TIME,
        check_out TIME,
        budget NUMERIC(12,2),
        stop_order INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try { await pool.query(`ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS check_in TIME`); } catch (e) {}
    try { await pool.query(`ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS check_out TIME`); } catch (e) {}

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
      const sectionRow = result.rows[0];

      const cities = s.cities || [];
      const insertedCities = [];
      for (let j = 0; j < cities.length; j++) {
        const city = cities[j];
        if (!city.city_name) continue;
        const cityResult = await pool.query(
          `INSERT INTO itinerary_cities (section_id, city_name, city_order)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [sectionRow.id, city.city_name, j + 1]
        );
        const cityRow = cityResult.rows[0];

        const stops = city.stops || [];
        const insertedStops = [];
        for (let k = 0; k < stops.length; k++) {
          const stop = stops[k];
          if (!stop.stop_name) continue;
          const stopResult = await pool.query(
            `INSERT INTO itinerary_stops (city_id, stop_name, stop_type, description, timing, check_in, check_out, budget, stop_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
              cityRow.id,
              stop.stop_name,
              stop.stop_type || null,
              stop.description || null,
              stop.timing || null,
              stop.check_in || null,
              stop.check_out || null,
              stop.budget ? parseFloat(stop.budget) : null,
              k + 1
            ]
          );
          insertedStops.push(stopResult.rows[0]);
        }
        cityRow.stops = insertedStops;
        insertedCities.push(cityRow);
      }
      sectionRow.cities = insertedCities;
      inserted.push(sectionRow);
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
    const sectionResult = await pool.query(
      `SELECT * FROM itinerary_sections WHERE trip_id = $1 ORDER BY section_order ASC`,
      [tripId]
    );
    const sections = sectionResult.rows;

    for (const section of sections) {
      const cityResult = await pool.query(
        `SELECT * FROM itinerary_cities WHERE section_id = $1 ORDER BY city_order ASC`,
        [section.id]
      );
      const cities = cityResult.rows;

      for (const city of cities) {
        const stopResult = await pool.query(
          `SELECT * FROM itinerary_stops WHERE city_id = $1 ORDER BY stop_order ASC`,
          [city.id]
        );
        city.stops = stopResult.rows;
      }
      section.cities = cities;
    }
    res.json(sections);
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create/Update Day Plans for a trip
app.post('/api/day-plans', async (req, res) => {
  const { trip_id, user_id, days } = req.body;
  if (!user_id || !days) return res.status(400).json({ error: 'Missing required fields' });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS day_plans (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        day_number INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS day_plan_activities (
        id SERIAL PRIMARY KEY,
        day_plan_id INTEGER REFERENCES day_plans(id) ON DELETE CASCADE,
        activity_text VARCHAR(255),
        expense NUMERIC(12,2),
        activity_order INTEGER
      )
    `);

    if (trip_id) {
      await pool.query('DELETE FROM day_plans WHERE trip_id = $1', [trip_id]);
    }

    const insertedDays = [];
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      const result = await pool.query(
        `INSERT INTO day_plans (trip_id, user_id, day_number) VALUES ($1, $2, $3) RETURNING *`,
        [trip_id || null, user_id, d.dayNumber]
      );
      const dayRow = result.rows[0];

      const activities = d.activities || [];
      const insertedActivities = [];
      for (let j = 0; j < activities.length; j++) {
        const act = activities[j];
        if (!act.text && !act.expense) continue;
        const actResult = await pool.query(
          `INSERT INTO day_plan_activities (day_plan_id, activity_text, expense, activity_order) VALUES ($1, $2, $3, $4) RETURNING *`,
          [dayRow.id, act.text || '', act.expense ? parseFloat(act.expense) : null, j + 1]
        );
        insertedActivities.push(actResult.rows[0]);
      }
      dayRow.activities = insertedActivities;
      insertedDays.push(dayRow);
    }
    res.status(201).json({ message: 'Day plan saved successfully', days: insertedDays });
  } catch (error) {
    console.error('Day plan save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get day plans for a trip
app.get('/api/day-plans/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const dayResult = await pool.query(`SELECT * FROM day_plans WHERE trip_id = $1 ORDER BY day_number ASC`, [tripId]);
    const days = dayResult.rows;
    for (const day of days) {
      const actResult = await pool.query(`SELECT * FROM day_plan_activities WHERE day_plan_id = $1 ORDER BY activity_order ASC`, [day.id]);
      day.activities = actResult.rows;
    }
    res.json(days);
  } catch (error) {
    res.json([]);
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
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, email, phone, city, country, additional_info, profile_pic } = req.body;
    const result = await pool.query(userQueries.updateUserProfile, [
      first_name, last_name, email, phone, city, country, additional_info, profile_pic, userId
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Packing Checklist Endpoints
app.get('/api/packing/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await pool.query('SELECT * FROM packing_items WHERE trip_id = $1 ORDER BY id ASC', [tripId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get packing items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/packing/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items array is required' });
    const inserted = [];
    for (const item of items) {
      const result = await pool.query(
        'INSERT INTO packing_items (trip_id, item_name, category) VALUES ($1, $2, $3) RETURNING *',
        [tripId, item.item_name, item.category]
      );
      inserted.push(result.rows[0]);
    }
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Create packing items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/packing/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { is_packed } = req.body;
    const result = await pool.query('UPDATE packing_items SET is_packed = $1 WHERE id = $2 RETURNING *', [is_packed, itemId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update packing item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/packing/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    await pool.query('DELETE FROM packing_items WHERE id = $1', [itemId]);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete packing item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommendations (Mock data)
app.get('/api/recommendations', (req, res) => {
  const recommendations = [
    { id: 1, title: 'Snorkeling in Bali', location: 'Bali, Indonesia', description: 'Explore coral reefs.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 2, title: 'Eiffel Tower Tour', location: 'Paris, France', description: 'Breathtaking views.', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 3, title: 'Grand Canyon Helicopter', location: 'Arizona, USA', description: 'Majesty from air.', image: 'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 4, title: 'Kyoto Temple Walk', location: 'Kyoto, Japan', description: 'Serene ancient temples.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 5, title: 'Santorini Sunset Cruise', location: 'Santorini, Greece', description: 'Famous sunset.', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 6, title: 'Machu Picchu Trek', location: 'Cusco, Peru', description: 'Historic Inca trail.', image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 7, title: 'Northern Lights Safari', location: 'Tromso, Norway', description: 'Aurora borealis.', image: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 8, title: 'Great Barrier Reef Dive', location: 'Queensland, Australia', description: 'Worlds largest reef.', image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=600&h=400' },
    { id: 9, title: 'Banff National Park', location: 'Alberta, Canada', description: 'Turquoise lakes.', image: 'https://images.unsplash.com/photo-1561134643-66c98f98126d?auto=format&fit=crop&q=80&w=600&h=400' }
  ];
  res.json(recommendations);
});

// Community Endpoints
app.get('/api/community/posts', async (req, res) => {
  try {
    const result = await pool.query(communityQueries.getAllPosts);
    res.json(result.rows);
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/community/posts', async (req, res) => {
  try {
    const { user_id, content, tags, image_url } = req.body;
    const result = await pool.query(communityQueries.createPost, [user_id, content, tags, image_url]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed Community Data (if empty)
const seedCommunity = async () => {
  try {
    const check = await pool.query('SELECT count(*) FROM community_posts');
    if (parseInt(check.rows[0].count) === 0) {
      const users = await pool.query('SELECT id FROM users LIMIT 5');
      if (users.rows.length > 0) {
        const posts = [
          ['Exploring the hidden gems of Kyoto was a dream come true! The temples are so serene.', 'Kyoto, Serene, Japan'],
          ['Bali never fails to amaze. The beaches and the culture are unmatched.', 'Bali, Beach, Culture'],
          ['Just back from Paris. The food is to die for!', 'Paris, Foodie, Travel'],
          ['A weekend in the mountains is all I needed.', 'Mountains, Nature, Weekend'],
          ['The Northern Lights in Norway were breathtaking.', 'Norway, NorthernLights, Magic']
        ];
        for (let i = 0; i < posts.length; i++) {
          const userId = users.rows[i % users.rows.length].id;
          await pool.query(communityQueries.createPost, [userId, posts[i][0], posts[i][1]]);
        }
        console.log('Community data seeded');
      }
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};
seedCommunity();

// --- Community Likes ---
app.post('/api/community/posts/:postId/like', async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [postId, user_id]
    );
    res.status(200).json({ message: 'Post liked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// --- Community Comments ---
app.get('/api/community/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(`
      SELECT c.id, c.content, c.created_at, u.first_name, u.last_name, u.profile_pic
      FROM community_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/community/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { user_id, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO community_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, user_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ==================== ADMIN API ENDPOINTS ====================

// Admin: Get all users with trip counts
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.city,
        u.country,
        u.created_at,
        COUNT(t.id)::INTEGER AS trip_count
      FROM users u
      LEFT JOIN trips t ON t.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get popular destinations (cities) from trips
app.get('/api/admin/cities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        destination AS name,
        COUNT(*)::INTEGER AS visit_count,
        COUNT(DISTINCT user_id)::INTEGER AS unique_users,
        MIN(start_date) AS first_visit,
        MAX(start_date) AS last_visit
      FROM trips
      GROUP BY destination
      ORDER BY visit_count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Admin get cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get popular activities from day_plan_activities
app.get('/api/admin/activities', async (req, res) => {
  try {
    // Check if the table exists first
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'day_plan_activities'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      return res.json([]);
    }

    const result = await pool.query(`
      SELECT 
        activity_text AS name,
        COUNT(*)::INTEGER AS count,
        COALESCE(SUM(expense), 0)::NUMERIC AS total_expense
      FROM day_plan_activities
      WHERE activity_text IS NOT NULL AND activity_text != ''
      GROUP BY activity_text
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Admin get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get summary stats for analytics/trends
app.get('/api/admin/stats', async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*)::INTEGER AS count FROM users');
    const tripCount = await pool.query('SELECT COUNT(*)::INTEGER AS count FROM trips');
    
    // Users registered per month (last 6 months)
    const userTrend = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        COUNT(*)::INTEGER AS users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    // Trips per month (last 6 months)
    const tripTrend = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        COUNT(*)::INTEGER AS trips
      FROM trips
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    // Trip status breakdown (for pie chart)
    const statusBreakdown = await pool.query(`
      SELECT 
        COALESCE(status, 'Unknown') AS name,
        COUNT(*)::INTEGER AS value
      FROM trips
      GROUP BY status
    `);

    // Top destinations (for bar chart)
    const topDestinations = await pool.query(`
      SELECT 
        destination AS name,
        COUNT(*)::INTEGER AS visits
      FROM trips
      GROUP BY destination
      ORDER BY visits DESC
      LIMIT 6
    `);

    // Most active users
    const activeUsers = await pool.query(`
      SELECT 
        u.first_name || ' ' || u.last_name AS name,
        COUNT(t.id)::INTEGER AS trips
      FROM users u
      JOIN trips t ON t.user_id = u.id
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY trips DESC
      LIMIT 5
    `);

    res.json({
      totalUsers: userCount.rows[0].count,
      totalTrips: tripCount.rows[0].count,
      userTrend: userTrend.rows,
      tripTrend: tripTrend.rows,
      statusBreakdown: statusBreakdown.rows,
      topDestinations: topDestinations.rows,
      activeUsers: activeUsers.rows
    });
  } catch (error) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// --- Trip Notes ---
app.get('/api/notes/:tripId', async (req, res) => {
  const { tripId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM trip_notes WHERE trip_id = $1 ORDER BY day_number ASC, created_at DESC',
      [tripId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  const { trip_id, title, content, day_number, stop_name, note_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trip_notes (trip_id, title, content, day_number, stop_name, note_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [trip_id, title, content, day_number, stop_name, note_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, day_number, stop_name, note_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE trip_notes SET title = $1, content = $2, day_number = $3, stop_name = $4, note_date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, content, day_number, stop_name, note_date, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM trip_notes WHERE id = $1', [id]);
    res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});
