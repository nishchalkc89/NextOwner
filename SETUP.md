# NextOwner — Setup Guide

## 1. Place Your Logo

Copy your NextOwner logo PNG → `public/logo.png`

---

## 2. Backend Setup

### a) MongoDB Atlas (Free)
1. Go to cloud.mongodb.com → Create free cluster
2. Database Access → Add user (remember username + password)
3. Network Access → Add IP → Allow from anywhere (0.0.0.0/0)
4. Clusters → Connect → Drivers → Copy connection string
5. Paste into `backend/.env` → `MONGODB_URI`

### b) Cloudinary (Free)
1. Go to cloudinary.com → Sign up free
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Paste into `backend/.env`

### c) Start Backend
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

### d) Seed Demo Data
```bash
# In a new terminal or Postman/Thunder Client:
curl -X POST http://localhost:5000/api/seed
# Loads 12 sample products + 4 demo users
```

---

## 3. Frontend Setup

```bash
# In the NextOwner root:
npm run dev
# App starts at http://localhost:5173
```

---

## 4. Demo Login
After seeding, use these credentials:
- Email: `rahul@demo.nextowner.com`
- Password: `demo1234`

---

## 5. Deploy to Vercel (Frontend)

```bash
npm run build
# Then deploy the dist/ folder to Vercel
# Set VITE_API_URL if using a separate backend domain
```

## 6. Deploy Backend to Railway/Render (Free)

Railway.app or Render.com → New Node.js service → connect GitHub repo → set env vars

---

## Full Stack Architecture

```
Frontend (React + Vite)     Backend (Node + Express)
http://localhost:5173   →   http://localhost:5000
                             ├── /api/auth
                             ├── /api/products  
                             ├── /api/users
                             └── /api/upload
                                    ↓
                             MongoDB Atlas (DB)
                             Cloudinary (Images)
```
