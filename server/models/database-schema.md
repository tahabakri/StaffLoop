# Database Schema Changes for Geofence and Shift-Specific Staffing

## Overview

To support the new geofence configuration and shift-specific staffing requirements, we need to make the following changes to the database schema:

## 1. Event Table Updates

Add the following fields to the existing `Events` table:

```sql
ALTER TABLE Events
ADD COLUMN geofence_radius_meters INTEGER NOT NULL DEFAULT 100,
ADD COLUMN location_latitude DECIMAL(10, 8),
ADD COLUMN location_longitude DECIMAL(11, 8);
```

The `geofence_radius_meters` field will store the radius in meters for the check-in geofence, with a default value of 100 meters.
The `location_latitude` and `location_longitude` fields will store the coordinates of the event location, which can be populated by a geocoding service when the location is saved.

## 2. Event Shifts Table

Create a new table to store shift information for events:

```sql
CREATE TABLE EventShifts (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES Events(id) ON DELETE CASCADE,
    name VARCHAR(100),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, name)
);
```

## 3. Role Requirements Update

The existing `RoleRequirements` table needs to be updated to support shift-specific staff counts:

```sql
-- New structure for RoleRequirements
CREATE TABLE RoleRequirements (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES Events(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES Teams(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    shift_id INTEGER REFERENCES EventShifts(id) ON DELETE CASCADE,
    staff_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, team_id, role_name, shift_id)
);
```

This updated structure allows for:
- Role requirements with no team (global roles when teams are disabled)
- Role requirements with a team (when teams are enabled)
- Role requirements with no shift (when shifts are disabled)
- Role requirements with a shift (when shifts are enabled)

The combination of `event_id`, `team_id`, `role_name`, and `shift_id` must be unique.

## 4. Staff Assignments Update

The `StaffAssignments` table needs to be updated to include shift assignments:

```sql
ALTER TABLE StaffAssignments
ADD COLUMN shift_id INTEGER REFERENCES EventShifts(id) ON DELETE SET NULL;
```

This allows staff to be assigned to specific shifts.

## Migration Strategy

When implementing these changes, consider the following migration strategy:

1. Add the new columns to existing tables
2. Create the new tables
3. For existing events without shifts, set shift_id to NULL in RoleRequirements and StaffAssignments
4. For existing events with shift information stored elsewhere, migrate that data to the new schema

## API Changes Required

The following API endpoints will need to be updated:

1. `/api/events` (POST/PUT) - To handle geofence radius and coordinates
2. `/api/events/:id/shifts` (GET/POST/PUT/DELETE) - To manage shifts
3. `/api/events/:id/roles` (GET/POST/PUT/DELETE) - To handle shift-specific role requirements
4. `/api/events/:id/staff-assignments` (GET/POST/PUT/DELETE) - To handle shift-specific staff assignments

## Indexing Recommendations

For performance optimization, add the following indexes:

```sql
CREATE INDEX idx_event_shifts_event_id ON EventShifts(event_id);
CREATE INDEX idx_role_requirements_event_id ON RoleRequirements(event_id);
CREATE INDEX idx_role_requirements_team_id ON RoleRequirements(team_id);
CREATE INDEX idx_role_requirements_shift_id ON RoleRequirements(shift_id);
CREATE INDEX idx_staff_assignments_shift_id ON StaffAssignments(shift_id);
``` 