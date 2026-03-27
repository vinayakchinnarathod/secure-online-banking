-- =========================================
-- SECURE BANK DATABASE SETUP SCRIPT
-- =========================================
-- Run this script in MySQL Workbench
-- =========================================

-- Create Database
CREATE DATABASE IF NOT EXISTS secure_bank;
USE secure_bank;

-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- KYC TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS kyc (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    full_name VARCHAR(100),
    aadhaar_number VARCHAR(12),
    pan_number VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    submission_date DATE DEFAULT (CURRENT_DATE),
    reviewed_date DATE,
    reviewed_by VARCHAR(50),
    passport_photo VARCHAR(255),
    aadhaar_card VARCHAR(255),
    pan_card VARCHAR(255),
    address_proof VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- LOANS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    principal DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INT NOT NULL,
    emi_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- TRANSACTIONS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    type VARCHAR(10) NOT NULL, -- CREDIT or DEBIT
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    timestamp VARCHAR(50),
    reference_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- CHECKBOOK REQUESTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS checkbook_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    account_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING',
    request_date DATE DEFAULT (CURRENT_DATE),
    processed_date DATE,
    processed_by VARCHAR(50),
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================
-- INSERT SAMPLE DATA
-- =========================================

-- Insert Admin User (password: admin123)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoMeuIjKmg.6mGOqjV2jA2QK1yX0sK9Yq', 'ADMIN')
ON DUPLICATE KEY UPDATE role = 'ADMIN';

-- Insert Test Users (password: user123)
INSERT INTO users (username, password, role) VALUES 
('john_doe', '$2a$10$N.zmdr9k7uOCQb376NoMeuIjKmg.6mGOqjV2jA2QK1yX0sK9Yq', 'USER'),
('jane_smith', '$2a$10$N.zmdr9k7uOCQb376NoMeuIjKmg.6mGOqjV2jA2QK1yX0sK9Yq', 'USER')
ON DUPLICATE KEY UPDATE role = 'USER';

-- Insert Sample KYC Data
INSERT INTO kyc (user_id, username, full_name, aadhaar_number, pan_number, address, phone_number, email, status) VALUES
(2, 'john_doe', 'John Doe', '123456789012', 'ABCDE1234F', '123 Main St, Mumbai, Maharashtra 400001', '9876543210', 'john.doe@email.com', 'APPROVED'),
(3, 'jane_smith', 'Jane Smith', '987654321098', 'FGHIJ5678K', '456 Park Ave, Delhi, Delhi 110001', '9876543211', 'jane.smith@email.com', 'PENDING')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Insert Sample Loans
INSERT INTO loans (user_id, username, principal, interest_rate, tenure_months, emi_amount, status) VALUES
(2, 'john_doe', 50000.00, 8.5, 24, 2261.50, 'APPROVED'),
(3, 'jane_smith', 25000.00, 9.0, 12, 2181.25, 'PENDING')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Insert Sample Transactions
INSERT INTO transactions (user_id, username, type, amount, description, timestamp) VALUES
(2, 'john_doe', 'CREDIT', 50000.00, 'Salary Credit', '2024-03-01 10:30:00'),
(2, 'john_doe', 'DEBIT', 15000.00, 'Rent Payment', '2024-03-02 09:15:00'),
(2, 'john_doe', 'DEBIT', 5000.00, 'Shopping', '2024-03-03 14:20:00'),
(3, 'jane_smith', 'CREDIT', 35000.00, 'Salary Credit', '2024-03-01 10:30:00'),
(3, 'jane_smith', 'DEBIT', 8000.00, 'Grocery Shopping', '2024-03-02 11:45:00')
ON DUPLICATE KEY UPDATE amount = VALUES(amount);

-- Insert Sample Checkbook Requests
INSERT INTO checkbook_requests (user_id, username, account_number, status) VALUES
(2, 'john_doe', 'XXXX-XXXX-1234', 'APPROVED'),
(3, 'jane_smith', 'XXXX-XXXX-5678', 'PENDING')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- =========================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =========================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_kyc_user_id ON kyc(user_id);
CREATE INDEX idx_kyc_status ON kyc(status);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_username ON transactions(username);
CREATE INDEX idx_checkbook_user_id ON checkbook_requests(user_id);
CREATE INDEX idx_checkbook_status ON checkbook_requests(status);

-- =========================================
-- VERIFY SETUP
-- =========================================
SELECT 'Database setup completed!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_kyc FROM kyc;
SELECT COUNT(*) as total_loans FROM loans;
SELECT COUNT(*) as total_transactions FROM transactions;
SELECT COUNT(*) as total_checkbook_requests FROM checkbook_requests;
