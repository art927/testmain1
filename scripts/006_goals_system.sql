-- 006_goals_system.sql
-- Enhance the team_goals table with additional fields for comprehensive goal tracking

-- Add missing columns to team_goals if they don't exist
DO $$
BEGIN
  -- Add priority column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_goals' AND column_name = 'priority'
  ) THEN
    ALTER TABLE team_goals ADD COLUMN priority text DEFAULT 'medium';
  END IF;

  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_goals' AND column_name = 'category'
  ) THEN
    ALTER TABLE team_goals ADD COLUMN category text;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_goals' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE team_goals ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Add instance_id to link goals to evaluation instances
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_goals' AND column_name = 'instance_id'
  ) THEN
    ALTER TABLE team_goals ADD COLUMN instance_id uuid;
  END IF;
END$$;

-- Add foreign key constraint for instance_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_goals_instance_id_fkey'
  ) THEN
    ALTER TABLE team_goals
      ADD CONSTRAINT team_goals_instance_id_fkey
      FOREIGN KEY (instance_id) REFERENCES evaluation_instances(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_goals_employee_id ON team_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_team_goals_manager_id ON team_goals(manager_id);
CREATE INDEX IF NOT EXISTS idx_team_goals_period_id ON team_goals(period_id);
CREATE INDEX IF NOT EXISTS idx_team_goals_instance_id ON team_goals(instance_id);
CREATE INDEX IF NOT EXISTS idx_team_goals_status ON team_goals(status);
