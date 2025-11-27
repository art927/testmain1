# Disable Email Confirmation

To allow login without email confirmation, follow these steps:

## Step 1: Run the SQL Script

Run the `scripts/disable_email_confirmation.sql` script in your Supabase SQL Editor to confirm all existing users.

## Step 2: Disable Email Confirmation in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Settings** (or **Providers**)
4. Find the **Email** provider settings
5. Look for **"Enable email confirmations"** or **"Confirm email"**
6. **Toggle it OFF** or **Uncheck** the option
7. Click **Save**

## Step 3: Test

Now you can:
- Sign up new users without email confirmation
- Login with existing users immediately
- Add mock users for testing without worrying about email verification

## Alternative: Confirm Users via SQL

If you can't access the dashboard settings, you can manually confirm users as they're created:

\`\`\`sql
-- Confirm a specific user by email
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'user@example.com';
