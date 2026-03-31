# NEO Close Approach Tracker — Project Spec

## Overview
Single-page dashboard for NASA/JPL near-Earth object close approach data.
Dark "mission control console" aesthetic with glassmorphism cards and animated starfield.

## Data Sources
| API | Endpoint | Auth | Usage |
|-----|----------|------|-------|
| NeoWs | `api.nasa.gov/neo/rest/v1/feed` | DEMO_KEY | Weekly NEO snapshot (primary) |
| SBDB CAD | `ssd-api.jpl.nasa.gov/cad.api` | None | Historical approaches (fallback + analytics) |
| Sentry | `ssd-api.jpl.nasa.gov/sentry.api` | None | Impact risk monitoring |

## Tab Structure

### Tab 1 — Overview
- 4 stat cards: total NEOs, PHAs, closest approach, fastest velocity
- Approach timeline (past 7 days, color-coded by threat level)
- Notable objects panel: closest, fastest, largest

### Tab 2 — Close Approaches
- Live search + distance filter + PHA toggle
- Sortable table: Name / Date / Miss Dist (LD) / Miss Dist (km) / Diameter / Velocity / Risk / Hazardous
- Color-coded rows by threat level

### Tab 3 — Analytics
- Miss distance distribution histogram
- Estimated diameter distribution
- Velocity distribution
- PHA vs non-PHA doughnut chart
- Size comparison widget (asteroid vs car, bus, Eiffel Tower, etc.)

### Tab 4 — Sentry Watch
- Total monitored object count
- Sortable table by Palermo scale: name / impact window / probability / Palermo / Torino / energy / diameter

### Tab 5 — 3D Globe
- globe.gl with Earth at center, Moon at 1 LD reference
- Asteroids positioned at log-compressed altitude based on miss distance
- Color-coded by threat level; click for detail panel
- Auto-rotate

## Aesthetic
- Fonts: IBM Plex Mono (data) + IBM Plex Sans (labels)
- Background: `#020408` with CSS canvas starfield
- Primary accent: `#00d4ff` (cyan)
- Secondary: `#7c3aed` (violet)
- Threat palette: `#ff2244` / `#ff6600` / `#ffaa00` / `#00ff88`
- Glassmorphism cards with `backdrop-filter: blur`
- Animated pulsing LIVE badge

## Deployment
GitHub Pages — push `index.html` to `gh-pages` branch or `docs/` folder.
