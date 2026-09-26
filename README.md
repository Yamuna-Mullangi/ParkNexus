# ParkNexus

## Intelligent Parking Management & Reservation Platform

### Architecture
ParkNexus is a modern smart parking platform designed to bring simplicity, visibility, and intelligence to residential parking. 
- **Frontend**: React + Vite application focusing on minimal glassmorphism design, deployed to Vercel.
- **Backend**: Node.js + Express API handling authentication, role-based access control, analytics, and business logic, deployed to Render.
- **Database**: MongoDB Atlas using Mongoose ODM to securely store and retrieve data.

## Setup

### 1. MongoDB Configuration
Create a MongoDB Atlas cluster (or use a local instance). Obtain your MongoDB URI connection string.

### 2. Environment Variables
Create a .env file in the ackend/ directory with the following variables (see .env.example):
\\\env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
\\\

### 3. Backend Installation
\\\ash
cd backend
npm install
\\\

### 4. Frontend Installation
\\\ash
cd frontend
npm install
\\\

## Run

To start the application locally:

### Start Backend
\\\ash
cd backend
npm run dev
\\\

### Start Frontend
\\\ash
cd frontend
npm run dev
\\\

## Seed
To populate the database with a complete set of interconnected test data (development only):
\\\ash
cd backend
npm run seed
\\\

## Demo Accounts
*(Password for all demo accounts: Demo@12345)*

- **Resident**: esident@parknexus.dev
- **Security**: security@parknexus.dev
- **Admin**: dmin@parknexus.dev

## Role Workflows

### Resident Workflow
Residents can log in to view their dashboard containing their primary vehicle, active visitors, and upcoming reservations. They can search for available parking, make reservations, register vehicles, and share their assigned spot when out of town. Residents also manage expected visitors and can generate temporary QR passes.

### Security Workflow
Security staff operate out of a highly focused dashboard that shows active visitors currently inside the premises, expected arrivals, and gate activity. They verify visitor passes, process check-ins and check-outs, and monitor overdue visitors to ensure community safety.

### Admin Workflow
Administrators have a bird's-eye view of the system. The admin dashboard provides comprehensive analytics on parking utilization, gate activity, and user demographics. Admins can manage all users, adjust parking spots and assignments, view system-wide logs, and export operational reports.

