# Venue Management CRM

Production-ready internal CRM for venue owners and staff. Manages **Cricket Ground**, **Shooting Studio**, **Marriage Ground**, and **Banquet Hall** with booking calendars, payments, customer CRM, reports, and notifications.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT |

## Features

- Admin & Staff login with JWT
- Dashboard with today's bookings, revenue, pending payments
- Smart calendar (green/blue/red availability + booking counts)
- Daily booking view with View/Edit/Cancel/Mark Paid
- Module-specific booking (slots, hourly, full-day, half/full day)
- Duplicate booking prevention (same module + date + slot)
- Customer CRM with history and pending balances
- Payment tracking (Pending / Partial / Paid)
- Reports & analytics
- Notification reminders

## Project Structure

```
crm/
├── backend/
│   ├── config/          # DB, module constants
│   ├── controllers/     # API logic
│   ├── middleware/      # Auth, errors
│   ├── models/          # MongoDB schemas
│   ├── routes/          # REST routes
│   ├── scripts/         # Seed users
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/         # Axios client
│       ├── components/  # UI, calendar, bookings
│       ├── context/     # Auth
│       ├── pages/       # Routes
│       └── utils/
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend

```bash
cd backend
npm install
```

Copy environment file and configure:

```bash
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/venue_crm
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRE=7d
```

Seed default users:

```bash
npm run seed
```

Start API:

```bash
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
```

Optional — create `frontend/.env` (Vite proxy works without it in dev):

```env
VITE_API_URL=http://localhost:5000/api
```

Start dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000`

### 3. Default Login Credentials

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@venuecrm.com    | admin123  |
| Staff | staff@venuecrm.com    | staff123  |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/stats` | Dashboard data |
| GET | `/api/calendar/:module` | Month calendar |
| GET | `/api/calendar/config/:module` | Slots & types |
| GET | `/api/bookings/date?date=&module=` | Daily bookings |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Edit booking |
| DELETE | `/api/bookings/:id` | Cancel booking |
| PATCH | `/api/bookings/:id/mark-paid` | Mark paid |
| GET | `/api/customers` | Customer list |
| GET | `/api/reports/*` | Analytics |
| GET | `/api/notifications` | Alerts |

All routes except `/api/auth/login` and `/api/health` require `Authorization: Bearer <token>`.

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
NODE_ENV=production npm start
```

Serve `frontend/dist` via nginx or static hosting. Point API to your production URL and set `VITE_API_URL` before building.

## Capacitor (Android APK)

The UI is mobile-first and touch-friendly. To convert to APK:

```bash
cd frontend
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Venue CRM" com.venue.crm
npx cap add android
npx cap copy
npx cap open android
```

Update `capacitor.config.ts` to set `server.url` for dev or bundle API URL in production.

## MongoDB Collections

- `users` — Admin/staff accounts
- `bookings` — All venue bookings
- `customers` — Customer CRM records
- `payments` — Payment transaction log
- `notifications` — Alerts and reminders

## License

Private internal use.
