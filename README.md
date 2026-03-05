# Trip Wise Nepal

Trip Wise Nepal is a full‑stack web application for discovering eco‑friendly accommodations in Nepal, managing bookings, and handling online payments. It provides a user‑facing booking experience and an admin dashboard to manage accommodations, room types, extras, bookings, users, and reviews.

## Features

- User authentication with registration, login, logout, and password reset (email link)
- Role‑based access (user vs admin) using middleware and route protection
- Browse, search, and filter accommodations with location, price, amenities, and rating
- Detailed accommodation pages with images, eco‑friendly highlights, and map location
- Room types and optional extras (e.g. breakfast, transport) per accommodation
- Booking flow with price breakdown, taxes, and service fee
- eSewa payment integration with server‑side verification and status callbacks
- User dashboard to view, edit, and cancel bookings (with special handling for paid bookings)
- Reviews and ratings for accommodations
- Admin dashboard for:
  - Managing accommodations, room types, and optional extras
  - Managing users and roles
  - Viewing and managing all bookings
  - Viewing reviews

## Tech Stack

**Frontend**

- Next.js (App Router)
- React, TypeScript
- React Hook Form + Zod for form validation
- Axios for API calls
- React Toastify for notifications
- Tailwind‑style utility classes
- Leaflet / React‑Leaflet for maps

**Backend**

- Node.js, Express
- TypeScript
- MongoDB with Mongoose
- Zod for DTO and type validation
- Multer for image uploads
- JSON Web Tokens (JWT) for auth
- Nodemailer for email
- eSewa integration for payments

## Project Structure

- backend/
  - Express app, routes, controllers, services, repositories, models
  - Authentication, bookings, accommodations, room types, extras, reviews, payments
- frontend/
  - Next.js app
  - Public pages, auth flows, user dashboard, admin dashboard
  - API client layer in lib/api and server actions in lib/actions

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm or yarn
- MongoDB running locally or in the cloud
- eSewa test/production credentials (for payment integration)
- SMTP credentials (for password reset emails)

---

### Backend Setup

1. Go to the backend folder:

   ```bash
   cd backend
   npm install
   ```

2. Create a .env file in backend/:

   ```env
   PORT=5050
   MONGODB_URI=mongodb://localhost:27017/trip_wise_nepal_backend
   JWT_SECRET=your_jwt_secret_here

   # Optional
   TAX_PERCENT=13
   SERVICE_FEE=0
   ```

3. Run the backend in development:

   ```bash
   npm run dev
   ```

   The API will be available at http://localhost:5050/api.

---

### Frontend Setup

1. Go to the frontend folder:

   ```bash
   cd frontend
   npm install
   ```

2. (Optional but recommended) Create frontend/.env.local if you deploy the backend separately:

   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5050
   ```

   In development, the frontend uses this as the base URL for Axios and also has a Next.js rewrite for /api → http://localhost:5050/api.

3. Run the frontend dev server:

   ```bash
   npm run dev
   ```

4. Open the app at:

   - Frontend: http://localhost:3000
   - Backend API (example): http://localhost:5050/api/accommodations

---

## Key Back‑End Endpoints (Overview)

- Auth: /api/auth/* (register, login, profile, password reset)
- Admin users: /api/admin/users/*
- Accommodations: /api/accommodations/*
- Room types: /api/room-types/*
- Optional extras: /api/optional-extras/*
- Bookings: /api/bookings/*
- Reviews: /api/reviews/*
- Payments (eSewa): /api/payment/esewa/*

For full details, see the route files under backend/src/routes.

---

## Development Scripts

**Backend** (in backend/)

- npm run dev – start dev server with nodemon + ts-node
- npm run build – compile TypeScript
- npm test – run Jest tests

**Frontend** (in frontend/)

- npm run dev – start Next.js dev server
- npm run build – production build
- npm start – run production server
- npm run lint – run ESLint
- npm test – run Jest tests

---

## Authentication & Authorization

- JWT‑based auth; tokens are stored in HTTP‑only cookies on the frontend.
- Middleware protects admin and user routes:
  - /admin/* – admin only
  - /user/* – authenticated user or admin
- Frontend middleware in frontend/proxy.ts enforces route access and redirects.

---

## Payments

- Integrated with eSewa:
  - Backend generates the transaction and redirects to eSewa.
  - Success callback verifies payment via eSewa’s status API.
  - Booking paymentStatus and bookingStatus are updated accordingly.

---