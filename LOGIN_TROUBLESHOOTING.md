# Login Server Error - Troubleshooting Guide

## Issue
Users are getting a "Server error" message when trying to login.

## Recent Changes
Added detailed error logging to the auth controller to help diagnose the issue.

## Diagnostic Steps

### 1. Check Backend Server Status
```bash
# Make sure the backend is running
cd backend
npm start
```

Look for:
- ✅ "Server running on port 5000"
- ✅ "Database connected successfully"
- ❌ Any error messages

### 2. Check Database Connection
```bash
# Test database connection
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Artify Aura API is running"
}
```

### 3. Check if Users Exist in Database
The database needs at least one user to test login. Check if you have any users:

**Option A: Using Supabase Dashboard**
1. Go to https://supabase.com
2. Open your project
3. Go to Table Editor → users table
4. Check if there are any users

**Option B: Create a test user**
```bash
# Register a new user through the API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

### 4. Test Login with Detailed Logs
Now the backend has detailed logging. When you try to login, check the backend console for:

```
🔐 Login attempt for email: test@example.com
🔍 Searching for user in database...
✅ User found: { id: '...', email: 'test@example.com', role: 'user' }
🔑 Verifying password...
✅ Password verified
✅ Token generated successfully
✅ Login successful for: test@example.com
```

### 5. Common Error Messages

**Error: "User not found"**
```
❌ User not found: test@example.com
```
**Solution**: Register the user first or check the email spelling

**Error: "Password mismatch"**
```
❌ Password mismatch for user: test@example.com
```
**Solution**: Check the password is correct

**Error: Database connection**
```
❌ Login error: Error: connect ECONNREFUSED
```
**Solution**: Check database credentials in `.env` file

**Error: Missing fields**
```
❌ Missing email or password
```
**Solution**: Ensure both email and password are provided

### 6. Check Environment Variables
Make sure your `backend/.env` file has:

```env
# Database
DB_HOST=db.kmcwivtntaacrgivevww.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=HarishRagulk@2003

# JWT
JWT_SECRET=0a9265cdda0b5abbfea291439c8b04d48182c06a4f5cc7da71c8e5b737a33f75
```

### 7. Check Frontend API URL
Make sure your `frontend/.env` file has:

```env
VITE_API_URL=http://localhost:5000/api
```

### 8. Test Login via API Directly
```bash
# Test login endpoint directly
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### 9. Check Browser Console
Open browser DevTools (F12) and check:
- Network tab: Look for the login request
- Console tab: Look for any JavaScript errors
- Check the response from the server

### 10. CORS Issues
If you see CORS errors in the browser console:

```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**: The backend already has CORS configured for localhost:5173, but restart the backend server.

## Quick Fix Checklist

- [ ] Backend server is running
- [ ] Database connection is working
- [ ] At least one user exists in the database
- [ ] Environment variables are set correctly
- [ ] Frontend is pointing to correct API URL
- [ ] No CORS errors in browser console
- [ ] Check backend console for detailed error logs

## Create Admin User

If you need to create an admin user:

```bash
cd backend
node create-admin.js
```

Or manually via SQL in Supabase:
```sql
INSERT INTO users (name, email, password, role) 
VALUES (
  'Admin User', 
  'admin@artifyaura.com', 
  '$2a$10$YourHashedPasswordHere', 
  'admin'
);
```

## Still Having Issues?

1. **Restart everything**:
   ```bash
   # Stop backend (Ctrl+C)
   # Stop frontend (Ctrl+C)
   
   # Start backend
   cd backend
   npm start
   
   # Start frontend (in new terminal)
   cd frontend
   npm run dev
   ```

2. **Check the backend logs** - The detailed logging will show exactly where the error occurs

3. **Try registering a new user** instead of logging in - This will test if the database connection works

4. **Check Supabase dashboard** - Make sure your database is active and not paused

---

**Last Updated**: March 9, 2026
**Status**: Enhanced error logging added
