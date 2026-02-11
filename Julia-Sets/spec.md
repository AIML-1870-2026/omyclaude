# Fractal Odyssey - Julia Set Explorer

## 1. Project Overview

A high-performance, interactive web-based Julia Set explorer. The application allows users to visualize the complex plane, manipulate parameters in real-time, and explore the mathematical relationship between the Mandelbrot Set and Julia Sets.

---

## 2. Technical Stack

| Component | Technology |
|-----------|------------|
| Language | HTML5, CSS3, Modern JavaScript (ES6+) |
| Rendering | HTML5 Canvas API (ImageData for pixel-level manipulation) |
| Performance | Web Worker for off-thread fractal calculations |

**Important:** All code must be file-specific (separate files for different concerns).

---

## 3. Core Features & Functionality

### A. The Fractal Engine

| Aspect | Implementation |
|--------|----------------|
| Formula | `z(n+1) = z(n)² + c` where `z` is pixel coordinate, `c` is constant |
| Escape Logic | Points escape if `|z| > 2` |
| Max Iterations | Default 256, adjustable via UI for "infinite zoom" depth |

### B. Interactive Controls

| Control | Behavior |
|---------|----------|
| Real-time Sliders | Adjust Real (Re) and Imaginary (Im) components of `c` |
| Zoom | Mouse wheel to zoom in/out at cursor position |
| Pan | Click-and-drag to pan across the complex plane |
| Resolution Scaling | "Preview Mode" (low-res) while dragging, "High-Res" on release |

### C. The Mandelbrot Connection (Split View)

| Feature | Description |
|---------|-------------|
| Dual Viewport | Main Julia Set view + smaller Mandelbrot "Navigator" |
| Interactive Mapping | Click on Mandelbrot Navigator to set `c` value for Julia Set |

---

## 4. Visual Design & UI

### Theme
- **Aesthetic:** "Dark Mode" scientific
- **Background:** Slate/Charcoal
- **Accents:** Neon/Electric colors

### UI Components

| Component | Description |
|-----------|-------------|
| Sidebar/Overlay | Semi-transparent panel with sliders, iteration count, coordinates |
| Preset Gallery | One-click buttons for famous Julia constants |

### Famous Presets

| Name | Constant `c` |
|------|--------------|
| The Rabbit | `-0.123 + 0.745i` |
| San Marco | `-0.75 + 0i` |
| Dendrite | `0 + 1i` |

### Color Palettes

| Palette | Description |
|---------|-------------|
| Electric Blue | Default - cyan/blue tones |
| Inferno | Red/Orange heat map |
| Deep Space | Grayscale |
| Psychedelic | Rainbow spectrum |

**Smooth Coloring:** Use renormalization logic to prevent color banding.

---

## 5. File Structure

```
Julia-Sets/
├── index.html          # Main HTML structure
├── styles.css          # All styling
├── main.js             # UI logic, event handlers, canvas management
├── worker.js           # Web Worker - fractal calculations
├── palettes.js         # Color palette definitions
└── spec.md             # This specification
```

---

## 6. Implementation Roadmap

### Phase 1: Basic Rendering
- [ ] Set up Canvas and basic iteration loop
- [ ] Implement coordinate mapping (pixel x,y → complex plane a+bi)
- [ ] Create Web Worker with fractal calculation logic

### Phase 2: Performance Optimization
- [ ] Move calculation logic into `worker.js`
- [ ] Implement progressive/chunked rendering
- [ ] Add resolution scaling (preview vs high-res)

### Phase 3: UI & Interaction
- [ ] Build control panel (sidebar)
- [ ] Hook up sliders to `c` parameter
- [ ] Add mouse event listeners for zoom and pan
- [ ] Implement Mandelbrot Navigator panel

### Phase 4: Export & Polish
- [ ] Add "Save Image" button (Canvas → DataURL)
- [ ] Add "Morph" mode (auto-animate `c` in circular path)
- [ ] Preset gallery with famous constants
- [ ] Multiple color palette support

---

## 7. Mathematical Reference

### Julia Set Formula
```
z(0) = pixel coordinate (mapped to complex plane)
z(n+1) = z(n)² + c
```

### Escape Condition
```
|z| > 2  →  point escapes (colored based on iteration count)
|z| ≤ 2 after max iterations  →  point is in the set (black)
```

### Smooth Coloring (Renormalization)
```
smoothed = n + 1 - log(log(|z|)) / log(2)
```

### Coordinate Mapping
```
real = (x - width/2) / zoom + panX
imag = (y - height/2) / zoom + panY
```

---

## 8. Development Notes

- **Performance:** Always calculate fractals in Web Worker to keep UI responsive
- **Interactivity:** Use debouncing/throttling for slider updates
- **Rendering:** Implement progressive rendering for large canvases
- **Zoom:** Maintain cursor position as zoom center point
