-- Migration: Team Role Supervisor Refactor
-- This migration updates the team organization structure to remove direct supervisor references
-- and rely on role assignments instead

-- 1. First, backup the supervisor relationships
CREATE TEMPORARY TABLE team_supervisors_backup AS
SELECT id AS team_id, supervisor_id FROM teams WHERE supervisor_id IS NOT NULL;

-- 2. Modify the teams table to remove supervisor_id column
ALTER TABLE teams DROP COLUMN IF EXISTS supervisor_id;

-- 3. Ensure team_roles table exists (created in previous migration)
-- If not running the previous migration, uncomment this:
-- CREATE TABLE IF NOT EXISTS team_roles (
--   id SERIAL PRIMARY KEY,
--   team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
--   name TEXT NOT NULL,
--   staff_count INTEGER NOT NULL DEFAULT 1,
--   description TEXT,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- 4. Add is_supervisory flag to team_roles table to explicitly mark supervisory roles
ALTER TABLE team_roles ADD COLUMN IF NOT EXISTS is_supervisory BOOLEAN DEFAULT FALSE;

-- 5. Create supervisor roles for teams that had supervisors, using the backup data
INSERT INTO team_roles (team_id, name, staff_count, is_supervisory)
SELECT 
  team_id, 
  'Team Supervisor', 
  1, 
  TRUE
FROM team_supervisors_backup;

-- 6. Create event_staff_assignments for the supervisors using the backup data
-- This step uses a transaction to ensure data consistency
BEGIN;
  -- Get the newly created supervisor roles
  WITH supervisor_roles AS (
    SELECT 
      tr.id AS role_id, 
      tr.team_id,
      tsb.supervisor_id
    FROM 
      team_roles tr
    JOIN 
      team_supervisors_backup tsb ON tr.team_id = tsb.team_id
    WHERE 
      tr.is_supervisory = TRUE
  )
  -- Insert the supervisor assignments
  INSERT INTO event_staff_assignments (
    event_id, 
    staff_id, 
    team_id, 
    team_role_id, 
    status
  )
  SELECT 
    t.event_id, 
    sr.supervisor_id, 
    sr.team_id, 
    sr.role_id, 
    'assigned'
  FROM 
    supervisor_roles sr
  JOIN 
    teams t ON sr.team_id = t.id
  -- Avoid duplicate assignments
  WHERE NOT EXISTS (
    SELECT 1 FROM event_staff_assignments 
    WHERE team_id = sr.team_id AND staff_id = sr.supervisor_id AND team_role_id = sr.role_id
  );
COMMIT;

-- 7. Drop the temporary backup table
DROP TABLE team_supervisors_backup;

-- 8. Add helper functions to easily identify team supervisors
CREATE OR REPLACE FUNCTION get_team_supervisor_id(p_team_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_supervisor_id INTEGER;
BEGIN
  SELECT staff_id INTO v_supervisor_id
  FROM event_staff_assignments esa
  JOIN team_roles tr ON esa.team_role_id = tr.id
  WHERE tr.team_id = p_team_id AND tr.is_supervisory = TRUE
  LIMIT 1;
  
  RETURN v_supervisor_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create a view that shows teams with their supervisors
CREATE OR REPLACE VIEW teams_with_supervisors AS
SELECT 
  t.id AS team_id,
  t.event_id,
  t.name AS team_name,
  s.id AS supervisor_id,
  s.name AS supervisor_name,
  s.email AS supervisor_email,
  s.phone AS supervisor_phone
FROM 
  teams t
LEFT JOIN 
  event_staff_assignments esa ON t.id = esa.team_id
LEFT JOIN 
  team_roles tr ON esa.team_role_id = tr.id AND tr.is_supervisory = TRUE
LEFT JOIN 
  staff s ON esa.staff_id = s.id
WHERE 
  tr.is_supervisory IS TRUE OR tr.is_supervisory IS NULL;

-- 10. Update the supervisor_event_access_tokens table's references
-- (This assumes the table structure from previous migration)
-- This will maintain the relationship with team supervisors through the staff_id reference

-- 11. Add an index to improve performance when looking up supervisors
CREATE INDEX IF NOT EXISTS idx_team_roles_is_supervisory ON team_roles(is_supervisory); 