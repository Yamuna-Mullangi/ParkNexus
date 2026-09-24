# ParkNexus Architecture

## Project Overview
ParkNexus is an intelligent parking management and reservation platform designed for residential and apartment communities. The architecture is built as a MERN stack application, optimized for scalability and clean code structure.

## Frontend Architecture
The frontend is built using React.js and Vite, with React Router for navigation. 

### Folder Responsibilities:
- `assets/`: Static resources like images, fonts, icons.
- `components/`: Reusable React components grouped by module (e.g., landing, navigation, parking, auth, profile).
- `layouts/`: Wrapper components that provide consistent UI structures.
- `pages/`: Route-level components that compose smaller components to build an entire view.
- `routes/`: Routing logic and route definitions (including `ProtectedRoute` and `RoleRoute`).
- `services/`: API interaction logic and data fetching (e.g., `api.js`, `authService.js`).
- `hooks/`: Custom React hooks for shared logic (e.g., `useAuth`).
- `context/`: React Context providers for global state (e.g., `AuthContext`).
- `utils/`: Helper functions and utility scripts.
- `constants/`: Global constants and configuration values.
- `styles/`: Global CSS files, CSS variables, and theming.

## Backend Architecture
The backend is built using Node.js and Express, designed with MVC principles. It uses MongoDB (via Mongoose) for data persistence.

### Authentication Flow
- User credentials validated against hashed passwords (bcrypt).
- JWT (JSON Web Tokens) generated upon successful login.
- Protected routes use `authMiddleware` to verify JWT.
- Role-based authorization is enforced via `roleMiddleware`.

### Folder Responsibilities:
- `config/`: Environment configuration, database connections.
- `controllers/`: Route handlers containing the core business logic.
- `middleware/`: Express middleware for authentication, error handling, etc.
- `models/`: Mongoose schemas and data models.
- `routes/`: Express route definitions connecting endpoints to controllers.
- `services/`: Reusable business logic abstracted from controllers.
- `utils/`: Helper functions and shared utilities.
- `validators/`: Request payload validation logic.
- `constants/`: System-wide constants.

## Communication Plan
The frontend communicates with the backend via RESTful APIs. In future phases, real-time communication (e.g., live parking updates) will be facilitated by Socket.IO.
