# Backend Data Model Updates for Map-Based Geofence and Shift-Specific Staff Assignments

## 1. Map-Based Geofence Configuration

### Event Table Updates

The Event table needs to be updated to store precise geofence information:

```sql
ALTER TABLE Events
ADD COLUMN geofence_latitude DECIMAL(10, 8) NOT NULL DEFAULT 25.2048, -- Default to Dubai coordinates
ADD COLUMN geofence_longitude DECIMAL(11, 8) NOT NULL DEFAULT 55.2708,
ADD COLUMN geofence_radius_meters INTEGER NOT NULL DEFAULT 100;
```

These fields will store:
- `geofence_latitude` - The latitude of the center point of the geofence
- `geofence_longitude` - The longitude of the center point of the geofence
- `geofence_radius_meters` - The radius of the geofence circle in meters

### API Changes for Geofence

The Event API endpoints need to be updated to handle the new geofence fields:

1. `POST /api/events` - Create event with geofence data
2. `PUT /api/events/:id` - Update event with geofence data
3. `GET /api/events/:id` - Return event with geofence data

### Mobile App Integration

For the mobile app, we need to add functionality to:
1. Check if a user's current GPS location is within the geofence radius of an event
2. Calculate the distance from the user to the event center
3. Show a visual representation of the geofence on a map

## 2. Shift-Specific Staff Assignments

### Event Shifts Table

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

### Role Requirements Table Updates

The Role Requirements table needs to be updated to support shift-specific staff counts:

```sql
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

### Staff Assignments Table Updates

The Staff Assignments table needs to be updated to include shift assignments:

```sql
ALTER TABLE StaffAssignments
ADD COLUMN shift_id INTEGER REFERENCES EventShifts(id) ON DELETE SET NULL;
```

### API Changes for Shift-Specific Assignments

The following API endpoints need to be updated or created:

1. `GET /api/events/:id/shifts` - Get all shifts for an event
2. `POST /api/events/:id/shifts` - Create a new shift for an event
3. `PUT /api/events/:id/shifts/:shiftId` - Update a shift
4. `DELETE /api/events/:id/shifts/:shiftId` - Delete a shift

5. `GET /api/events/:id/roles` - Get all roles with shift-specific requirements
6. `POST /api/events/:id/roles` - Create a role with shift-specific requirements
7. `PUT /api/events/:id/roles/:roleId` - Update a role with shift-specific requirements
8. `DELETE /api/events/:id/roles/:roleId` - Delete a role

9. `GET /api/events/:id/staff-assignments` - Get all staff assignments with shift information
10. `POST /api/events/:id/staff-assignments` - Create a staff assignment for a specific shift
11. `DELETE /api/events/:id/staff-assignments/:assignmentId` - Remove a staff assignment

## 3. Database Indexes for Performance

To ensure good performance with these new fields and relationships, add the following indexes:

```sql
CREATE INDEX idx_events_geofence ON Events(geofence_latitude, geofence_longitude);
CREATE INDEX idx_event_shifts_event_id ON EventShifts(event_id);
CREATE INDEX idx_role_requirements_shift_id ON RoleRequirements(shift_id);
CREATE INDEX idx_staff_assignments_shift_id ON StaffAssignments(shift_id);
```

## 4. Migration Strategy

1. **Database Schema Updates**:
   - Add new columns to existing tables
   - Create new tables
   - Add necessary indexes

2. **Data Migration**:
   - For existing events, set default geofence values
   - For existing role requirements, create records with `shift_id = NULL` (representing non-shift-specific requirements)
   - For existing staff assignments, set `shift_id = NULL`

3. **API Updates**:
   - Update API endpoints to handle the new fields
   - Add validation for the new fields
   - Ensure backward compatibility for clients that haven't been updated

4. **Frontend Updates**:
   - Update the event creation/editing forms to include geofence configuration
   - Update the staff assignment UI to handle shift-specific assignments

## 5. Security Considerations

1. **Geofence Data**:
   - Ensure that geofence data is only accessible to authorized users
   - Implement rate limiting for location-based API calls to prevent abuse

2. **Shift-Specific Permissions**:
   - Update the permission system to handle shift-specific roles
   - Ensure that supervisors can only manage staff for their assigned shifts

## 6. Testing Strategy

1. **Unit Tests**:
   - Test geofence validation logic
   - Test shift-specific role requirement calculations
   - Test staff assignment validation with shifts

2. **Integration Tests**:
   - Test the complete flow from event creation to staff check-in
   - Test the supervisor access token generation and usage with shift-specific assignments

3. **UI Tests**:
   - Test the map-based geofence selector
   - Test the shift-specific staff assignment UI 