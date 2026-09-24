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

### `/api/vehicles`
- Add, update, and remove resident vehicles.

### `/api/visitors`
- Generate visitor passes, verify QR codes, and manage active visitor access.

### `/api/notifications`
- Fetch real-time alerts and manage notification preferences.

### `/api/analytics`
- Aggregated data for administrative dashboards (e.g., peak usage, violation reports).
