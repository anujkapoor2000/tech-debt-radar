# Tech Debt Radar — Guidewire Practice

Continuous AI-powered code intelligence for Guidewire — identify, score and remediate technical debt weekly.

## Deploy to Vercel

### Option 1: Via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Via GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo — Vercel auto-detects Vite framework
4. Click Deploy

### Option 3: Drag & Drop (after build)
```bash
npm install
npm run build
# Drag the `dist/` folder to vercel.com/new
```

## Local Development
```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Features
- **Dashboard** — KPI overview, debt score trend, category breakdown, top issues
- **Radar View** — Bubble chart: size=effort, colour=severity, position=risk quadrant
- **Debt Register** — Filterable table with expandable AI suggestions
- **Remediation Plan** — Sprint-ready backlog with cost projections
- **Analysis** — Charts, component health radar, AI-powered insights

## Stack
- React 18 + Vite 5
- Recharts for visualisations
- Pure CSS (no Tailwind dependency)
- Zero backend — all data in `src/data/debtData.js`
