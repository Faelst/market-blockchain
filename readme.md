## Spectra Market — NFT Marketplace (Monorepo)

Modern, full‑stack NFT marketplace skeleton for candidate assessments and rapid prototyping.

- Web: Next.js 14, React 18, Tailwind CSS, SWR
- API: Express 5, Mongoose 8, Socket.IO, Zod, JWT, Multer, Helmet
- DB: MongoDB

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install & Run

1) Install deps at repo root:
   - `pnpm install`
2) Start dev (API + Web):
   - `pnpm dev`
   - API: http://localhost:4000
   - Web: http://localhost:3000

### Feature overview

- Auth
  - Email/password (JWT in HTTP-only cookie). Basic profile update and password change.
  - Auth rate limiting keyed by IP+route+identifier and success-based decrement.
- NFTs
  - List/browse, basic history tracking, simple listing flow.
  - Media uploads via Multer; served from `/uploads` (10MB limit, restricted types).
- Collections
  - Browse collections and items; curated visuals in seed for realism.
- Realtime
  - Recent sales/ticker via Socket.IO.
- Security
  - Helmet enabled, CORS configured, HTTP-only cookies, centralized error handling.

### API quick notes

- Health: `GET /health`
- Static uploads: `GET /uploads/:file`
- Auth routes are under `/auth` (register, login, me, etc.)
- Market, NFTs, Collections routes provide list endpoints with caching middleware

### Notes for candidates

This project is used to assess frontend, backend, blockchain, and technical lead skills. See `missions.md` for role-specific missions.


