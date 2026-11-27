# E-Sagip Admin Portal

Plain JavaScript and CSS Next.js App Router shell for the E-Sagip Santolan admin portal.

## Run locally

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app uses mock health data by default; change `NEXT_PUBLIC_USE_MOCK` to `false` and set `NEXT_PUBLIC_API_URL` in `.env.local` to connect to the live API.

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_USE_MOCK`: `true` to use `mock/health.json`; `false` to call the live API.
- `NEXT_PUBLIC_API_URL`: API base URL, without the `/api/health` path.

The health card calls `getHealth()` from `lib/api.js`, which requests `${NEXT_PUBLIC_API_URL}/api/health` when mock mode is disabled. `.env.local` is ignored by Git; `.env.example` is safe to commit.

## Checks

```powershell
npm test
npm run lint
npm run build
```

## Routes

Dashboard, Volunteers, Operations, Attendance, Community, Reports, RBAC, and Activity Logs are available from the sidebar.
