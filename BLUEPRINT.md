# Ouvriers Ivoiriens — Project Blueprint
> Source of truth. Mirrors Miro board: https://miro.com/app/board/uXjVGr3sgow=/
> Update this file whenever the Miro board is updated.

---

## Project Overview
Mobile-first platform connecting qualified artisans (electricians, plumbers, tradespeople)
with clients in real time for repair services. Targets Côte d'Ivoire and the WAEMU region.
Android-first. Bilingual (French / English). Low-bandwidth optimised.
## Build Order
1. Backend API (artisan-api) — Node.js + Fastify + Prisma + Supabase
2. Frontend Web (Ouvriers-Ivoiriens-MVP) — React, connects to live API
3. Mobile App (artisan-mobile) — React Native + Expo (LAST)

## Repo Map
- artisan-api          → Railway (persistent Node.js backend)
- Ouvriers-Ivoiriens-MVP → Vercel (React web app + admin dashboard)
- artisan-mobile       → Google Play Store (built last)
## User Roles
- Client — individuals and businesses needing repair services
- Artisan — electricians, plumbers, and other tradespeople
- Admin — platform moderators and managers

## Confirmed Tech Stack
| Layer             | Choice                                        |
|-------------------|-----------------------------------------------|
| Mobile            | React Native + Expo (TypeScript)              |
| Backend API       | Node.js + Fastify (TypeScript)                |
| ORM               | Prisma                                        |
| Database          | Supabase (PostgreSQL + PostGIS)               |
| Cache + Queues    | Upstash Redis + BullMQ                        |
| Real-time         | Socket.io                                     |
| Payments          | CinetPay (Orange Money + MTN + Wave)          |
| SMS / OTP         | Africa's Talking                              |
| Push Notifications| Firebase FCM                                  |
| File Storage      | Supabase Storage                              |
| Backend Hosting   | Railway                                       |
| Admin Web         | Vercel                                        |
| CDN + DDoS        | Cloudflare                                    |
| Error Tracking    | Sentry                                        |
| Uptime Monitoring | BetterStack                                   |

---

## Database Schema (PostgreSQL via Prisma)

### users
- id (uuid, PK)
- name (varchar)
- email (varchar)
- phone (varchar)
- password_hash (varchar)
- role (enum: client / artisan / admin)
- avatar_url (varchar)
- created_at (timestamp)

### artisan_profiles
- id (uuid, PK)
- user_id (uuid, FK → users)
- category (varchar)
- skills (text[])
- bio (text)
- hourly_rate (decimal)
- experience_years (int)
- is_verified (boolean)
- is_available (boolean)
- rating_avg (decimal)
- total_jobs (int)
- latitude (decimal)
- longitude (decimal)

### service_requests
- id (uuid, PK)
- client_id (uuid, FK → users)
- artisan_id (uuid, FK → users)
- title (varchar)
- description (text)
- category (varchar)
- status (enum: requested / quoted / accepted / in_progress / completed)
- location_address (varchar)
- latitude (decimal)
- longitude (decimal)
- budget (decimal)
- created_at (timestamp)

### quotes
- id (uuid, PK)
- request_id (uuid, FK → service_requests)
- artisan_id (uuid, FK → artisan_profiles)
- price (decimal)
- message (text)
- status (enum: pending / accepted / rejected)
- created_at (timestamp)

### messages
- id (uuid, PK)
- sender_id (uuid, FK → users)
- receiver_id (uuid, FK → users)
- request_id (uuid, FK → service_requests)
- content (text)
- is_read (boolean)
- sent_at (timestamp)

### reviews
- id (uuid, PK)
- client_id (uuid, FK → users)
- artisan_id (uuid, FK → artisan_profiles)
- request_id (uuid, FK → service_requests)
- rating (int)
- comment (text)
- created_at (timestamp)

### transactions
- id (uuid, PK)
- request_id (uuid, FK → service_requests)
- client_id (uuid, FK → users)
- artisan_id (uuid, FK → artisan_profiles)
- amount (decimal)
- currency (varchar)
- payment_method (enum: orange_money / mtn / wave / card)
- status (enum: pending / success / failed)
- provider_ref (varchar)
- created_at (timestamp)

