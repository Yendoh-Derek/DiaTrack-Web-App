# DiaTrack Demo Mode

## What is demo mode?

When `VITE_DEMO_MODE=true` (the default), DiaTrack runs entirely in your browser with no backend:

- **No login** — click "Launch Demo" on the landing page
- **No Supabase** — patients and predictions stored in `localStorage`
- **No API keys** — chatbot uses educational fallback responses
- **ML inference** — ONNX model loaded from `/models/diabetes-risk.onnx`

## Seed data

On first visit, the app seeds:
- 4 sample patients (P-1001 through P-1004)
- 4 sample prediction logs with varied risk levels

Storage keys:
- `diatrack:patients`
- `diatrack:predictions`
- `diatrack:seeded`

## Demo actions

From **Settings → Demo Data**:
- **Export Demo Data** — download JSON backup
- **Reset Demo Data** — restore default seed patients and predictions

## Clearing data manually

Open browser DevTools → Application → Local Storage → delete `diatrack:*` keys.

## GitHub Pages

The demo is designed for static hosting. Enable GitHub Pages with the included workflow (`.github/workflows/deploy-pages.yml`) and set the repository Pages source to **GitHub Actions**.

Live URL pattern: `https://<username>.github.io/DiaTrack-Web-App/`
