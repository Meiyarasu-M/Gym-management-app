# 🏋️ Smart Gym Management System

A full-stack gym management application built with the **MERN stack** — designed as a portfolio-level project with a modern UI.

## ✨ Features

- 🔐 **Role-Based Auth** — JWT authentication for Admin and Member roles
- 📊 **Dashboard Analytics** — Live stats, monthly revenue chart, plan distribution
- 👥 **Member Management** — Full CRUD with search, sort, and pagination
- 💳 **Payment Tracking** — Log payments, auto-extend subscriptions
- 📧 **Email Reminders** — Daily cron job sends expiry alerts via Nodemailer
- 👤 **Admin Profile** — Edit name, email, and password from the topbar

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Recharts, Zustand, Axios |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| Auth | JWT, bcrypt.js |
| Automation | node-cron, Nodemailer |

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and email credentials
node seeder.js     # Seed sample data
npm run dev        # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

## 🔑 Demo Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@gympro.com | admin123 |
| Member | rahul@example.com | member123 |

## ⚙️ Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Optional — for email reminders
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GymPro <your@gmail.com>
```
