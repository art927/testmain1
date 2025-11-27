-- Add account_type column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT;

-- Update existing manager/admin roles to have account_type
UPDATE profiles 
SET account_type = 'manager' 
WHERE role IN ('manager', 'admin') AND account_type IS NULL;

UPDATE profiles 
SET account_type = 'employee' 
WHERE role = 'employee' AND account_type IS NULL;

-- Ensure teams table has all necessary columns
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for teams table
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fixed: PostgreSQL doesn't support CREATE POLICY IF NOT EXISTS
-- Must use DROP POLICY IF EXISTS followed by CREATE POLICY

-- Add RLS policy for managers to view team members in their team
DROP POLICY IF EXISTS "Managers can view their team members" ON profiles;
CREATE POLICY "Managers can view their team members" ON profiles
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Update recognitions table to support team-based recognition
DROP POLICY IF EXISTS "Users can view team recognitions" ON recognitions;
CREATE POLICY "Users can view team recognitions" ON recognitions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.id = auth.uid() 
      AND p2.id = recognitions.to_user_id
      AND p1.team_id = p2.team_id
    )
  );

-- Ensure invitations table has proper RLS
DROP POLICY IF EXISTS "Users can view invitations for their team" ON invitations;
CREATE POLICY "Users can view invitations for their team" ON invitations
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Add index for better performance on team queries
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_recognitions_created_at ON recognitions(created_at);
CREATE INDEX IF NOT EXISTS idx_recognitions_from_user ON recognitions(from_user_id, created_at);
