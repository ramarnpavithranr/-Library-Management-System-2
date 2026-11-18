# Vercel Deployment Guide - SSEC Smart Library Management System

This document outlines the step-by-step instructions for deploying the **SSEC Smart Library Management System** on **Vercel**.

---

## 1. Prerequisites
- A **Vercel account** ([vercel.com](https://vercel.com)).
- Access to the GitHub repository: `https://github.com/ramarnpavithranr/-Library-Management-System-2.git`.
- Your **Supabase Project Credentials** (URL and Anon Key).

---

## 2. Quick Deploy via Vercel Dashboard

1. **Log in to Vercel** and navigate to your [Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Under **"Import Git Repository"**, select your GitHub account and choose:
   ```
   ramarnpavithranr/-Library-Management-System-2
   ```
4. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js` (detected automatically via `vercel.json`).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `next build` (default).
   - **Output Directory**: `.next` (default).
   - **Install Command**: `npm install` (default).

---

## 3. Environment Variables Configuration

Expand the **"Environment Variables"** section in the Vercel project configuration and enter the following keys:

### A. Public Client Environment Variables (Required)
| Variable Name | Example / Production Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | `SSEC Smart Library Management System` | Institutional application title |
| `NEXT_PUBLIC_COLLEGE_NAME` | `Sree Sakthi Engineering College` | College name |
| `NEXT_PUBLIC_COLLEGE_LOCATION` | `Coimbatore` | Institution location |
| `NEXT_PUBLIC_LIBRARY_NAME` | `Central Smart Library` | Library facility name |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yvogbzoolyosvilgtyxi.supabase.co` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_I2tfBLTvezL4ckvlIjDgoQ_IL3blLtj` | Supabase publishable anonymous key |
| `NEXT_PUBLIC_DEFAULT_LOAN_DAYS` | `14` | Standard academic loan period (days) |
| `NEXT_PUBLIC_FINE_PER_DAY` | `5` | Daily fine assessed on overdue loans |
| `NEXT_PUBLIC_MAX_BOOKS_PER_STUDENT` | `3` | Maximum active loans per student member |

### B. Server-Side Environment Variables (Optional / Backend Direct Connection)
| Variable Name | Description |
| :--- | :--- |
| `DATABASE_URL` | Direct connection pooler string for PostgreSQL |
| `POSTGRES_URL` | Direct connection pooler string for PostgreSQL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side service key for auto-provisioning students |

> [!IMPORTANT]
> Never prefix sensitive credentials (database passwords, service keys) with `NEXT_PUBLIC_`. Keep them server-side only.

---

## 4. Deploying the Application

1. Click **"Deploy"**.
2. Vercel will install dependencies (`npm install`), execute `next build`, and deploy all 39 static and dynamic routes.
3. Once the build finishes, Vercel will provide your production URL:
   ```
   https://library-management-system-2.vercel.app
   ```

---

## 5. Portal URL Architecture

| Portal | URL Route | Description | Role Required |
| :--- | :--- | :--- | :--- |
| **Gateway** | `/` | Central Dual-Portal Landing Page | Public |
| **Admin Login** | `/admin/login` | Administrator Sign In Form | Public |
| **Admin Dashboard** | `/admin/dashboard` | Main Administrative Operations | `admin` |
| **Book Issue** | `/admin/issue` | Book borrowing & real-time stock deduction | `admin` |
| **Book Return** | `/admin/return` | Check-in returns & stock restoration (+1) | `admin` |
| **Pre-Bookings** | `/admin/pre-bookings`| Reservation hold approvals & pickup schedules | `admin` |
| **Membership** | `/admin/membership` | Digital student library card approvals | `admin` |
| **Fine Management** | `/admin/fines` | Overdue fines & penalty logs | `admin` |
| **Report Analysis** | `/admin/reports` | Circulation intelligence & compliance exports | `admin` |
| **Student Login** | `/student/login` | Student Sign In Form | Public |
| **Student Dashboard**| `/student/dashboard`| Personalized student borrowing hub | `student` |
| **Book Catalog** | `/student/books` | Search textbook stacks and check availability| `student` |
| **My Reservations** | `/student/pre-bookings`| Active book reservation status | `student` |
| **Digital Pass** | `/student/membership` | Verifiable digital pass with barcode | `student` |

---

## 6. Route Protection & Security Architecture
- **Server-Side Middleware**: Next.js Edge Middleware (`src/middleware.ts`) inspects the session role on every route change.
- **Client-Side Layout Guards**: Both `AdminLayout` and `StudentLayout` prevent flashing protected content, handling live Supabase session restoration with zero latency.
- **Role Isolation**: Students attempting to navigate to `/admin/*` are automatically blocked and redirected. Administrators attempting to navigate to `/student/*` are blocked and redirected.
