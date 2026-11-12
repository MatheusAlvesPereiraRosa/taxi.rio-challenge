# Taxi.Rio — React + TypeScript + Tailwind v4

A refactored frontend using **React Router** for actual URL-based pages, layouts, reusable components and `src/functions.ts` for API calls.

## Pages

| Route | Component | Authentication |
|---|---|---|
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/passenger` | `PassengerPage` | PASSENGER |
| `/rides/:id` | `RidePage` | PASSENGER (ownership checked by API) |
| `/driver` | `DriverPage` | DRIVER |

Registration creates passenger accounts only. Seed driver credentials with your backend seed script. `GET /corridas/:id` is passenger-only in the current API; driver updates use a ride ID and manually chosen known status.

## Commands (PowerShell)

```powershell
cd ui
npm install
npm run dev
```

Visit http://localhost:5173. Vite proxies `/api` to http://localhost:3000.

To check production compilation:

```powershell
npm run build
```

## Docker

The Dockerfile and `nginx.conf` are included. From the repository root, include the following under `services:` in `docker-compose.yml`:

```yaml
  ui:
    build:
      context: ./ui
      dockerfile: Dockerfile
    container_name: corridas-ui
    restart: unless-stopped
    ports:
      - '8080:80'
    depends_on:
      api:
        condition: service_healthy
```

After installing dependencies to generate `ui/package-lock.json`, run `docker compose up -d --build`. Visit http://localhost:8080. Nginx proxies `/api` to `api:3000` and serves `index.html` for nested React routes.

## Notes

- `src/functions.ts`: HTTP client, typed endpoints, status helpers, and storage keys.
- `src/context/AuthContext.tsx`: JWT session in `sessionStorage` (demo only).
- `src/layouts`: shared authentication and dashboard layouts.
- `src/pages`: separate login, registration, passenger, driver and ride pages.
- `src/components`: reusable fields, panels, status pills, and route protection.
- The frontend generates and persists an idempotency key for a pending passenger booking, including across reloads.
- The UI uses standard REST calls; refresh ride details manually. Redis/Mongo are updated by the worker, not read directly by the browser.
- **Security:** sessionStorage is acceptable as a challenge demo, not recommended for sensitive production sessions. Consider secure HttpOnly cookies in production.
