# parking-frontend

Development and run instructions for the parking-frontend project (Windows / PowerShell).

Prerequisites
- Node.js (16+ recommended)
- npm (bundled with Node.js)

Quick start
1. Install dependencies:

```powershell
cd C:\parking-frontend
npm install
```

2. Run development server (Vite):

```powershell
npm run dev
# open http://localhost:5173 in your browser
Start-Process "http://localhost:5173"
```

3. Build for production:

```powershell
npm run build
npm run preview
# preview at http://localhost:4173
```

Notes
- This project uses Vite 4.x and Tailwind CSS 3.4.x for compatibility. If you see PostCSS errors like "Unknown word min-h-", open `src/index.css` and avoid placing Tailwind arbitrary utilities (like `min-h-[520px]`) directly as raw CSS tokens; use standard CSS (e.g. `min-height: 520px;`) or keep utilities inside `@apply` where supported.
- If you run into dependency conflicts, remove `node_modules` and `package-lock.json` and run `npm install` again. For quick troubleshooting you can use `npm install --legacy-peer-deps`, but prefer fixing versions for long-term stability.

Security
- Run `npm audit` and `npm audit fix` to see and attempt to fix vulnerabilities.

CI
- Add a simple CI job to run `npm ci && npm run build` on PRs to catch build regressions early.
# Parking Frontend (Vite + React + Tailwind)

## Setup (local)

1. Ensure Node.js >= 18 installed.
2. Extract the project and run:

```bash
cd parking-frontend
npm install
```

3. Create a `.env` file in the project root with the backend base URL:

```
VITE_API_BASE=http://localhost:3000
```

4. Run dev server:
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Notes
- Axios interceptor automatically attaches JWT from `localStorage.token`.
- Favorites saved in `localStorage` (key: `favorites`). Change to server API if backend supports.
- To deploy, connect this repo to Vercel/Netlify and set `VITE_API_BASE` in project environment variables.
