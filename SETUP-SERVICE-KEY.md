# How to Set Up Service Role Key for Creating Sellers

## Problem
You're getting an "invalid API key" error when trying to create a seller. This happens because the service role key is not configured or is incorrect.

## Solution

### Step 1: Get Your Service Role Key
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Find the **service_role** key (it's labeled as "secret" - this is different from the anon key)
5. Copy the entire key (it's a long string starting with `eyJ...`)

### Step 2: Add to .env File
Add this line to your `.env` file in the project root:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: 
- Replace `your-service-role-key-here` with the actual key you copied
- Make sure there are no spaces or quotes around the key
- The key should be on a single line

### Step 3: Restart Development Server
After adding the key, restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Verify
1. Try creating a seller again
2. The error should be resolved

## Security Note
⚠️ **Important**: The service role key has full access to your database and bypasses Row Level Security. 

- **Never commit** the `.env` file to version control
- **Never expose** the service role key in client-side code in production
- For production, consider using Supabase Edge Functions instead

## Example .env File
```env
VITE_APP_NAME="JB Phonetec Hub"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
VITE_DEFAULT_CURRENCY="UGX"
```

## Troubleshooting

### Still getting "invalid API key"?
1. Make sure you copied the **service_role** key, not the **anon** key
2. Check that there are no extra spaces or line breaks in the .env file
3. Verify the key starts with `eyJ`
4. Restart your dev server after adding the key
5. Check the browser console for more detailed error messages

### Key not working?
- Make sure you're using the key from the correct Supabase project
- Verify the key hasn't been rotated/changed in Supabase dashboard
- Check that your `.env` file is in the project root directory

