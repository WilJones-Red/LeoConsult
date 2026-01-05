# Create User Account in Supabase

You need to create a user account in Supabase Authentication before you can login.

## Option 1: Create via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Authentication** in the left sidebar
4. Click **Users** tab
5. Click **Add user** (green button in top right)
6. **IMPORTANT**: Click "Create new user"
7. Enter your details:
   - **Email**: `official@wilkinjones.com`
   - **Password**: Choose a secure password
   - **Auto Confirm User**: ✅ Check this box (important!)
8. Click **Create User**

## Option 2: Run SQL to Create User

Go to SQL Editor in Supabase and run:

```sql
-- Create user account for admin
-- Replace 'YOUR_PASSWORD_HERE' with your actual password
SELECT auth.create_user(
  email := 'official@wilkinjones.com',
  password := 'YOUR_PASSWORD_HERE',
  email_confirm := true
);
```

## Verify User Was Created

After creating the user:

1. Go to **Authentication > Users** in Supabase
2. You should see `official@wilkinjones.com` in the list
3. Make sure the user shows as "Confirmed" (green checkmark)

## Then Try Login Again

Once the user is created:
1. Refresh your admin page
2. Enter email: `official@wilkinjones.com`
3. Enter the password you just set
4. Click Sign In

You should now be able to login!