### categories
- id (uuid, PK)
- name (varchar)
- icon_url (varchar)
- is_active (boolean)

---

## Business Rules
- Artisans must be admin-verified (is_verified = true) before appearing in search
- Reviews only allowed after job status = completed
- Payments processed through CinetPay (single API for Orange Money + MTN + Wave)
- OTP phone verification required for all users at registration
- PostGIS ST_DWithin used to find artisans within X km of client location
- Socket.io rooms scoped per job_id — client + artisan share one room per job
- BullMQ handles: push notifications, payment webhook retries (max 3), SMS
- JWT access token: 15 minutes. Refresh token: 30 days, stored in DB with device_id
- Rejected artisan profiles loop back to Step 1 of onboarding for resubmission

---

# PHASE 1 — Auth & Registration
> Miro diagram: Phase 1 — Auth & Registration Flow (x:-2000, y:0)
> Build weeks: 1–4

## User Flow
1. User visits site
2. Decision: Has account?
   - YES → /login (email + password)
   - NO  → /register (name, email, password)

## Login Flow
- User enters credentials at /login
- Backend validates: credentials valid?
  - YES → apply RLS policy via has_role()
  - NO  → show error → retry loop
- Forgot password → /forgot-password → receive reset email link → set new password → back to /login

## Registration Flow
- User fills /register form
- Select role: Customer or Artisan
  - Customer → Customer Account Created
  - Artisan  → Worker Account Created
- Both → RLS policy applied via has_role()

## Post-Auth Routing
- has_role() = client  → redirect to /dashboard/customer
- has_role() = artisan → redirect to Worker Onboarding (Phase 2)
- has_role() = admin   → redirect to /admin

## Pages to Build
- /login
- /register
- /forgot-password

## Backend Endpoints
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/send-otp
- POST /auth/verify-otp

## Security
- bcrypt password hashing
- JWT access token (15min) + refresh token (30 days)
- expo-secure-store for token storage on mobile (never AsyncStorage)
- Axios interceptor: attach Bearer token, auto-refresh on 401
- RLS policies in Supabase enforcing role-based data access

## ✅ Gate — Do not proceed to Phase 2 until:
- Client and artisan can register and land on correct screens
- Login works with valid credentials, shows error on invalid
- Token refresh works silently on 401
- Invalid token redirects to /login

---

# PHASE 2 — Worker Onboarding & Dashboard
> Miro diagram: Phase 2 — Worker Onboarding & Dashboard Flow (x:500, y:0)
> Build weeks: 5–6

## User Flow
1. Worker lands on /dashboard/worker after registration
2. Decision: Profile complete?
   - YES → go straight to dashboard
   - NO  → start 4-step onboarding form

## Onboarding Multi-Step Form
- Step 1: Basic Profile (name, phone, location, bio) → saved to profiles table
- Step 2: Skills & Hourly Rate → saved to worker_profiles
- Step 3: Add Services (name, description, price) → saved to worker_services
- Step 4: Upload Portfolio Images → uploaded to Supabase Storage → URLs saved to DB
- On submit → profile status = pending_verification

## Admin Verification Flow
- Admin reviews submission at /admin → Worker Verification tab
- Decision: Approve or Reject?
  - APPROVE → is_verified = true → worker listed in search
  - REJECT  → worker notified → loops back to Step 1 to resubmit

## Worker Dashboard Actions (post-verification)
- /dashboard/worker — view stats (jobs, earnings, profile completeness)
- /dashboard/worker/profile — edit profile and services
- /dashboard/worker/services — manage services (CRUD)
- /dashboard/worker/reviews — view received reviews
- Availability calendar — set working hours

## Pages to Build
- /dashboard/worker
- /dashboard/worker/profile
- /dashboard/worker/services
- /dashboard/worker/reviews

## Backend Endpoints
- POST /artisans/profile
- GET  /artisans/profile/:id
- POST /upload/avatar
- POST /upload/portfolio
- PATCH /admin/artisans/:id/verify (admin role only)

---

# PHASE 3 — Customer & Job Flow
> Miro diagram: Phase 3 — Customer & Job Flow (x:3200, y:0)
> Build weeks: 7–9

