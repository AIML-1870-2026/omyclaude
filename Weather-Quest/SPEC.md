# Weather Dashboard — SPEC.md

## Overview

Build a single-file static weather dashboard (`index.html`) that fetches live weather data from the OpenWeatherMap API. The page should feel like a premium weather app — not a generic Bootstrap card layout. Think: glass-morphism meets topographic maps, with real atmospheric texture.

This is a class assignment (Code Quest) with these hard requirements:
1. User enters a city name → gets current weather
2. User toggles between Celsius and Fahrenheit
3. Two stretch enhancements (we're doing: 5-day forecast + wind/humidity/pressure detail panel)

---

## Tech Stack

- **Single HTML file** — all CSS and JS inline. No build tools, no frameworks, no npm.
- **OpenWeatherMap API** (free tier):
  - Current weather: `https://api.openweathermap.org/data/2.5/weather`
  - 5-day forecast: `https://api.openweathermap.org/data/2.5/forecast`
- **Fonts**: Load from Google Fonts CDN
- **Icons**: Use OpenWeatherMap's built-in icon URLs (`https://openweathermap.org/img/wn/{icon}@2x.png`)
- No external JS libraries. Vanilla JS only.

---

## API Key Handling

The API key is stored in `config.js` with a clear comment:

```js
// ⚠️ For learning purposes only — in production, use a backend proxy
const API_KEY = "YOUR_API_KEY_HERE";
```

The user will paste in their own key. Use placeholder text `YOUR_API_KEY_HERE` so it's obvious where to swap it.

---

## Design Direction: "Atmospheric Topo"

### Concept
Dark background with subtle topographic/contour line patterns. Glassmorphic cards with soft blur. The vibe is a cockpit weather instrument — precise, clean, slightly techy but warm.

### Color Palette (CSS custom properties)
```
--bg-primary: #0c1117          (deep dark blue-black)
--bg-secondary: #151d27         (slightly lighter panel bg)
--surface: rgba(255,255,255,0.05)  (glass card fill)
--surface-border: rgba(255,255,255,0.08)
--text-primary: #e8ecf1         (off-white)
--text-secondary: #7a8a9e       (muted blue-gray)
--accent: #4fc3f7              (sky blue accent)
--accent-warm: #ffb74d          (warm amber for sun/high temps)
--accent-cool: #4dd0e1          (cool teal for low temps)
--danger: #ef5350               (error states)
```

### Typography
- **Display/Headings**: `"Playfair Display", Georgia, serif` — used ONLY for the big temperature number and the app title
- **Body/UI**: `"DM Sans", system-ui, sans-serif` — everything else (labels, city names, forecast days, buttons)

---

## Page Structure

```
┌─────────────────────────────────────────────┐
│  🌤  Weather Dashboard          [°C] [°F]   │  ← Header bar
├─────────────────────────────────────────────┤
│  [ 🔍  Search a city...          Search  ]  │  ← Search input
├─────────────────────────────────────────────┤
│  Hero Card: city, icon, temp, description   │
│  Detail chips: wind, humidity, pressure,    │
│    visibility                               │
│  5-Day Forecast row                         │
│  Sunrise / Sunset bar                       │
└─────────────────────────────────────────────┘
```

---

## Functional Specifications

### 1. Search
- Single text input + search button
- Pressing `Enter` triggers search
- Loading state: pulsing glow on hero card border
- Inline error messages (no `alert()`)
- Default city on load: Omaha

### 2. Unit Toggle
- Two buttons in header: `°C` and `°F`
- Active button highlighted with `--accent`
- Default: `°F`
- Switching re-fetches data with correct `units` param

### 3. Current Weather Hero Card
- City name + country code
- Weather icon
- Temperature (Playfair Display)
- Weather description
- Feels-like temperature

### 4. Detail Chips
- Wind (speed + compass direction)
- Humidity (%)
- Pressure (hPa)
- Visibility (km or miles)

### 5. 5-Day Forecast
- Groups 3-hour forecast data by day
- Prefers 12:00:00 entry per day
- Shows day name, icon, high/low

### 6. Sunrise/Sunset Bar
- Converts Unix timestamps using API timezone offset
- Formats as `h:mm AM/PM`

---

## Live URL
https://aiml-1870-2026.github.io/omyclaude/Weather-Quest/
