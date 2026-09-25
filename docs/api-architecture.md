# API Architecture (Future Phases)

*Note: These APIs are planned for future phases and are not implemented in Phase 1.*

## Planned Endpoints

### `/api/auth` (Implemented - Phase 2)
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Authenticate a user and issue JWT
- `GET /api/auth/me`: Get current authenticated user details
- `POST /api/auth/logout`: Invalidate current session

### `/api/users` (Partially Implemented - Phase 2)
- `GET /api/users/profile`: View own profile
- `PUT /api/users/profile`: Update own profile (name, phone)
- *(Future)* User profile management, role assignment, and preference settings.

### `/api/parking`
- Manage parking spots, fetch availability, assign spots to residents, and toggle spot sharing.

### `/api/reservations`
- Create, read, update, and cancel parking reservations.

### `/api/vehicles` (Implemented - Phase 5)
- `GET /api/vehicles/my`: Get all active vehicles for the authenticated user
- `POST /api/vehicles`: Add a new vehicle
- `GET /api/vehicles/:id`: Get a specific vehicle by ID
- `PUT /api/vehicles/:id`: Update a vehicle by ID
- `DELETE /api/vehicles/:id`: Deactivate a vehicle by ID
- `PUT /api/vehicles/:id/primary`: Set a vehicle as the primary vehicle

### `/api/visitors` (Implemented - Phase 6)
- `POST /api/visitors`: Register a new visitor
- `GET /api/visitors/my`: Get all active visitors for user
- `GET /api/visitors/upcoming`: Get upcoming visitors
- `GET /api/visitors/history`: Get visitor history
- `POST /api/visitors/:id/passes`: Generate QR pass
- `POST /api/visitors/passes/validate`: Validate QR pass (Security)

### `/api/gate` (Implemented - Phase 7)
- `POST /api/gate/check-in`: Check in a visitor using pass token
- `POST /api/gate/check-out/:id`: Check out an active visitor
- `GET /api/gate/active`: Get currently active/inside visitors
- `GET /api/gate/today`: Get today's gate entries
- `GET /api/gate/history`: Get gate entry history
- `GET /api/gate/:id`: Get a specific gate entry
- `GET /api/gate/visitor/:visitorId`: Get gate status for a specific visitor

### `/api/notifications`
- Fetch real-time alerts and manage notification preferences.

### `/api/analytics`
- Aggregated data for administrative dashboards (e.g., peak usage, violation reports).
