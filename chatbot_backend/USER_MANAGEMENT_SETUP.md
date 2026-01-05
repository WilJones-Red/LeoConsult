# User Management Setup Guide

This guide will help you set up the database-driven admin authorization system.

## Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `create_authorized_admins.sql`
6. Click **Run** to execute the SQL

This will:
- Create the `authorized_admins` table
- Add indexes for performance
- Insert your email (official@wilkinjones.com) as the super_admin
- Set up Row Level Security (RLS) policies
- Create automatic timestamp updates

## Step 2: Verify the Setup

1. In Supabase, go to **Table Editor**
2. Find the `authorized_admins` table
3. Verify that your email appears with:
   - Role: `super_admin`
   - Status: `true` (active)

## Step 3: Using the User Management Panel

### Accessing the Panel
1. Log in to the admin portal at `admin.html`
2. Click the **User Management** tab

### Adding New Admins
1. Click the **+ Add Administrator** button
2. Enter the new admin's email address
3. Select their role:
   - **admin**: Regular admin access
   - **super_admin**: Full system access (use sparingly)
4. Click **Save**

### Managing Existing Admins
- **Deactivate**: Temporarily revoke access without deleting
- **Activate**: Restore access to a deactivated admin
- **Delete**: Permanently remove an admin (cannot be undone)

**Note**: You cannot deactivate or delete yourself (official@wilkinjones.com)

## Roles Explained

### super_admin
- Full access to all features
- Can add/remove other admins
- Cannot be deactivated by others
- Recommended for: Site owner, primary administrator

### admin
- Access to FAQ management
- Access to analytics
- Can add other admins (if granted permission)
- Recommended for: Team members, support staff

## Security Features

✅ **Email Validation**: All emails are validated before adding  
✅ **Duplicate Prevention**: Cannot add the same email twice  
✅ **Row Level Security**: Database-level access control  
✅ **Active Status**: Deactivate users without deleting their record  
✅ **Self-Protection**: Cannot delete or deactivate your own account  

## Troubleshooting

### "Error loading users"
- Check that the SQL script ran successfully
- Verify RLS policies are enabled
- Check browser console for specific error messages

### "Error adding administrator"
- Verify email format is correct
- Check if email already exists
- Ensure you're logged in as an active admin

### Can't see User Management tab
- Make sure you're logged in
- Verify your email is in the authorized_admins table
- Check that `is_active` is set to `true`

## Database Schema

```sql
Table: authorized_admins
├── id (UUID, Primary Key)
├── email (TEXT, Unique, Not Null)
├── role (TEXT, Default: 'admin')
├── is_active (BOOLEAN, Default: true)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Best Practices

1. **Limit super_admins**: Only assign super_admin role to trusted individuals
2. **Regular Audits**: Periodically review the list of authorized admins
3. **Deactivate, Don't Delete**: Keep records by deactivating instead of deleting
4. **Email Verification**: Verify email addresses before adding new admins
5. **Document Changes**: Keep notes on when and why admins were added/removed

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify Supabase connection is active
3. Ensure all SQL scripts have been executed
4. Check that RLS policies are properly configured
