# Drug Safety Explorer — SPEC.md

## Purpose
Interactive web tool for exploring and comparing FDA drug safety data side-by-side using the OpenFDA public API.

## Live URL
https://aiml-1870-2026.github.io/omyclaude/Drug-Safety-Explorer/

## Core Features
- Side-by-side drug comparison (any two drugs)
- Adverse event report counts from FAERS (FDA Adverse Event Reporting System)
- Top 12 reported reactions with horizontal bar charts (Chart.js)
- Recall/enforcement history with Class I / II / III severity badges
- FDA-approved label data (warnings, indications, contraindications)
- Pre-loaded with Aspirin vs Ibuprofen on page load
- Autocomplete search from 60+ common drug names

## Stretch Goals Implemented
1. **Contextual Help System** — Every data section has an ℹ️ button with tooltip explaining the data, its limitations, and how to interpret it
2. **Visual Storytelling** — Horizontal bar charts (Chart.js), mini inline reaction bars in Overview tab, color-coded recall severity cards
3. **Drug Class Exploration** — Top nav bar with 6 drug classes (NSAIDs, Statins, Antibiotics, Antidepressants, Blood Pressure, Diabetes); clicking opens a modal to pick two drugs from that class

## API Endpoints Used
- `GET /drug/event.json` — Adverse event counts + top reaction breakdown
- `GET /drug/label.json` — Drug labeling (warnings, indications, contraindications)
- `GET /drug/enforcement.json` — Recall/enforcement records

## Tech Stack
- Vanilla HTML/CSS/JavaScript (no framework)
- Chart.js 4.4 (CDN) for bar charts
- OpenFDA public API (no key required)
- GitHub Pages for hosting

## Disclaimers
- FAERS reports are voluntarily submitted; reports do not prove causation
- Educational use only; not medical advice
- FDA does not endorse this application
