# hms-web — MediGo HMS frontend

React + TypeScript UI for the HMS platform (separate repo from the FastAPI backend).

## Quickstart
1. Run the backend: in `hms-platform`, `./scripts/dev-up.sh` (API on :8000).
2. Here: `npm i` then `npm run dev` → http://localhost:5173
3. Log in with a demo tenant (apollo/kims) and role. Patients screen talks to the
   real API through the Vite proxy.

`npm run generate:api` regenerates typed API schema from the backend OpenAPI —
run after any backend change and commit the diff.

See CLAUDE.md for the rules that keep 40 future screens looking like one product.
