import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    console.log('📝 Registration attempt for email:', req.body.email);
    
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user exists
    console.log('🔍 Checking if user already exists...');
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log('💾 Creating new user...');
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, avatar_url, created_at',
      [name, email, hashedPassword, phone || null, 'user']
    );

    const user = result.rows[0];
    console.log('✅ User created:', { id: user.id, email: user.email });
    
    const token = generateToken(user.id);
    console.log('✅ Token generated');

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    });
    
    console.log('✅ Registration successful for:', email);
  } catch (error) {
    console.error('❌ Register error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt for email:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    console.log('🔍 Searching for user in database...');
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });

    // Check password
    console.log('🔑 Verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Password verified');
    const token = generateToken(user.id);
    console.log('✅ Token generated successfully');

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    });
    
    console.log('✅ Login successful for:', email);
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
