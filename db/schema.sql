-- Step 1: Create Schema
CREATE SCHEMA IF NOT EXISTS water_management;

-- Step 2: Set Schema for Session
SET search_path TO water_management;

-- Step 3: Create Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    phone_number VARCHAR(20),
    address TEXT,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')),
    water_account_id INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create Water Accounts Table
CREATE TABLE water_accounts (
    water_account_id SERIAL PRIMARY KEY,
    street_address TEXT NOT NULL,
    association VARCHAR(255) NOT NULL
);

-- Step 5: Create Roles Table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL
);

-- Step 6: Create User Roles Table (Many-to-Many Relationship)
CREATE TABLE user_roles (
    user_id INT REFERENCES water_management.users(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES water_management.roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Step 7: Create Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES water_management.users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50),
    priority VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create Tasks Table
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    technician_id INT REFERENCES water_management.users(user_id) ON DELETE SET NULL,
    task_name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: Create Issues Table
CREATE TABLE issues (
    issue_id SERIAL PRIMARY KEY,
    reported_by INT REFERENCES water_management.users(user_id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20),
    category VARCHAR(100),
    location TEXT,
    gps_coordinates VARCHAR(50),
    status VARCHAR(50),
    image_url TEXT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 10: Create Articles Table (Education Feature)
CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 11: Create User Bookmarks Table
CREATE TABLE user_bookmarks (
    bookmark_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES water_management.users(user_id) ON DELETE CASCADE,
    article_id INT REFERENCES water_management.articles(article_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
