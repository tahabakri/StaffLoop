-- Migration: Team Role Integration
-- This migration adds support for team-specific roles and updates the staff assignment system

-- Create team_roles table
CREATE TABLE IF NOT EXISTS team_roles (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  staff_count INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add team_role_id column to event_staff_assignments table
ALTER TABLE event_staff_assignments
ADD COLUMN IF NOT EXISTS team_role_id INTEGER REFERENCES team_roles(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_roles_team_id ON team_roles(team_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_assignments_team_role_id ON event_staff_assignments(team_role_id);

-- Add helper view to see staff assignments with team and role information
CREATE OR REPLACE VIEW staff_assignments_with_teams AS
SELECT 
  esa.id,
  esa.event_id,
  esa.staff_id,
  s.name AS staff_name,
  e.name AS event_name,
  COALESCE(t.name, 'No Team') AS team_name,
  CASE 
    WHEN esa.team_role_id IS NOT NULL THEN tr.name
    WHEN esa.role_id IS NOT NULL THEN r.name
    ELSE 'Unassigned'
  END AS role_name,
  esa.status,
  esa.check_in_time,
  esa.check_out_time
FROM 
  event_staff_assignments esa
JOIN 
  staff s ON esa.staff_id = s.id
JOIN 
  events e ON esa.event_id = e.id
LEFT JOIN 
  teams t ON esa.team_id = t.id
LEFT JOIN 
  team_roles tr ON esa.team_role_id = tr.id
LEFT JOIN 
  roles r ON esa.role_id = r.id;

-- Add helper function to get all staff for a specific team
CREATE OR REPLACE FUNCTION get_team_staff(p_team_id INTEGER)
RETURNS TABLE (
  staff_id INTEGER,
  staff_name TEXT,
  role_name TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS staff_id,
    s.name AS staff_name,
    tr.name AS role_name,
    esa.status
  FROM 
    event_staff_assignments esa
  JOIN 
    staff s ON esa.staff_id = s.id
  JOIN 
    team_roles tr ON esa.team_role_id = tr.id
  WHERE 
    esa.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql; 