## User Flow
1. Customer logs in → /dashboard/customer (view active jobs)
2. Decision: Browse workers or post a job?

## Browse Workers Path
- Search & browse workers (filters: category, distance, rating)
- View worker profile (tabs: services, portfolio, reviews)
- Can proceed to post a job from the profile

## Job Posting Flow
- /post-job form: title, category, location picker, budget
- Submit → saved to service_requests table
- Workers notified via FCM push notification (BullMQ background job)

## Quote & Negotiation Flow
- Artisan receives notification → views job → sends quote (price + message)
- Quote saved to quotes table
- Customer notified of new quote
- Customer reviews quotes → Decision: Accept?
  - YES → job status = accepted → proceed to execution
  - NO  → quote rejected → customer views other quotes (loop)

## Job Execution Flow
- Job status: accepted → in_progress → completed
  - Artisan controls status updates
  - If not completed → stays in_progress (feedback loop)

## Post-Job Flow
- Job completed → customer leaves review (star rating + comment)
- Review saved to reviews table
- Only available after status = completed

## Messaging (runs in parallel)
- /messages — conversation list and chat view
- Once job accepted → client and artisan can chat
- Socket.io room per job_id
- Message saved: sender_id, receiver_id, request_id, content, timestamp
- Unread badge on bottom tab navigator

## Pages to Build
- /dashboard/customer
- /post-job
- /dashboard/customer/jobs
- /messages

## Backend Endpoints
- POST /jobs
- GET  /jobs
- POST /jobs/:id/quotes
- PATCH /quotes/:id/accept
- PATCH /jobs/:id/status
- Socket.io events: send_message, join_room, receive_message

---

# PHASE 4 — Admin Dashboard & Launch Polish
> Miro diagram: Phase 4 — Admin Dashboard & Launch Polish (x:5800, y:0)
> Build weeks: 10–12

## Admin Auth
- Admin logs in → /admin dashboard overview

## Admin Dashboard Tabs

### Users Tab
- View all users (search, filter by role)
- Actions: activate, suspend, delete account

### Categories Tab
- View all service categories
- Actions: add, edit, remove category
- Toggle is_active status

### Reports Tab
- View flagged content
- Review each report → Decision: Take action?
  - DISMISS → report closed
  - ACT     → remove content or warn/suspend user

### Worker Verification Tab
- Queue of pending artisan submissions
- Review profile + documents
- Decision: Approve or Reject?
  - APPROVE → is_verified = true → worker live in search
  - REJECT  → worker notified, can resubmit

### Analytics Tab
- Total users, total jobs, revenue, top categories
- Built with Recharts

## Technical Polish (pre-launch checklist)
- Static pages: /about, /contact, /faq, /terms, /privacy
- SEO meta tags on every page
- Performance: lazy load screens, image compression (sharp)
- Error boundaries and loading states throughout the app
- Rate limiting on all auth endpoints (@fastify/rate-limit)
- Zod validation on all request bodies
- Supabase RLS audit — no data leaks between users
- npm audit — fix all high/critical vulnerabilities
- Redis cache on artisan search (TTL: 60s)
- Sentry SDK in mobile app and backend
- BetterStack uptime monitor on Railway URL + /health endpoint
- Full E2E test on real low-end Android device (Tecno/Itel + slow 3G)

## Pages to Build
- /admin (tabs: users, categories, reports, verification, analytics)
- /about, /contact, /faq, /terms, /privacy

## Backend Endpoints
- GET    /admin/users
- PATCH  /admin/users/:id/status
- GET    /admin/categories
- POST   /admin/categories
- PATCH  /admin/categories/:id
- DELETE /admin/categories/:id
- GET    /admin/reports
- PATCH  /admin/reports/:id/resolve
- GET    /admin/transactions
- GET    /admin/analytics
- GET    /health → returns { status: 'ok' }

## ✅ Gate — Do not launch until:
- All tests passing (Supertest integration tests)
- Full user journey tested end-to-end: register → post job → quote → pay → review
- CinetPay sandbox payment confirmed working
- Africa's Talking OTP sandbox confirmed working
- Sentry receiving events
- BetterStack monitor is green
- Zero high/critical npm vulnerabilities

---

# PAYMENT INTEGRATION
> Weeks: 10

