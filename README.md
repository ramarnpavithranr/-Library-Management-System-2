# Sree Sakthi Engineering College - Central Smart Library Management System 📚🎓

A modern, institutional **Library Management System** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase Authentication & Database**.

Designed specifically for institutional academic administration with direct, separated portals for **Administrators** and **Students** within a single unified project.

---

## 🏛️ Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions & API Routes)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Proton-inspired Burgundy & Cream Theme)
- **Authentication & Backend:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Spreadsheet Import:** [SheetJS (xlsx)](https://sheetjs.com/)
- **Deployment Platform:** [Vercel](https://vercel.com/)
- **Version Control:** [GitHub](https://github.com/)

---

## 🔗 Dedicated Application Routes

The system uses direct, distinct routes within the same deployment. There is no intermediate portal-selection page:

| Portal | URL Path | Description |
| :--- | :--- | :--- |
| **Admin Login** | `/admin/login` | Direct login page for Library Administrators |
| **Admin Dashboard** | `/admin` | Complete administrative command center & circulation analytics |
| **Student Login** | `/student/login` | Direct student login page using Admin-assigned credentials |
| **Student Dashboard** | `/student` | Student portal for book reservations, loans, and digital pass |

---

## 🔐 Authentication & Security Model

- **Admin-Controlled Account Provisioning:** Public student registration is completely disabled. Only Administrators can create student accounts from the Admin Student Records page (`/admin/students`).
- **Internal Email Mapping:** Supabase Authentication requires an email/password pair. The system internally maps the student's username to a unique institutional identifier (e.g., `<username>@sreesakthi.edu.in`). Students log in using **only** their assigned **Username** and **Password** without needing to know or enter the internal email.
- **Zero Plain-Text Password Storage:** Passwords are never stored in plain text anywhere in the database tables or local storage; credentials are securely managed through Supabase Authentication.
- **Direct Auth-to-Profile Linking:** Each student's profile record in the database is linked directly to their Supabase Auth User ID (`authUserId`).

---

## ⚙️ Environment Variables

Create a file named `.env.local` in the project root directory (or configure them in the Vercel dashboard):

```env
# Institutional Information
NEXT_PUBLIC_APP_NAME="SSEC Smart Library Management System"
NEXT_PUBLIC_APP_VERSION="v2.4 Smart Release"
NEXT_PUBLIC_COLLEGE_NAME="Sree Sakthi Engineering College"
NEXT_PUBLIC_COLLEGE_SHORT_NAME="Sree Sakthi Engg College"
NEXT_PUBLIC_COLLEGE_LOCATION="Coimbatore"
NEXT_PUBLIC_LIBRARY_NAME="Central Smart Library"
NEXT_PUBLIC_LIBRARY_EMAIL="library@sreesakthi.edu.in"
NEXT_PUBLIC_LIBRARY_PHONE="+91 422 236 9900"
NEXT_PUBLIC_CURRENCY_SYMBOL="₹"

# Circulation Policies
NEXT_PUBLIC_DEFAULT_LOAN_DAYS="14"
NEXT_PUBLIC_FINE_PER_DAY="5"
NEXT_PUBLIC_MAX_BOOKS_PER_STUDENT="3"

# Supabase Authentication & Database
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-publishable-key"

# Optional: Supabase Service Role Key (SERVER-SIDE ONLY - NEVER EXPOSE AS NEXT_PUBLIC)
# SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

> **Security Note:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or any database secret with the `NEXT_PUBLIC_` prefix. Client code only accesses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 🗄️ Supabase Database Configuration

The application connects to existing Supabase PostgreSQL tables:

### 1. `Students` Table Structure
- `id` (UUID or TEXT - matches Supabase `auth.users.id`)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `username` (TEXT, unique)
- `name` (TEXT)
- `roll_number` (TEXT)

### 2. `Books` Table Structure
- `id` (TEXT / UUID)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `title` (TEXT)
- `author` (TEXT)
- `category` (TEXT)
- `ISBN` (TEXT)
- `available_quantity` (INTEGER)
- `book_id` (TEXT)

### 3. Database Permissions (Run in Supabase SQL Editor)
To ensure the application can read and write records using the Supabase client:
```sql
GRANT ALL ON public."Students" TO anon, authenticated, service_role;
GRANT ALL ON public."Books" TO anon, authenticated, service_role;
```

### 4. Supabase Email Confirmation Setting
To allow newly provisioned student accounts to authenticate immediately without sending verification emails:
1. Go to your **Supabase Dashboard**.
2. Navigate to **Authentication** → **Providers** → **Email**.
3. Toggle **"Confirm email"** to **OFF**.
4. Click **Save**.

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- Admin Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Student Login: [http://localhost:3000/student/login](http://localhost:3000/student/login)

### 4. Build for Production Locally
```bash
npm run build
npm run start
```

---

## 📦 GitHub Push Instructions

To push the repository to GitHub:

```bash
# 1. Initialize git repository (if not already initialized)
git init

# 2. Add remote repository
git remote add origin https://github.com/ramarnpavithranr/-Library-Management-System-2.git

# 3. Stage all files (respecting .gitignore)
git add .

# 4. Verify that .env and .env.local are NOT staged
git status

# 5. Commit changes
git commit -m "feat: production-ready library management system for Vercel deployment"

# 6. Set main branch and push
git branch -M main
git push -u origin main
```

> **Important:** `.env.local` is ignored by `.gitignore` and will never be committed to GitHub.

---

## 🌐 Vercel Deployment Instructions

Follow these steps to deploy on Vercel:

1. **Sign in to Vercel:** Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account.
2. **Add New Project:**
   - Click **"Add New..."** → **"Project"**.
   - Select your GitHub repository: `ramarnpavithranr/-Library-Management-System-2`.
3. **Configure Project Settings:**
   - **Framework Preset:** `Next.js` (detected automatically)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (or default `next build`)
   - **Output Directory:** `.next` (default)
4. **Configure Environment Variables:**
   Under **Environment Variables**, add the variables from `.env.local`:
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_COLLEGE_NAME`
   - `NEXT_PUBLIC_COLLEGE_SHORT_NAME`
   - `NEXT_PUBLIC_COLLEGE_LOCATION`
   - `NEXT_PUBLIC_LIBRARY_NAME`
   - `NEXT_PUBLIC_LIBRARY_EMAIL`
   - `NEXT_PUBLIC_LIBRARY_PHONE`
   - `NEXT_PUBLIC_CURRENCY_SYMBOL`
   - `NEXT_PUBLIC_DEFAULT_LOAN_DAYS`
   - `NEXT_PUBLIC_FINE_PER_DAY`
   - `NEXT_PUBLIC_MAX_BOOKS_PER_STUDENT`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - *(Optional server-only)* `SUPABASE_SERVICE_ROLE_KEY`
5. **Deploy:** Click **"Deploy"**.
6. **Access Production URLs:**
   - Admin Login: `https://<your-project>.vercel.app/admin/login`
   - Admin Dashboard: `https://<your-project>.vercel.app/admin`
   - Student Login: `https://<your-project>.vercel.app/student/login`
   - Student Dashboard: `https://<your-project>.vercel.app/student`

---

## 📄 License
Internal academic application developed for Sree Sakthi Engineering College. All rights reserved.
