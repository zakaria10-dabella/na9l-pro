# Na9l Pro Frontend

## Maps tracking

Client tracking and driver tracking use the free OpenStreetMap stack:

- Map tiles: OpenStreetMap
- Address search/geocoding: Nominatim
- Route lines: OSRM

No Google Maps API key is required. Keep `.env` simple:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

After changing `.env`, restart Vite:

```bash
npm run dev
```