## Provider: CinetPay
- Single API aggregating Orange Money, MTN Mobile Money, Wave, Visa/Mastercard
- One API key, one webhook, one dashboard
- Register at cinetpay.com → get API_KEY and SITE_ID

## Flow
1. Client selects payment method (Orange Money / MTN / Wave)
2. POST /payments/initiate → call CinetPay API with amount + method
3. Mobile opens CinetPay hosted payment page in WebView
4. CinetPay processes payment → sends webhook to POST /payments/webhook
5. On success → transactions.status = 'success', job released to artisan
6. On failure → BullMQ retries webhook up to 3 times, then notifies client
7. Deep link returns user to app on success/failure

## Environment Variables Needed
- CINETPAY_API_KEY
- CINETPAY_SITE_ID

---

# 13-WEEK BUILD ROADMAP
> Miro diagram: 13-Week Build Roadmap (x:4500, y:11000)

## Week 1–2: Foundation
- Create 3 GitHub repos: artisan-mobile, artisan-api, artisan-admin
- Set up accounts: Supabase, Upstash Redis, Railway, Vercel, Cloudflare
- Initialise Node.js + Fastify + Prisma
- Write Prisma schema for all 8 tables
- Run first migration against Supabase
- Scaffold React Native + Expo app
- Set up GitHub Actions CI/CD (push to main → auto-deploy Railway + Vercel)

## Week 3–4: Authentication ✅ GATE
- POST /auth/register, /auth/login, /auth/refresh
- POST /auth/send-otp, /auth/verify-otp (Africa's Talking)
- JWT + RBAC middleware
- Mobile: Register, Login, OTP screens
- expo-secure-store token storage
- Axios interceptor with auto-refresh
- GATE: full auth flow tested before proceeding

## Week 5–6: Profiles & Search
- POST /artisans/profile + GET /artisans/search (PostGIS)
- Enable PostGIS: CREATE EXTENSION postgis in Supabase SQL editor
- POST /upload/avatar, /upload/portfolio → Supabase Storage
- Mobile: 4-step onboarding form, search screen, worker profile screen
- Basic admin web: login + verification queue

## Week 7–8: Jobs & Quotes
- POST /jobs, GET /jobs
- POST /jobs/:id/quotes, PATCH /quotes/:id/accept
- PATCH /jobs/:id/status
- BullMQ job: notify nearby artisans via FCM on new job post
- Mobile: post-job form, job detail screen, quote cards, status tracker
- Post-completion: review + rating form

## Week 9: Real-Time Chat
- Socket.io server on Fastify with JWT auth
- socket.join(job_id) room logic
- Redis Pub/Sub adapter (@socket.io/redis-adapter)
- Mobile: Gifted Chat UI, socket.io-client, unread badge

## Week 10: Payments
- CinetPay integration (POST /payments/initiate)
- Webhook handler (POST /payments/webhook) + BullMQ retry (max 3)
- Mobile: payment method screen, WebView to CinetPay, deep link back

## Week 11: Admin Dashboard
- React + Vite + TailwindCSS + Shadcn/ui on Vercel
- Users, Categories, Reports, Verification, Analytics tabs
- Recharts for analytics, TanStack Table for data tables

## Week 12: Pre-Launch Hardening ✅ GATE
- Rate limiting (@fastify/rate-limit) on all auth routes
- Zod validation on all request bodies
- Supabase RLS audit
- Redis caching on search (TTL 60s), image compression (sharp)
- Sentry + BetterStack setup
- Full E2E test on Android (Tecno/Itel + slow 3G)
- GATE: all tests pass before launch

## Week 13: Beta Launch 🚀
- Deploy to Railway production environment
- Submit APK to Google Play internal testing track
- Invite 10–20 artisans + 10–20 clients (closed beta)
- Collect feedback via WhatsApp group or Typeform
- Fix top 5 bugs
- Public launch

## Priority Order (if scope must be cut)
1. Auth + Profiles — non-negotiable
2. Jobs + Quotes — core value proposition
3. Payments — monetisation
4. Chat — SMS is a short-term workaround
5. Admin Dashboard — Supabase dashboard is a temporary fallback
6. Push Notifications — SMS is the fallback