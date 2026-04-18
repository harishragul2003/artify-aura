import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL if available (Render provides this), otherwise use individual vars
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
      max: 3,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      family: 4,
    });

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    host: process.env.DB_HOST
  });
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connection test successful'))
  .catch(err => {
    console.error('❌ Database connection test failed:', err.message);
    console.error('Please check your database credentials in .env file');
  });

export default pool;
