// Script to create admin user with proper bcrypt hash
import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Admin credentials - CHANGE THESE IF YOU WANT
const ADMIN_EMAIL = 'artifaura28@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';
const ADMIN_PHONE = '1234567890';

async function createAdmin() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔐 Generating password hash...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('✅ Hash generated:', hashedPassword);

    console.log('\n🗑️  Removing old admin accounts with invalid passwords...');
    await pool.query("DELETE FROM users WHERE password = '$2a$10$YourHashedPasswordHere'");
    
    console.log('🔍 Checking if admin already exists...');
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [ADMIN_EMAIL]);
    
    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Updating password and role...');
      await pool.query(
        'UPDATE users SET password = $1, role = $2, name = $3 WHERE email = $4',
        [hashedPassword, 'admin', ADMIN_NAME, ADMIN_EMAIL]
      );
      console.log('✅ Admin user updated successfully!');
    } else {
      console.log('➕ Creating new admin user...');
      await pool.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5)',
        [ADMIN_NAME, ADMIN_EMAIL, hashedPassword, ADMIN_PHONE, 'admin']
      );
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
