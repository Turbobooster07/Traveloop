/**
 * queries.js
 * 
 * Centralized file for all SQL queries used by the application.
 * Using a centralized file ensures that all teammates are using consistent queries 
 * and makes it easy to review database interactions.
 */

const userQueries = {
  // Check if a user already exists by email or username
  checkUserExists: `
    SELECT id FROM users 
    WHERE email = $1 OR username = $2
  `,

  // Insert a new user into the database
  registerUser: `
    INSERT INTO users (
      username, 
      password_hash, 
      first_name, 
      last_name, 
      email, 
      phone, 
      city, 
      country, 
      additional_info
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING id, username, email, first_name, last_name
  `,

  // Retrieve a user by username for login verification
  getUserByUsername: `
    SELECT id, username, password_hash, first_name, last_name, email 
    FROM users 
    WHERE username = $1
  `,

  // Retrieve a user by ID
  getUserById: `
    SELECT id, username, first_name, last_name, email, phone, city, country, additional_info, created_at 
    FROM users 
    WHERE id = $1
  `,
  
  // Update user profile information
  updateUserProfile: `
    UPDATE users 
    SET 
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      phone = COALESCE($3, phone),
      city = COALESCE($4, city),
      country = COALESCE($5, country),
      additional_info = COALESCE($6, additional_info)
    WHERE id = $7
    RETURNING id, username, email, first_name, last_name
  `
};



const tripQueries = {
  // Create a new trip for a user
  createTrip: `
    INSERT INTO trips (user_id, destination, start_date, end_date, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, destination, start_date, end_date, status, created_at
  `,
  
  // Get all trips for a specific user
  getTripsByUser: `
    SELECT id, destination, start_date, end_date, status, created_at
    FROM trips
    WHERE user_id = $1
    ORDER BY start_date ASC
  `
};

module.exports = {
  userQueries,
  tripQueries
};
