USE feedback_system;

-- Drop tables in correct order (due to foreign key constraints)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;