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
