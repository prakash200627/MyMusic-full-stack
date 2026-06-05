# 🎵 MyMusic — Full-Stack Music Streaming App

A full-stack music streaming application with a React frontend, Node.js/Express backend, and a separate admin panel for content management.

## Tech Stack

| Layer     | Technology                                     |
| --------- | ---------------------------------------------- |
| Frontend  | React 19, Vite, Tailwind CSS, React Router     |
| Admin     | React 19, Vite, Tailwind CSS, React Toastify   |
| Backend   | Node.js, Express 5, Mongoose, JWT Auth         |
| Database  | MongoDB Atlas                                  |
| Storage   | Cloudinary (audio + images)                    |

## Project Structure

```
MyMusic-full-stack/
├── frontend/        # User-facing music player (React + Vite)
├── admin/           # Admin dashboard for managing songs/albums (React + Vite)
├── backend/         # REST API server (Express + MongoDB)
│   ├── src/
│   │   ├── config/       # DB & Cloudinary config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth & file upload middleware
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API route definitions
│   │   └── utils/        # Migration & utility scripts
│   └── server.js         # Entry point
└── package.json     # Workspace scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd MyMusic-full-stack
npm run install-all
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your actual credentials:

```env
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_API=your_api_secret
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
```

### 3. Run Development Servers

```bash
# Backend (port 4000)
npm run start-backend

# Frontend (port 5173)
cd frontend && npm run dev

# Admin Panel (port 5174)
cd admin && npm run dev
```

### 4. Build for Production

```bash
npm run build-frontend
npm run build-admin
```

## API Endpoints

| Route              | Description               |
| ------------------ | ------------------------- |
| `/api/song`        | Song CRUD & streaming     |
| `/api/album`       | Album management          |
| `/api/auth`        | Login, register, tokens   |
| `/api/admin`       | Admin-only operations     |
| `/api/user`        | User profile & playlists  |
| `/api/analytics`   | Listening analytics       |

## License

ISC
