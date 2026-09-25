# ParkNexus Deployment Guide

This document outlines the architecture and deployment strategy for ParkNexus in a production environment.

## 1. Architecture

- **Frontend**: React + Vite (Deployed to Vercel)
- **Backend**: Node.js + Express + Socket.IO (Deployed to Render)
- **Database**: MongoDB Atlas

## 2. MongoDB Atlas Configuration

1. Create a cluster on MongoDB Atlas.
2. In **Database Access**, create a user with read/write access.
3. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) so Render can connect dynamically.
4. Retrieve the connection string (`MONGO_URI`).

## 3. Backend Deployment (Render)

1. Create a new **Web Service** on Render.
2. Connect the repository and select the `backend` directory.
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. **Environment Variables**:
   - `NODE_ENV=production`
   - `MONGO_URI=<Your MongoDB Atlas URI>`
   - `JWT_SECRET=<A secure random string>`
   - `CLIENT_URL=<Your Vercel URL>` (e.g., `https://parknexus-frontend.vercel.app`)
6. Render will automatically assign a `PORT`.

## 4. Frontend Deployment (Vercel)

1. Import the repository in Vercel.
2. Set the **Framework Preset** to Vite.
3. Set the **Root Directory** to `frontend`.
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL=<Your Render URL>/api` (e.g., `https://parknexus-backend.onrender.com/api`)
7. Vercel automatically handles the SPA routing via the `vercel.json` file included in the frontend root.

## 5. Security & Maintenance

- **CORS**: The backend specifically allows the `CLIENT_URL` provided in the environment.
- **Passwords**: Hashed with bcrypt.
- **Secrets**: Do not commit secrets. Update them directly in the Vercel and Render dashboards.
- **Health Check**: Available at `<Your Render URL>/api/health`.
