# ParkNexus

## Intelligent Parking Management & Reservation Platform

### Problem Statement
Managing residential and apartment community parking is often chaotic, with unauthorized visitors, underutilized assigned spots, and conflicts over available parking. 

### Planned Solution
ParkNexus is a modern smart parking platform designed to bring simplicity, visibility, and intelligence to residential parking. It allows residents to manage their assigned spaces, view real-time parking availability, share unused spots, and manage visitor parking with ease.

### Current Phase
**Phase 25 — Final Production & Deployment Preparation**
The application is fully developed, audited, and ready for production deployment on Vercel (Frontend) and Render (Backend).

### Deployment Architecture
- **Frontend**: React + Vite (Deployed to Vercel)
- **Backend**: Node.js + Express API (Deployed to Render)
- **Database**: MongoDB Atlas
See [docs/deployment.md](docs/deployment.md) for full deployment instructions.

### Technology Stack
- **Frontend:** React.js, Vite, React Router, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Security:** Helmet, express-mongo-sanitize, express-rate-limit

### Folder Structure
```text
ParkNexus/
├── frontend/        # React application (Vite)
├── backend/         # Node.js + Express API
└── docs/            # Project architecture and planning documentation
```

## Security (Phase 12 Updates)
To ensure the application is ready for production, the following security hardening measures have been implemented:
- **JWT Authentication**: Uses `jsonwebtoken` stored safely with HTTP standards for protected routes.
- **Password Hashing**: Uses `bcryptjs` with salting to safely store passwords.
- **Role-Based Authorization**: Enforced on the backend (Resident, Security, Admin) so UI manipulation cannot grant access.
- **Request Validation**: All critical endpoints enforce data constraints. Mongoose strict schemas protect MongoDB.
- **CORS Protection**: Restricted to local development URLs and designated production frontend URLs.
- **Rate Limiting**: Prevent abuse on authentication and security gate endpoints using `express-rate-limit`.
- **Security Headers**: Standard headers applied using `helmet`.
- **NoSQL Injection Prevention**: Safe input sanitization utilizing `express-mongo-sanitize`.
- **QR Token Validation**: Visitor QR codes use secure cryptographic tokens rather than storing readable PII data. Validation requires backend verification.
- **Activity Logging**: Track admin events and access without storing sensitive tokens/passwords in the logs.

## Production Environment Variables
Do NOT commit the real secrets. Refer to `.env.example`.
- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`

## Health Check
To verify backend connectivity, use the following endpoint:
```http
GET /api/health
```

## Automated Lifecycle Management (Phase 13 Updates)
ParkNexus automatically manages time-based states across the platform using periodic backend jobs without requiring manual intervention.

### Automated Transitions
- **Reservations**: Transitions seamlessly from `approved` to `active` at start time, and cleanly wraps up to `completed` or `expired` when end time is reached.
- **Parking Shares**: Automatically flags shares as `expired` once the allowed time window concludes.
- **Visitor Passes**: Expires strictly according to the `validUntil` timestamps.
- **Visitor Lifecycle**: Gracefully manages expected arrival and departure deadlines to prevent lingering active entries.
- **Visitor Parking**: Frees up dynamically assigned visitor spots efficiently upon exit or expiration.

## Scheduled Jobs
A reliable `node-cron` scheduled task infrastructure operates entirely on the backend:
- **When they run:** Periodically executes background routines every minute.
- **What they process:** Securely synchronizes models against the database avoiding conflicting state overwrites.
- **Idempotent Execution:** Designed to be strictly idempotent, guaranteeing duplicate notifications, real-time broadcasts, and activity logs are completely prevented across subsequent checks.
- **Scope limitation:** Augments automation but does not override standard, strict API validation required from actual user actions.

## Advanced Search, Filtering & Data Discovery (Phase 14 Updates)
ParkNexus provides comprehensive, safe, and performant data discovery features. 
- **Centralized Pagination & Sorting Engine**: The backend leverages a dedicated `paginateAndSort` database utility, seamlessly processing complex aggregations, filtering logic, text search, sorting rules, and limits directly on MongoDB, reducing application memory footprints.
- **URL-Synced Search State**: Filters, pagination, and sorting settings across lists (e.g. Visitors, Gate History, User Management) act as the source of truth securely synchronized with the browser's URL using robust parsing utilities. Shareable, refreshable URLs enhance data visibility.
- **Secure Data Scoping**: Search parameters cannot override access policies. Residents securely retrieve only their authorized context regardless of external query tampering, isolating tenants strictly on the backend.
- **Debounced Interactions**: The platform provides dynamic `SearchBar`, `FilterSelect`, `SortSelect`, and `DateRangeFilter` UI components designed for seamless, user-friendly data discovery without overloading the backend API.

## Dashboards (Phase 15 Updates)
The system incorporates three cohesive, role-based dashboards that serve as the primary landing point after login:
- **Resident Dashboard**: Provides a compact overview of assigned parking, upcoming reservations, active visitors, primary vehicles, and recent notifications, utilizing data scoping to ensure users only see their own context.
- **Security Dashboard**: Optimized for fast gate operations. Shows active visitors currently inside, today's entry/exit stats, and items requiring attention (such as overdue visitors) to streamline physical security management.
- **Admin Dashboard**: Acts as the administrative control center. Consolidates critical system statistics, including overall parking utilization, user demographics, gate activity, reservation trends, and recent system activity logs, alongside an "Attention Required" panel for maintenance and inactive user management.

## Development Demo Data

Run the following command from the ackend directory to populate the database with a complete set of interconnected test data:

`ash
npm run seed
``n
**Demo Accounts:**
- **Resident:** resident@parknexus.dev
- **Security:** security@parknexus.dev
- **Admin:** admin@parknexus.dev

*(Password for all demo accounts: Demo@12345)*

> **Note:** These credentials and the seed script are intended for development and testing purposes only. The script is idempotent and will safely overwrite previous demo data without affecting real user records.

