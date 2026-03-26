# Project P3 - Secure REST API (JWT + RBAC) + Task CRUD UI

This project implements:
- Backend: secure user registration/login with password hashing + JWT auth, role-based access (USER/ADMIN), versioned REST API (`/api/v1`), validation + sanitization, centralized error handling, Swagger docs, Postman collection, and Prisma schema for MongoDB.
- Frontend: React UI to register/login, use JWT for protected requests, and perform full CRUD on a secondary entity (`tasks`) with success/error messaging.

## 🚀 Vercel Deployment Guide

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- GitHub account
- Vercel account

### 📋 Environment Variables

#### Backend Environment Variables (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<your-super-secret-jwt-key-min-16-characters>
JWT_EXPIRES_IN=15m
CORS_ORIGIN=https://your-frontend-domain.vercel.app
BCRYPT_SALT_ROUNDS=12
SEED_ADMIN=false
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
```

#### Frontend Environment Variables (.env)
```env
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

### 📦 Vercel Deployment Steps

#### Step 1: Prepare GitHub Repository

1. **Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial commit: Task management system"
```

2. **Create GitHub Repository**
- Go to [GitHub](https://github.com) and create a new repository named `P3`
- Don't initialize with README (you already have one)
- Copy the repository URL

3. **Push to GitHub**
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

#### Step 2: Deploy Backend to Vercel

1. **Connect Vercel to GitHub**
- Go to [Vercel](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Select the `backend` folder as the root directory

2. **Configure Backend Settings**
- **Framework Preset**: Other
- **Root Directory**: `./backend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

3. **Add Backend Environment Variables**
In Vercel dashboard → Settings → Environment Variables:
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://your-username:your-password@cluster.mongodb.net/your-db
JWT_SECRET=your-super-secret-jwt-key-at-least-16-characters
JWT_EXPIRES_IN=15m
CORS_ORIGIN=https://your-frontend-domain.vercel.app
BCRYPT_SALT_ROUNDS=12
```

4. **Deploy Backend**
- Click "Deploy"
- Wait for deployment to complete
- Copy the deployed backend URL

#### Step 3: Deploy Frontend to Vercel

1. **Create New Vercel Project**
- Go back to Vercel dashboard
- Click "Add New..." → "Project"
- Select the same GitHub repository
- Set **Root Directory**: `./frontend`

2. **Configure Frontend Settings**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

3. **Add Frontend Environment Variable**
```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

4. **Deploy Frontend**
- Click "Deploy"
- Wait for deployment to complete

#### Step 4: Update CORS Origins

1. **Update Backend CORS**
- Go to your backend project on Vercel
- Settings → Environment Variables
- Update `CORS_ORIGIN` to your actual frontend URL
- Redeploy backend

2. **Update Frontend API URL**
- Go to your frontend project on Vercel  
- Settings → Environment Variables
- Update `VITE_API_BASE_URL` to your actual backend URL
- Redeploy frontend

---

## 🌐 Access Your Deployed App

After deployment:
- **Frontend URL**: `https://your-project-name.vercel.app`
- **Backend API**: `https://your-backend-name.vercel.app/api`
- **Health Check**: `https://your-backend-name.vercel.app/api/v1/health`

---

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` matches your frontend URL exactly
   - Check for trailing slashes

2. **Database Connection**
   - Verify MongoDB Atlas IP access (0.0.0.0/0 for all IPs)
   - Check database user credentials

3. **Build Failures**
   - Ensure all dependencies are in package.json
   - Check TypeScript compilation errors

4. **Environment Variables**
   - Vercel variables might take a few minutes to propagate
   - Redeploy after adding/changing variables

### Debug Commands

```bash
# Check backend health
curl https://your-backend.vercel.app/api/v1/health

# Test API endpoints
curl -H "Authorization: Bearer <token>" \
     https://your-backend.vercel.app/api/v1/tasks
```

---

## Folder structure
- `backend/` - Express + TypeScript + Prisma (MongoDB) + JWT/RBAC + Swagger
- `frontend/` - React + Vite UI for testing APIs

## Backend (setup & run)

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB database

### 2. Configure environment
1. Copy `backend/.env.example` to `backend/.env`
2. Set `DATABASE_URL` and a strong `JWT_SECRET`
3. (Optional) Enable demo admin seeding:
   - set `SEED_ADMIN=true`
   - set `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### 3. Install & sync schema
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start the backend
```bash
npm run dev
```

Backend base URL (versioned):
- `http://localhost:3000/api/v1`

Docs:
- Swagger UI: `http://localhost:3000/api-docs`

### 5. Postman
- Collection file: `backend/postman_collection.json`
- Import it in Postman
- Set/use the `token` variable after logging in

## Frontend (setup & run)

### 1. Configure environment
1. Copy `frontend/.env.example` to `frontend/.env`
2. Ensure `VITE_API_BASE_URL` matches your backend URL

### 2. Start the UI
```bash
cd frontend
npm install
npm run dev
```

UI runs at:
- `http://localhost:5173`

## How role-based access works
- Users are created as role `USER` by default (`POST /auth/register`).
- If `SEED_ADMIN=true`, an initial `ADMIN` account is created at startup.
- `tasks`:
  - `USER`: can only view/create/update/delete their own tasks.
  - `ADMIN`: can access tasks across all users.

## API endpoints
- Auth
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me` (JWT required)
- Tasks (CRUD, JWT required)
  - `GET /api/v1/tasks`
  - `POST /api/v1/tasks`
  - `GET /api/v1/tasks/:id`
  - `PUT /api/v1/tasks/:id`
  - `DELETE /api/v1/tasks/:id`

## Optional: Docker deployment readiness
This repo includes `docker-compose.yml` and a backend `Dockerfile`.

To start MongoDB + backend:
```bash
docker compose up --build
```

Then run the frontend normally (Vite) and point it to `http://localhost:3000/api/v1`.

## Scalability note
The backend is structured for growth and production readiness:
- Stateless JWT auth so horizontal scaling is straightforward.
- Versioned routing (`/api/v1`) to evolve APIs safely.
- Modular architecture (controllers/services/middleware) for adding new modules.
- Centralized validation + error handling for consistent behavior.
- Optional Redis caching (`REDIS_URL`) prepared for faster reads (e.g., task list caching).
- Docker + MongoDB compose setup to simplify environment reproduction.

