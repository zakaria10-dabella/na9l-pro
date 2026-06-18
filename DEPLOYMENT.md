# Deployment

## Backend on Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and select this repo.
3. Render reads `render.yaml`, creates:
   - `na9l-pro-api`
   - `na9l-pro-db`
4. When Render asks for `FRONTEND_URL`, put your Vercel app URL, for example:
   `https://na9l-pro.vercel.app`
5. Wait until deploy finishes. The backend API URL will be:
   `https://na9l-pro-api.onrender.com/api`

The Docker startup script runs Laravel migrations automatically.

## Frontend on Vercel

In Vercel project settings, `VITE_API_URL` is optional. If it exists, do not set
it to `127.0.0.1` or `localhost` for production. Keep it empty, set it to `/api`,
or add this only if the Render backend URL changes:

```env
VITE_API_URL=https://na9l-pro-api.onrender.com/api
```

Then redeploy the frontend.

The production frontend uses `/api` by default. Vercel proxies `/api/*` to the
Render backend in `vercel.json`, so users only need the Vercel link.

## Notes

- Do not use `127.0.0.1` in production.
- OpenStreetMap, Nominatim, and OSRM are used for maps.
- Browser location requires HTTPS, so it works on Vercel/Render URLs.
