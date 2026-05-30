# DiaTrack

Type 2 diabetes risk assessment  for clinicians. Runs entirely in the browser with an ONNX logistic regression model and localStorage demo data.

**Live demo:** `https://<your-username>.github.io/DiaTrack-Web-App/` (after enabling GitHub Pages)

> For educational and portfolio demonstration only. Not for clinical diagnosis.

## Features

- **ML risk assessment** — in-browser ONNX inference with feature contribution breakdown
- **Patient management** — register and search demo patients
- **Assessment history** — per-patient charts and global assessment log
- **Health chatbot** — educational fallback responses (no API key needed)
- **GitHub Pages ready** — static build with SPA routing support

## Quick start

```bash
npm install
npm run dev        # http://localhost:8080
```

Click **Launch Demo** on the landing page — no login or backend required.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest tests |
| `npm run train-model` | Retrain ONNX model (requires Python 3.10+) |

## Environment

Copy `.env.example` to `.env`:

```
VITE_DEMO_MODE=true
```

## GitHub Pages deployment

1. Push to GitHub
2. Enable **Pages → Source: GitHub Actions** in repository settings
3. The workflow in `.github/workflows/deploy-pages.yml` builds and deploys on push to `main`

For local production preview with the correct base path:

```bash
# PowerShell
$env:GITHUB_PAGES="true"; npm run build; npm run preview
```

## Documentation

- [Demo mode](docs/DEMO.md)
- [ML model](docs/MODEL.md)
- [Grok integration (optional)](docs/GROK.md)

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Recharts · ONNX Runtime Web

## License

MIT
