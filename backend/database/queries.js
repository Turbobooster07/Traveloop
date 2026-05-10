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
      additional_info,
      profile_pic
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING id, username, email, first_name, last_name, profile_pic
  `,

  // Retrieve a user by username for login verification
  getUserByUsername: `
    SELECT id, username, password_hash, first_name, last_name, email, profile_pic
    FROM users 
    WHERE username = $1
  `,

  // Retrieve a user by ID
  getUserById: `
    SELECT id, username, first_name, last_name, email, phone, city, country, additional_info, profile_pic, created_at 
    FROM users 
    WHERE id = $1
  `,
  
  // Update user profile information
  updateUserProfile: `
    UPDATE users 
    SET 
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      city = COALESCE($5, city),
      country = COALESCE($6, country),
      additional_info = COALESCE($7, additional_info),
      profile_pic = COALESCE($8, profile_pic)
    WHERE id = $9
    RETURNING id, username, email, first_name, last_name, phone, city, country, additional_info, profile_pic
  `,

  // Delete user account
  deleteUser: `
    DELETE FROM users WHERE id = $1
  `
};



const tripQueries = {
  // Create a new trip for a user
  createTrip: `
    INSERT INTO trips (user_id, destination, start_date, end_date, status, description)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, destination, start_date, end_date, status, description, created_at
  `,
  
  // Get all trips for a specific user
  getTripsByUser: `
    SELECT id, destination, start_date, end_date, status, description, created_at
    FROM trips
    WHERE user_id = $1
    ORDER BY start_date ASC
  `
};

module.exports = {
  userQueries,
  tripQueries
};
