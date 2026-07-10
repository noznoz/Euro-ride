# Euro Ride 🏍️

Trip companion app for our Europe motorcycle tour — itinerary, day-by-day
routes with Google Maps links, packing checklist, shared expense log, and
per-country riding rules. Built as an installable PWA so it works offline
in the mountains.

No backend, no accounts: the trip plan lives in one file, and your checklist
ticks + expenses are saved on your own phone (localStorage).

## Make it YOUR trip

Everything shown in the app comes from **`src/data/trip.js`** — open it and
edit:

- trip name, dates, riders
- bike rental details
- the day-by-day itinerary (the Google Maps button is built automatically
  from each day's list of stops)
- country rules, packing template, expense categories

The file ships with a realistic 9-day Alps sample route (Munich → Grossglockner
→ Dolomites → Stelvio → Swiss passes → Munich) so you can see how it works.

## Run locally

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the app
and publishes it to the `gh-pages` branch. One-time setup in the repo:

1. **Settings → Pages → Source: Deploy from a branch → `gh-pages` / (root)**
   (the branch appears after the first push to `main` finishes building).
2. The app is then live at `https://<user>.github.io/Euro-ride/`.

Open that URL on your phone and **Add to Home Screen** — it installs like a
native app and keeps working with no signal.

## Stack

React 18 · Vite 6 · vite-plugin-pwa — same recipe as
[road-heaven](https://github.com/noznoz/road-heaven), minus the backend.
