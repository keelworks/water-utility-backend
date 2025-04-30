-- Step 1: Create Schema
CREATE SCHEMA IF NOT EXISTS water_management;

-- Step 2: Set Schema for Session
SET search_path TO water_management;

-- Step 3: Create Users Table & role

-- Create Roles table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (role_name, description, permissions_json) VALUES
('admin', 'System administrator with full access', '{"can_manage_users": true, "can_manage_connections": true, "can_manage_billing": true, "can_manage_reports": true}'),
('technician', 'Field technician for installations and repairs', '{"can_view_connections": true, "can_update_meters": true, "can_manage_service_requests": true}'),
('consumer', 'Water service consumer/customer', '{"can_view_own_account": true, "can_report_issues": true, "can_view_usage": true, "can_pay_bills": true}');


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role_id INTEGER REFERENCES roles(role_id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- user details to store personal details
CREATE TABLE user_details (
    user_detail_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    -- date_of_birth DATE,
    gender VARCHAR(20),
    profile_picture_url VARCHAR(255),
    -- id_proof_type VARCHAR(50),
    -- id_proof_number VARCHAR(100),
    -- emergency_contact_name VARCHAR(200),
    -- emergency_contact_phone VARCHAR(20),
    notification_preferences_json JSONB DEFAULT '{"email": true, "sms": true, "push": false}',
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    -- Role-specific fields stored as JSONB for flexibility
    role_specific_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_details UNIQUE (user_id)
);

-- Create Addresses table
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    user_detail_id INTEGER REFERENCES user_details(user_detail_id) ON DELETE CASCADE,
    -- address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('billing', 'service', 'mailing')),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for addresses
CREATE INDEX idx_addresses_user_id ON addresses(user_detail_id);

-- Create Water Services table
CREATE TABLE water_services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('residential', 'commercial', 'industrial')),
    base_rate DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default water services
INSERT INTO water_services (service_name, description, service_type, base_rate) VALUES
('Residential Basic', 'Basic water connection for residential properties', 'residential', 25.00),
('Residential Premium', 'Premium water connection with higher flow rate', 'residential', 35.00),
('Commercial Standard', 'Standard water connection for small businesses', 'commercial', 50.00),
('Industrial Basic', 'Basic water connection for industrial use', 'industrial', 100.00);

-- Create Water Connection Accounts table
CREATE TABLE water_connection_accounts (
    connection_id SERIAL PRIMARY KEY,
    utility_service_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
    service_id INTEGER REFERENCES water_services(service_id) ON DELETE RESTRICT,
    address_id INTEGER REFERENCES addresses(address_id) ON DELETE RESTRICT,
    meter_number VARCHAR(50),
    installation_date DATE,
    connection_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (connection_status IN ('active', 'disconnected', 'pending', 'paused')),
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly')),
    connection_type VARCHAR(20) NOT NULL DEFAULT 'postpaid' CHECK (connection_type IN ('prepaid', 'postpaid')),
    meter_reading_method VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (meter_reading_method IN ('manual', 'smart')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for water connection accounts
CREATE INDEX idx_connections_user_id ON water_connection_accounts(user_id);
CREATE INDEX idx_connections_service_id ON water_connection_accounts(service_id);
CREATE INDEX idx_connections_address_id ON water_connection_accounts(address_id);
CREATE UNIQUE INDEX idx_utility_service_number ON water_connection_accounts(utility_service_number);


-- Step 6: Create User Roles Table (Many-to-Many Relationship)
CREATE TABLE user_roles (
    user_id INT REFERENCES water_management.users(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES water_management.roles(role_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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

