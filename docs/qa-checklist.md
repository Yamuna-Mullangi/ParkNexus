# ParkNexus QA Checklist - Phase 24

| Feature | Test Scenario | Expected Result | Actual Result | Status | Bug Found | Fix Applied |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **System & Env** | Check `.env` secrets | Secrets are ignored by Git, no localhost URLs hardcoded | Verified `.env` in gitignore | Passed | None | N/A |
| **Backend** | `GET /api/health` | Returns success only if DB is connected | Hardcoded success previously | Fixed | Missing DB check | Added `mongoose.connection.readyState` check |
| **Database** | Duplicate indexes | No redundant manual indexes | Verified via DB query, no duplicates found | Passed | None | N/A |
| **Auth** | Login Lifecycle | Valid login issues JWT | JWT successfully generated | Passed | None | N/A |
| **Auth** | Registration | Duplicate email rejected | Handled with 409 status | Passed | None | N/A |
| **Auth** | Security | No passwords exposed in APIs | Verified via tests | Passed | None | N/A |
| **Gate Operations** | Visitor Checkout | Spot returns to assigned status | Reverted to available previously | Fixed | Spot status corrupted on checkout | Updated to check `assignedTo` |
| **Reservations** | Concurrency Conflict | Cannot double-book spot | DB isolation lacks strict transactions | Limitation | Missing Distributed Locks | Documented Limitation - MongoDB lacks distributed locks by default |
| **Jobs** | Lifecycle duplication | Jobs run safely without spam | Checked schemas for duplicate flag | Passed | None | N/A |
| **Security** | Malformed requests | Sanitize inputs | `express-mongo-sanitize` is active | Passed | None | N/A |
| **Frontend** | Build integrity | No fatal warnings in Vite | Tested in Phase 23 | Passed | None | N/A |
*(This checklist will be continuously updated during Phase 24 testing)*
