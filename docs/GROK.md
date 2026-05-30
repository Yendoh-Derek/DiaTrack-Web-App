# Grok AI Integration (Optional)

Grok AI chat integration is **disabled in demo mode** (`VITE_DEMO_MODE=true`).

The demo deployment uses a fallback health assistant with pre-programmed diabetes education responses. No API key is required.

## Self-hosted deployment (future)

To enable Grok in a non-demo deployment:

1. Set `VITE_DEMO_MODE=false` in your environment
2. Provide `VITE_GROK_API_KEY` via a **backend proxy** — do not expose API keys in client-side bundles
3. See archived docs at `docs/archive/GROK_INTEGRATION.md` for historical setup notes

## Security note

Never use `dangerouslyAllowBrowser: true` with production API keys. Client-side keys are visible to anyone who inspects the built bundle.
