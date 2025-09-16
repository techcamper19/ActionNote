# Operational Setup for ActionNote

This document outlines the technical steps required to deploy and operate the ActionNote SaaS product.  It assumes that you have access to the necessary cloud accounts (Vercel, Supabase, Stripe, email provider) and appropriate credentials.

## 1. Repository structure

```
actionnote/
  backend/        ← FastAPI server (see `backend/main.py`)
  frontend/       ← Next.js application (see `frontend/`)
  marketing/      ← Email templates and ad scripts
  growth_plan.md  ← 90‑day marketing plan
  operations.md   ← this document
```

## 2. Backend deployment

1. **Environment variables:** Create a `.env` file for the backend with at least:
   * `PORT` – default `8000`.
   * `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` – optional if you integrate Supabase.
   * `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` – your Stripe API keys.
   * Set `ALLOWED_ORIGINS` to your frontend’s domain (e.g. `https://actionnote.io`).

2. **Local development:** Run the backend with `uvicorn`:

   ```bash
   cd actionnote/backend
   uvicorn main:app --reload --port 8000
   ```

3. **Production deployment:** Use a cloud platform like **Render**, **Railway** or **Fly.io**.  Build a Dockerfile (not included here) that installs dependencies and runs `uvicorn main:app --host 0.0.0.0 --port $PORT`.  Ensure environment variables are configured in the hosting dashboard.

## 3. Frontend deployment (Vercel)

1. **Set up project:** Push the contents of `actionnote/frontend` to a Git repository.  In Vercel, create a new project from this repository.
2. **Environment variables:** In the Vercel dashboard, define:
   * `NEXT_PUBLIC_BACKEND_URL` – the URL of your FastAPI backend (e.g. `https://api.actionnote.io`).
   * `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` – values from your Supabase project.
3. **Install dependencies:** Vercel automatically runs `npm install` and `next build`.  If local development is needed, run:

   ```bash
   cd actionnote/frontend
   npm install
   npm run dev
   ```

4. **Custom domain:** In Vercel, add your domain (e.g. `actionnote.io`) and update DNS records at your domain registrar.  The root domain should point to Vercel’s IP addresses via A and CNAME records.

## 4. Supabase setup (database & authentication)

1. **Create Supabase project:** Sign up at [supabase.com](https://supabase.com) and create a new project.  Note the project’s URL and anon/service keys.
2. **Database schema:** In the SQL editor, create tables:
   ```sql
   -- Waitlist signups
   create table waitlist (
     id uuid default uuid_generate_v4() primary key,
     email text not null unique,
     inserted_at timestamp default now()
   );

   -- User transcripts & summaries
   create table summaries (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users(id),
     transcript text,
     summary text,
     tasks text[],
     created_at timestamp default now()
   );
   ```
3. **Auth configuration:** Enable **Email** and **Google** sign‑in providers under **Authentication → Settings → External OAuth Providers**.  Configure Google credentials via the Google Cloud Console.
4. **Storage (optional):** If you plan to store uploaded files, enable Supabase Storage and create a bucket.
5. **Row level security:** Use Supabase’s RLS policies to ensure users can only read their own summaries.

## 5. Stripe integration (payments)

1. **Create products:** In the Stripe dashboard, add two products—**Pro** ($9/month) and **Team** ($29/month).  Create recurring prices for each.
2. **API keys:** Copy your secret key and publishable key into the backend and frontend environments respectively.  Also create a webhook endpoint (e.g. `/stripe-webhook`) in the backend and register it in Stripe with the correct events (e.g. `checkout.session.completed`).
3. **Checkout session:** In the `create-checkout-session` endpoint of the backend, use the `stripe` Python library to create a session with the selected price ID and return the session’s URL.  In the frontend, redirect the user to this URL upon upgrade.
4. **Webhook handling:** Verify the signature using the webhook secret and update the user’s subscription status in Supabase when the session completes.

## 6. Analytics (GA4 or PostHog)

1. **GA4:** Create a new Google Analytics 4 property.  Copy the measurement ID into your frontend (e.g. via Google Tag Manager) to track page views and conversion events.  Alternatively, integrate **PostHog** for more detailed product analytics.
2. **Events to track:** waitlist signup, account creation, summary generation, export actions, upgrade attempts.

## 7. Support email

Set up a dedicated support address such as `help@actionnote.io` using your domain registrar or a service like Google Workspace.  Configure forwarding to your team’s inbox.  Add a contact form on the website that sends messages to this address.

## 8. Ongoing operations

* **Monitoring:** Use uptime monitoring (e.g. UptimeRobot) to track the health of your backend and frontend.
* **Backups:** Enable automated backups in Supabase and verify they complete successfully.
* **Security:** Enforce HTTPS, rotate API keys periodically and adhere to the principle of least privilege in Supabase RLS policies.
