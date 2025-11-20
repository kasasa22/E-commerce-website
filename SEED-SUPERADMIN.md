# How to Seed a Superadmin User

## Method 1: Using Supabase Dashboard + SQL (Easiest)

### Step 1: Create User in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users** → **Add User**
3. Fill in:
   - **Email**: `your-email@example.com` (or your desired email)
   - **Password**: Your desired password
   - **Auto Confirm User**: Turn this **ON**
4. Click **Create User**

### Step 2: Update Role to Superadmin
1. Go to **SQL Editor** in your Supabase dashboard
2. Run this SQL command (replace the email with the one you created):

```sql
UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'your-email@example.com';
```

3. Click **Run** to execute

Done! You can now log in with that email and password as a superadmin.

---

## Method 2: Using Node.js Script

### Prerequisites
Make sure your `.env` file has:
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Run the Script
```bash
npm run seed
```

Or with custom credentials:
```bash
node seed-superadmin.js your-email@example.com YourPassword123! "Your Name"
```

---

## Verify Superadmin Access
After seeding, log in with the superadmin credentials. You should have:
- Access to all reports (Daily, Monthly, Yearly)
- Ability to manage all users
- Full access to all features

