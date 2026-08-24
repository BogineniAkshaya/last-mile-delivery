# Last-Mile Delivery Tracker

A full-stack web app for managing last-mile deliveries — order creation, automatic charge calculation, agent assignment, and delivery tracking, all in one place.

Built this to explore how a real delivery/logistics system might work under the hood: role-based access, nearest-agent assignment, failed delivery handling, and a full status tracking timeline.

---

## Features

- User registration & login with role-based access (Customer / Delivery Agent / Admin)
- Create and manage delivery orders
- Automatic delivery charge calculation
- Support for both B2B and B2C orders
- COD and Prepaid payment options
- Automatic nearest-agent assignment based on location
- Delivery agent availability management
- Order status tracking with a full timeline
- Failed delivery handling + rescheduling
- Agent reassignment on reschedule
- Admin filters (status, zone, agent)
- Admin status override
- Email notifications via Nodemailer

---

## Delivery Status Flow

```
CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
```

If a delivery fails:

```
FAILED → RESCHEDULED
```

---

## Tech Stack

**Frontend** — React, Vite, JavaScript, CSS
**Backend** — Node.js, Express.js
**Database** — MongoDB, Mongoose
**Auth & Security** — JWT, bcrypt
**Other** — Nodemailer, REST APIs

---

## Project Structure

```
last-mile-delivery
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── server.js
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with your MongoDB and JWT config, then run:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on the Vite dev server, usually `http://localhost:5173`

---

## User Roles

**Customer**
- Register & login
- Create and view orders
- Track deliveries and view history
- Reschedule failed deliveries

**Delivery Agent**
- Login
- View assigned orders
- Update delivery status (delivered / failed)
- View tracking history

**Admin**
- View all orders
- Filter by status, zone, agent
- View assigned agents
- Override order status
- View tracking info

---

## How Agent Assignment Works

When an order is created, the assignment service calculates the distance between the pickup location and all available agents, then picks the nearest one.

Once assigned, the agent's availability is updated so they don't get double-booked. When the delivery is completed or fails, they become available again.

---

## Tracking

Every important status change is logged in a separate tracking collection — status, remarks, and timestamp. This powers the tracking timeline shown on the frontend, e.g.:

```
PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → FAILED → RESCHEDULED
```

---

## Security

- Passwords hashed with bcrypt
- JWT-based authentication
- Protected routes for authenticated operations
- Sensitive config kept in environment variables
- `.env` and `node_modules` excluded from Git

---

## Future Improvements

- [ ] Real-time location tracking
- [ ] Map integration
- [ ] Route optimization
- [ ] SMS notifications
- [ ] Better analytics & reports
- [ ] Online payment integration

---

## Author
**Akshaya Bogineni**
