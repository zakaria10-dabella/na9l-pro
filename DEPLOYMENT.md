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

In Vercel project settings, add:

```env
VITE_API_URL=https://na9l-pro-api.onrender.com/api
```

Then redeploy the frontend.

The frontend also uses this Render URL as its production fallback, but keeping the
Vercel variable is recommended if the Render service URL changes.

## Notes

- Do not use `127.0.0.1` in production.
- OpenStreetMap, Nominatim, and OSRM are used for maps.
- Browser location requires HTTPS, so it works on Vercel/Render URLs.
