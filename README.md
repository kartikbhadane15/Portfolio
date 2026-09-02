# Kartik Bhadane | Dynamic Engineering Portfolio & Platform

A high-performance, full-stack developer portfolio and multi-tenant platform built with **React (Vite)**, **Node.js/Express**, **Prisma ORM**, and **PostgreSQL**.

---

## ✨ Features

- ⚡ **Personal Portfolio (`/kartik`)**: Fast, recruiter-optimized personal portfolio with smooth glassmorphism, responsive dark/light themes, and custom accent colors.
- 📄 **Recruiter Quick View (TL;DR Mode)**: 30-second executive summary tailored for hiring managers and technical recruiters with instant CV download.
- 🏢 **Multi-Tenant Dynamic Sub-Pages**: Dedicated personal links for users (`/:username`, `/:username/projects`, `/:username/experience`, and `/:username/case-study/:slug`).
- 🔐 **Secret Magic Key**: Admin button is completely hidden from public visitors. Unlocks dynamically with a continuous 3-click gesture on the user's logo.
- 👑 **Superadmin Control Panel (`/admin`)**:
  - Full CRUD operations for Projects, Experience, Skills, Credentials, and Profile details.
  - User Management: Generate credentials for new platform users, reset passwords, and oversee accounts.
- 📬 **Interactive Contact Inbox**: Real-time message storage with admin notification badges.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Vanilla CSS / Modern Design Tokens**
- **React Router v6**
- **Axios**

### Backend
- **Node.js** + **Express**
- **Prisma ORM** + **PostgreSQL**
- **JWT (JSON Web Tokens)** + **Bcrypt**
- **CORS** & **Dotenv**

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kartikbhadane15/Portfolio.git
cd Portfolio
```

### 2. Backend Setup
```bash
cd server
npm install
# Create a .env file with DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

### 4. Open in Browser
- Portfolio: `http://localhost:5173/kartik`
- Admin Portal: `http://localhost:5173/admin`
