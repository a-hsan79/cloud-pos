# Cloud POS Application - Deployment & Handover Guide

This document provides step-by-step instructions for deploying the production-ready Cloud POS application to Vercel with a managed cloud PostgreSQL database hosted on Neon.

## Architecture Highlights
- **Frontend & Backend**: Next.js App Router (TypeScript) deployed on Vercel.
- **Database**: Managed cloud PostgreSQL (Neon).
- **ORM**: Drizzle ORM.
- **Data Persistence**: **Strict No Local Storage Policy**. All business records (sales, payments, inventory, expenses, customers, daily closing) are persistently stored in cloud PostgreSQL. No local browser DB or offline queues.

---

## Step 1: Create the Neon PostgreSQL Database
1. Go to [Neon Console](https://console.neon.tech) and create a free project.
2. Create a database named `pos_db` (or use the default database provided).
3. Copy your pooled/direct connection string (`DATABASE_URL`). It looks like:
   `postgres://username:password@ep-xyz.region.aws.neon.tech/pos_db?sslmode=require`

---

## Step 2: Push Repository to GitHub
1. Initialize Git in your project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cloud POS Application"
   ```
2. Create a new repository on GitHub and push your code:
   ```bash
   git remote add origin https://github.com/your-username/cloud-pos.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Import into Vercel & Configure Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New → Project**.
2. Import your GitHub repository (`cloud-pos`).
3. Under **Environment Variables**, add the following required secrets:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string from Step 1.
   - `AUTH_SECRET`: A secure random secret string (minimum 32 characters).
   - `APP_URL`: Your production Vercel application URL (e.g., `https://cloud-pos.vercel.app`).
4. Click **Deploy**.

---

## Step 4: Apply Database Migrations & Initial Seed
The application automatically runs initialization and seeding when the first user logs in or when running migrations.
To run migrations via Drizzle Kit locally or in your CI/CD pipeline:
```bash
npx drizzle-kit push
```

---

## Step 5: Sign In & First Administrator Account
1. Open your deployed Vercel URL.
2. Log in using the default administrator credentials:
   - **Email**: `admin@pos.com`
   - **Password**: `admin123`
3. (Recommended) Change the admin password or create additional cashier/manager accounts through database records or user management.

---

## Step 6: Database Backups & Recovery (Neon)
- Neon provides automated daily point-in-time backups and branching.
- You can restore or branch your database instantly from the Neon Console without downtime.
