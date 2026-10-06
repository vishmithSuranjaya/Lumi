# 🚗 Lumi — Certified Pre-Owned & Luxury Vehicle Marketplace

> Sri Lanka's premier automotive marketplace for luxury, verified, and certified pre-owned vehicles.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.6-47A248?logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Routes](#-api-routes)
- [Authentication & Authorization](#-authentication--authorization)

---

## 🌟 Overview

**Lumi** is a full-stack web application built with **Next.js 16 (App Router)** that connects buyers and sellers of luxury and certified pre-owned vehicles in Sri Lanka. The platform features a dual-role system — regular users can browse listings, post advertisements, and manage their profiles, while administrators have a dedicated dashboard to oversee vehicles, advertisements, and user accounts.

Key highlights:
- 🔐 **JWT-based authentication** with role-based access control (User / Admin)
- 🤖 **AI-powered price predictor** to estimate vehicle market value
- 🖼️ **Cloud image uploads** via ImageKit
- 📧 **Transactional email** notifications via Resend
- 🗄️ **MongoDB** as the primary database

---

## ✨ Features

### For Users
- Browse and search vehicle listings with filters (make, model, year, price, etc.)
- View detailed vehicle pages with image galleries
- Post vehicle advertisements with multi-image uploads
- Receive offers on listed vehicles and manage them
- User profile management with avatar uploads
- AI-driven **Price Predictor** to estimate vehicle fair market value

### For Administrators
- Admin dashboard with key metrics and overview
- Full CRUD management for vehicle listings
- Advertisement moderation and approval workflow
- User account management
- Secure role-gated access via Next.js Middleware

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.3 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19 + Tailwind CSS 4 |
| **Database** | MongoDB 7.6 |
| **Authentication** | Custom JWT via `jose` + bcryptjs |
| **Image Storage** | ImageKit |
| **Email** | Resend |
| **Font** | Geist (Sans & Mono) |

---

## 📁 Project Structure

```
myfirstapp/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── globals.css             # Global styles
│   ├── about_us/               # About Us page
│   ├── contact_us/             # Contact Us page
│   ├── offers/                 # User offers page
│   ├── post_advertisement/     # Create new vehicle listing
│   ├── price-predictor/        # AI price estimation tool
│   ├── profile/                # User profile (protected)
│   ├── signin/                 # Authentication pages
│   ├── signup/
│   ├── vehicles/               # Vehicle catalog & detail pages
│   └── admin/                  # Admin dashboard (role-protected)
│       ├── advertisements/     # Ad management
│       └── vehicles/           # Vehicle management
│
├── components/                 # Reusable React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── HomeAdSlider.tsx
│   ├── VehicleCatalog.tsx
│   ├── VehicleCategoryGrid.tsx
│   ├── VehicleLogoSlider.tsx
│   ├── admin/                  # Admin-specific components
│   └── auth/                   # Auth form components
│
├── app/api/                    # REST API Route Handlers
│   ├── auth/                   # Sign-in, sign-up, sign-out
│   ├── advertisements/         # Advertisement CRUD
│   ├── vehicles/               # Vehicle listing CRUD (admin)
│   ├── user/                   # User profile endpoints
│   ├── predict/                # Price prediction endpoint
│   ├── upload/                 # ImageKit upload handler
│   └── admin/                  # Admin-only data endpoints
│
├── context/
│   └── AuthContext.tsx         # Global auth state (React Context)
│
├── lib/
│   ├── auth.ts                 # JWT helpers & session utilities
│   ├── mongodb.ts              # MongoDB connection singleton
│   ├── imagekit.ts             # ImageKit SDK config
│   ├── email.ts                # Resend email templates
│   └── validations/            # Input validation schemas
│
├── middleware.ts               # Route protection (JWT-based)
└── next.config.ts              # Next.js configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A running **MongoDB** instance (local or Atlas)
- [ImageKit](https://imagekit.io/) account for image uploads
- [Resend](https://resend.com/) account for emails

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/vishmithSuranjaya/Lumi.git
cd Lumi

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.local.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# Authentication
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# ImageKit (Image Storage)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Resend (Email)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📡 API Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/signin` | Sign in & receive JWT cookie | No |
| `POST` | `/api/auth/signout` | Clear auth cookie | User |
| `GET` | `/api/user` | Get current user profile | User |
| `PUT` | `/api/user` | Update user profile | User |
| `GET` | `/api/advertisements` | List all active advertisements | No |
| `POST` | `/api/advertisements` | Create a new advertisement | User |
| `PUT` | `/api/advertisements` | Update an advertisement | User |
| `DELETE`| `/api/advertisements` | Delete an advertisement | User |
| `GET` | `/api/vehicles` | List vehicles | No |
| `POST` | `/api/vehicles` | Add a new vehicle | Admin |
| `POST` | `/api/upload` | Upload image to ImageKit | User |
| `POST` | `/api/predict` | AI vehicle price prediction | No |
| `GET` | `/api/admin` | Admin dashboard stats | Admin |

---

## 🔒 Authentication & Authorization

Lumi uses a **custom stateless JWT authentication** system without any third-party auth library:

- On sign-in, a signed JWT is issued and stored as an **HTTP-only cookie** (`lumi_auth_token`)
- The JWT payload includes: `id`, `email`, and `role` (`"user"` | `"admin"`)
- **Next.js Middleware** (`middleware.ts`) intercepts requests and enforces route-level access:

| Route Pattern | Access Rule |
|---|---|
| `/profile/*` | Requires authenticated session (any user) |
| `/admin/*` | Requires `role: admin` |
| `/signin`, `/signup` | Redirects already-authenticated users |

- Passwords are hashed with **bcryptjs** before storage
- Token verification uses **jose** (Web Crypto API compatible — works in Next.js Edge Runtime)

---

## 👤 Author

**Vishmith Suranjaya**
Full-Stack Developer | Next.js · TypeScript · MongoDB

[![GitHub](https://img.shields.io/badge/GitHub-vishmithSuranjaya-181717?logo=github)](https://github.com/vishmithSuranjaya)

---

> *Built with Next.js 16, React 19, and MongoDB*
