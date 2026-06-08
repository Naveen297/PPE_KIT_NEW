# SafetyAI — PPE Detection Dashboard

> Real-time AI-powered Personal Protective Equipment (PPE) monitoring dashboard for Mahindra manufacturing plants. Detects safety violations, tracks compliance trends, and generates comprehensive reports — all in a modern, responsive web interface.

---

## 📸 Overview

The SafetyAI dashboard provides plant safety managers with:

- **Live Detection Feed** — Real-time camera stream with AI bounding boxes and PPE detection indicators  
- **KPI Dashboard** — At-a-glance stats for total detections, compliance rate, and violations  
- **PPE Item Breakdown** — Per-item violation counts (Helmet, Gloves, Apron, Shoes, Goggles, Mobile)  
- **Analytics Charts** — Incidents over time, area-wise heatmap, risk levels, BBS Score, camera uptime  
- **Violations Table** — Sortable list with confidence scores and drill-down detail modals  
- **Report Generation** — Multi-format (PDF / Excel / CSV / JSON) downloadable safety reports  
- **Multi-Plant Support** — Switchable between plant locations with independent data streams  

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Custom SVG / recharts |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |
| Linting | ESLint + Prettier |
| Backend | Node.js / TypeScript (Express) |
| Database | PostgreSQL (schema in `/database`) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Naveen297/PPE_KIT_NEW.git
cd PPE_KIT_NEW

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

### Running Locally

```bash
# Start the frontend dev server (http://localhost:3000)
npm run dev

# Start the backend server (separate terminal)
cd backend && npm run dev
```

### Building for Production

```bash
npm run build        # Outputs to /dist
npm run preview      # Preview the production build
```

---

## 🧪 Testing

```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run all tests once (CI mode)
npm run test:coverage # Run with coverage report
npm run test:ui       # Open Vitest UI
```

---

## 📁 Architecture

```
src/
├── assets/               # Images and fonts
├── components/
│   ├── ui/               # Atomic/primitive components
│   │   ├── ConfidenceBar.jsx    # Reusable confidence score bar
│   │   ├── PPEItemChip.jsx      # Present/missing PPE badge
│   │   └── StatCard.jsx         # KPI metric card
│   ├── layout/
│   │   └── Header/
│   │       ├── Header.jsx       # App header (composition only)
│   │       ├── NavTabs.jsx      # Dashboard / Live nav toggle
│   │       └── PlantSelector.jsx # Plant switcher dropdown
│   ├── dashboard/        # Dashboard feature components
│   │   ├── StatsSection.jsx     # KPI cards + PPE breakdown
│   │   ├── PPEBreakdownRow.jsx  # 6-item violation grid
│   │   └── DetectionsTable.jsx  # Violations table
│   ├── monitoring/       # Live monitoring feature
│   │   ├── LiveMonitoring.jsx   # Container (state owner)
│   │   ├── CameraConfigSidebar.jsx
│   │   └── CameraPanel.jsx
│   ├── modals/           # Modal overlays
│   │   ├── DetectionModal.jsx
│   │   └── ReportDownloadModal.jsx
│   └── charts/           # Analytics chart components
│       ├── IncidentsOverTimeChart.jsx
│       ├── AreaWiseIncidentsChart.jsx
│       ├── BBScoreChart.jsx
│       ├── RiskLevelChart.jsx
│       ├── CameraUptimeChart.jsx
│       └── IncidentTypeChart.jsx
├── context/
│   └── PlantContext.jsx  # Global plant + detections state
├── hooks/                # Custom React hooks
│   ├── useClickOutside.js       # Generic click-outside handler
│   ├── usePPEStats.js           # Memoized PPE item violation counts
│   └── usePlant.js              # Re-export for clean imports
├── utils/
│   ├── dataGenerator.js         # Mock data & statistics helpers
│   └── formatters.js            # Display formatting utilities
└── constants/
    └── index.js          # Plant configs, PPE items, app config
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Feature-based folders** | `dashboard/`, `monitoring/`, `modals/` group by feature, not type — easier to delete/extend features |
| **UI primitives** | `ConfidenceBar`, `PPEItemChip`, `StatCard` are the single source of truth for repeated visual patterns |
| **Custom hooks** | `usePPEStats` isolates item-count logic + memoizes it; `useClickOutside` is reusable across dropdowns |
| **Barrel exports** | `index.js` in each folder keeps imports short: `import { DetectionsTable } from '@/components/dashboard'` |
| **`@/` path aliases** | Configured in `vite.config.js` — no more `../../..` import chains |
| **No `alert()`** | All validation errors use inline React state so they're testable and don't block the UI thread |

---

## ⚙️ Environment Variables

See [`backend/.env.example`](./backend/.env.example) for all required variables.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Backend server port (default: 5000) |
| `JWT_SECRET` | Secret for auth tokens |
| `CAMERA_API_URL` | URL of the camera/vision API |

---

## 🤝 Contribution Guidelines

### Branch Strategy

```
main          ← production-ready
develop       ← integration branch
feature/xyz   ← new features
fix/xyz       ← bug fixes
```

### Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(dashboard): add compliance rate trend indicator
fix(stats): correct mobile violation double-count bug
refactor(header): extract PlantSelector into own component
docs: update README with new folder structure
```

### Pull Request Checklist

- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run test:run` passes
- [ ] New components have JSDoc prop descriptions
- [ ] New hooks have JSDoc parameter + return documentation
- [ ] No `console.log` left in production code (use `console.info`/`console.warn`)
- [ ] No hardcoded plant/zone data in components (use `constants/`)

### Code Style

- **Component files**: PascalCase (`DetectionModal.jsx`)
- **Hook files**: camelCase with `use` prefix (`useClickOutside.js`)
- **Utility files**: camelCase (`formatters.js`)
- **Constants**: SCREAMING_SNAKE_CASE for values, camelCase for objects

---

## 📄 License

Proprietary — Mahindra & Mahindra Ltd. All rights reserved.
