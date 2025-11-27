# TeamPulse Setup Guide

## Quick Start

### 1. Disable Email Confirmation (Development)

For easier testing during development, disable email confirmation in Supabase:

1. Go to Supabase Dashboard > Authentication > Providers > Email
2. Turn OFF "Confirm email"
3. Run this SQL to confirm existing users:

\`\`\`sql
-- Confirm all existing users
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
\`\`\`

### 2. Set Manager Role

Run this SQL query in your Supabase SQL Editor to make jakub.demaliaj@gmail.com a manager:

\`\`\`sql
UPDATE profiles
SET role = 'manager'
WHERE email = 'jakub.demaliaj@gmail.com';

-- Verify the role was set
SELECT email, role, full_name, points
FROM profiles
WHERE email = 'jakub.demaliaj@gmail.com';
\`\`\`

### 3. Sign Up

1. Go to `/auth/sign-up`
2. Sign up with any email (e.g., jakub.demaliaj@gmail.com)
3. You'll be redirected directly to the dashboard
4. No email confirmation needed!

### 4. Access Manager Dashboard

Once logged in as a manager, you'll see a "Manager" link in the navigation that takes you to `/manager` where you can:

- **Create Tasks**: Add new tasks with custom point rewards
- **View Leaderboard**: Track team performance

## Features Available to All Users

- **Recognition Hub** (`/recognition`): Send kudos to colleagues and view recognition feed
- **Daily Survey** (`/survey`): Complete daily emotional check-ins
- **Tasks** (`/tasks`): View and complete assigned tasks
- **Points** (`/points`): Track your points and redeem rewards

## Troubleshooting

### "Failed to fetch" Error

The Supabase connection is configured in the code. If you see this error:
- Make sure email confirmation is disabled in Supabase settings
- Check that your Supabase instance is accessible

### Can't Access Manager Dashboard

Run the SQL query in step 2 to set your role to 'manager'.

### Adding Mock Users for Testing

You can create test users directly in Supabase:

\`\`\`sql
-- Insert a test user profile (after they sign up through the app)
INSERT INTO profiles (id, email, full_name, points, role)
VALUES (
  'user-uuid-here',
  'test@example.com',
  'Test User',
  100,
  'employee'
);
