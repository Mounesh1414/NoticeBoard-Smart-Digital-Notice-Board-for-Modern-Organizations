# NoticeBoard

NoticeBoard is a full-stack digital notice board with JWT auth, role-based access, file attachments, search, bookmarks, analytics, and live Socket.io updates.

## Stack

- Frontend: React, Vite, Socket.io client
- Backend: Node.js, Express, Socket.io, JWT, Multer
- Database: MongoDB-ready, with an in-memory fallback so the app still runs without MongoDB configured

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment files if needed:

   - `server/.env.example` to `server/.env`
   - `client/.env.example` to `client/.env`

3. Start both apps:

   ```bash
   npm run dev
   ```

4. Open the client shown in the terminal, usually `http://localhost:5173`.

## Demo Login

The server seeds an admin account on first boot when using the in-memory mode.

- Email: `admin@noticeboard.local`
- Password: `Admin@12345`

## Environment

Backend variables:

- `PORT` - server port, default `5000`
- `JWT_SECRET` - JWT signing secret
- `MONGO_URI` - optional MongoDB connection string
- `CLIENT_ORIGIN` - optional frontend origin for CORS

Frontend variables:

- `VITE_API_URL` - backend base URL, default `http://localhost:5000`

## Notes

- Real-time updates work over Socket.io as notices are created, updated, published, or archived.
- If `MONGO_URI` is set, the server can be extended to persist to MongoDB. Without it, the in-memory store keeps the demo runnable.
