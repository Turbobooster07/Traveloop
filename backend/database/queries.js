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

const communityQueries = {
  // Create a new community post
  createPost: `
    INSERT INTO community_posts (user_id, content, tags, image_url)
    VALUES ($1, $2, $3, $4)
    RETURNING id, content, tags, image_url, created_at
  `,
  
  // Get all community posts with user info
  getAllPosts: `
    SELECT p.id, p.content, p.tags, p.image_url, p.created_at, u.first_name, u.last_name, u.profile_pic
    FROM community_posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `
};

const billingQueries = {
  // Get all invoices for a user
  getInvoicesByUser: `
    SELECT i.*, t.destination as trip_name
    FROM invoices i
    LEFT JOIN trips t ON i.trip_id = t.id
    WHERE i.user_id = $1
    ORDER BY i.due_date ASC
  `,

  // Create a new invoice
  createInvoice: `
    INSERT INTO invoices (user_id, trip_id, amount, due_date, status, description)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,

  // Get payments for an invoice
  getPaymentsByInvoice: `
    SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC
  `,

  // Record a payment
  createPayment: `
    INSERT INTO payments (invoice_id, amount, payment_method, transaction_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,

  // Update invoice status
  updateInvoiceStatus: `
    UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
  `,

  // Get total budgeted from itinerary for a trip
  getItineraryBudget: `
    SELECT COALESCE(SUM(budget), 0) as total_budget
    FROM itinerary_stops s
    JOIN itinerary_cities c ON s.city_id = c.id
    JOIN itinerary_sections sec ON c.section_id = sec.id
    WHERE sec.trip_id = $1
  `
};

const expenseItemQueries = {
  // Get all expense items for a trip
  getExpensesByTrip: `
    SELECT * FROM expense_items WHERE trip_id = $1 ORDER BY created_at ASC
  `,

  // Get all expense items for a user
  getExpensesByUser: `
    SELECT * FROM expense_items WHERE user_id = $1 ORDER BY created_at DESC
  `,

  // Create a new expense item
  createExpenseItem: `
    INSERT INTO expense_items (user_id, trip_id, category, description, quantity_details, unit_cost, total_amount)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  // Update an expense item
  updateExpenseItem: `
    UPDATE expense_items 
    SET 
      category = $1, 
      description = $2, 
      quantity_details = $3, 
      unit_cost = $4, 
      total_amount = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
  `,

  // Delete an expense item
  deleteExpenseItem: `
    DELETE FROM expense_items WHERE id = $1 RETURNING id
  `
};

module.exports = {
  userQueries,
  tripQueries,
  communityQueries,
  billingQueries,
  expenseItemQueries
};
