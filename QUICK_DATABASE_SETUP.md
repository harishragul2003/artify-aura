# Quick Database Setup Guide

## The Error
`relation "supabase_migrations.schema_migrations" does not exist`

This is a harmless Supabase internal error. The real issue is your database tables might not be created yet.

## Solution: Create Database Tables

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com
   - Login and select your project
   - Make sure project is not paused (click Resume if needed)

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Schema**
   - Open `backend/database/schema-safe.sql` in your project
   - Copy ALL the content (Ctrl+A, Ctrl+C)

4. **Run the Schema**
   - Paste into the SQL Editor
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for "Success" message

5. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see tables: users, products, categories, orders, order_items

### Option 2: Using Command Line

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## What Tables Should Exist

After running the schema, you should have:

1. **users** - User accounts (customers and admins)
2. **categories** - Product categories
3. **products** - Products for sale
4. **orders** - Customer orders
5. **order_items** - Items in each order

## Verify Setup

After creating tables, restart your backend:

```bash
cd backend
npm start
```

You should see:
```
✅ Database connection test successful
✅ Connected to PostgreSQL database
🚀 Server running on port 5000
```

## Create Admin User

After tables are created, create an admin user:

```bash
cd backend
node create-admin.js
```

Or manually in Supabase SQL Editor:

```sql
-- Create admin user (change email and password)
INSERT INTO users (name, email, password, role) 
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere',
  'admin'
);
```

To hash a password, use:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"
```

## Test Connection

Try logging in with a test user or creating a new account through the frontend.

## Still Having Issues?

Check:
1. ✅ Supabase project is active (not paused)
2. ✅ Database credentials in `.env` are correct
3. ✅ Tables exist in Supabase Table Editor
4. ✅ Backend server shows "Database connection test successful"

---

**Quick Check**: Go to Supabase → Table Editor. If you see no tables, run the schema!
