# Database Design (Future Phases)

*Note: This describes the planned MongoDB database design. Schemas are NOT implemented in Phase 1.*

## Entities

### User
Stores account information, credentials, role (resident, admin, security), and preferences.

### Vehicle (Implemented in Phase 5)
Stores resident vehicles, linked to users via ObjectId, containing make, model, color, and license plate.

### ParkingSpot
Represents a physical parking space. Tracks location, type (assigned, visitor, accessible), and current status (available, occupied, reserved).

### Reservation
Records a booking for a specific parking spot by a user for a specific timeframe.

### ParkingRequest
A request made by a resident to temporarily use another resident's shared parking spot.

### VisitorPass (Implemented in Phase 6)
Temporary QR-code-based access pass for visitors, linked to a host resident. Contains a secure token validated by security.

### GateEntry (Implemented in Phase 7)
Records physical entry and exit of visitors at the security gate. Contains links to Visitor, VisitorPass, User (resident), User (security), and optionally a ParkingSpot and Vehicle. Tracks entry/exit timestamps and status (`checked_in`, `checked_out`, `denied`).

### Notification
System messages, alerts, and updates sent to users.

### ActivityLog
Audit trail of important system events (e.g., vehicle entry/exit, setting changes) for administrative use.
