# EKADHANTHA Technologies — Business Website

A full-stack marketing website (React + Node/Express) for an IT services business
covering website development, full-stack development, app development, IT
services/consulting, data pipeline engineering, and data analysis/BI.

**Business name & tagline are placeholders — rename freely.** "EKADHANTHA
Technologies" was suggested as a starting point; swap it (and the logo text in
`frontend/src/components/Navbar.jsx` / `Footer.jsx`) for whatever you land on.

## Structure

```
nexoria-website/
  backend/     Node.js + Express API (contact form + content endpoints)
  frontend/    React app (Vite) — Home, Services, Portfolio, Pricing, Blog, About, Contact
```

## Pages

- **Home** — hero, service overview, why-us, CTA
- **Services** — all 6 service lines with details
- **Portfolio** — sample/concept projects (replace with real case studies as you ship work)
- **Pricing** — Starter / Growth / Enterprise tiers (edit `backend/data/pricing.json`)
- **Blog** — starter post stubs (edit `backend/data/blog.json`)
- **About** — story and values
- **Contact** — working form that posts to the backend and saves submissions to `backend/submissions/submissions.json`

## Running locally

You'll need Node.js 18+ installed.

**1. Backend** (in one terminal):
```bash
cd backend
npm install
npm start
```
Runs on http://localhost:5000. Health check: http://localhost:5000/api/health

**2. Frontend** (in a second terminal):
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173 and proxies `/api/*` requests to the backend
(see `frontend/vite.config.js`).

Open http://localhost:5173 in your browser.

## Editing content

All business content lives in `backend/data/*.json` (services, pricing,
portfolio, blog) — edit those files and the site updates automatically. The
frontend also ships with matching fallback data in `frontend/src/data/fallback.js`
so pages still render if the backend isn't running; keep the two in sync if
you change content.

Contact details (email, etc.) are in `frontend/src/pages/Contact.jsx` and
`frontend/src/components/Footer.jsx`.

## Contact form submissions

Submissions POST to `/api/contact` and are appended to
`backend/submissions/submissions.json`. This is a simple file-based store to
get started — swap in a real database (Postgres, MongoDB, etc.) or an email
service (e.g. SendGrid) when you're ready to go live. View saved submissions
with `GET /api/contact`.

## Deploying

- **Frontend**: `npm run build` in `frontend/` produces a static `dist/`
  folder you can deploy to Vercel, Netlify, or any static host.
- **Backend**: deploy `backend/` to any Node host (Render, Railway, Fly.io,
  a VPS, etc.). Update the frontend's API base URL / proxy target to point
  at your deployed backend URL before building for production.

## Next steps (business side)

- Register a domain and swap the placeholder business name/branding
- Replace portfolio placeholders with real projects as you complete them
- Connect a real email service or CRM to the contact form
- Add real pricing once you've run a few projects and know your costs
- Set up analytics (e.g. Plausible, GA4) to track visitor traffic
