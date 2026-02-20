# Decision Neuron - SPEC

**UNMC Admissions AI Simulator**
Single-file web application (`index.html`) — no build tools, no dependencies.

---

## Overview

Decision Neuron is an interactive perceptron visualization that simulates UNMC medical school admissions decisions. Users adjust applicant attributes via sliders and observe how a single-neuron model computes interview probability in real time. The app includes a live heatmap, sensitivity analysis, a math breakdown, and a gradient-descent training system.

**Live:** https://aiml-1870-2026.github.io/omyclaude/Decision-Neuron/

---

## Core Model

### Perceptron (Logistic Regression)

```
z = bias + NE_boost(if applicable) + Sum(wi * normalize(xi))
P(interview) = sigmoid(z) = 1 / (1 + e^-z)
```

### Inputs & Weights

| Input | Slider Range | Weight | Normalization |
|-------|-------------|--------|---------------|
| GPA | 2.00 - 4.00 | 4.0 | (val - 2.0) / 2.0 |
| MCAT | 472 - 528 | 3.5 | (val - 472) / 56 |
| Research Hours | 0 - 2000 | 1.5 | val / 2000 |
| Clinical Hours | 0 - 3000 | 2.0 | val / 3000 |
| Service Hours | 0 - 1000 | 1.0 | val / 1000 |

### Bias & Residency

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Bias | -6.0 | Baseline offset (shifts decision boundary) |
| Nebraska Boost | +2.5 | Models 84% in-state acceptance preference |

---

## UI Layout

Two-column grid (collapses to single column at 900px).

### Left Column

1. **Heatmap Panel** — GPA (y-axis) vs MCAT (x-axis) probability grid
   - Pixel-by-pixel Canvas 2D rendering
   - Color gradient: red (low) -> yellow (mid) -> green (high)
   - Dashed white line = decision boundary (P = 0.5), found via binary search
   - Pulsing white/gold dot = current user position
   - Optional training data overlay (green = accepted, red = rejected, hollow center = out-of-state)

2. **Sensitivity Panel** — horizontal bar chart showing each input's marginal contribution
   - Computed by perturbing each input +5% of its range and measuring the probability delta
   - Sorted descending, normalized to sum = 100%
   - Color-coded per input (red=GPA, gold=MCAT, green=Research, cyan=Clinical, magenta=Service)

3. **Training Ground** — gradient-descent controls and metrics
   - Buttons: Train Epoch, Train x10, Reset Weights, Show/Hide Data
   - Stats: Epoch count, Accuracy (%), Loss (MAE)

### Right Column (sticky sidebar)

1. **Your Profile** — five range sliders controlling applicant inputs
2. **Nebraska Resident Toggle** — on/off switch with visual state
3. **Probability Display** — large percentage with status badge (LIKELY / BORDERLINE / UNLIKELY)
4. **Math Overlay** — live term-by-term breakdown of the z computation
5. **Presets** — 2x2 button grid loading preset applicant profiles

---

## Features

### Heatmap Rendering

- Creates an `ImageData` buffer the size of the canvas
- Iterates every pixel, maps (px, py) to (MCAT, GPA), runs `predict()`, writes RGB
- Decision boundary drawn by binary-searching the GPA at P=0.5 for each MCAT column
- Re-renders on every slider/toggle change

### Sensitivity Analysis

- For each of the 5 inputs, bump the value by 5% of its range (clamped to max)
- Record `|P(bumped) - P(base)|`
- Normalize all deltas so they sum to 100%
- Render as sorted horizontal bar chart

### Training System

- **Dataset:** 27 mock applicants (mix of NE/non-NE, accept/reject)
- **Algorithm:** Online gradient descent with sigmoid derivative
  - `w_i += lr * error * sigma'(z) * x_i` for each weight
  - Bias and Nebraska boost updated similarly (boost scaled by 0.5)
- **Learning rate:** 0.05
- **Epoch:** One full shuffle-and-pass over the dataset
- **Reset:** Restores weights/bias to initial constants

### Presets

| Name | GPA | MCAT | Research | Clinical | Service |
|------|-----|------|----------|----------|---------|
| Strong Applicant | 3.90 | 520 | 1000 | 1500 | 300 |
| Borderline | 3.60 | 508 | 200 | 700 | 100 |
| Research Focus | 3.75 | 514 | 1800 | 400 | 150 |
| Clinical Focus | 3.70 | 512 | 200 | 2500 | 400 |

### Probability Thresholds

| Range | Label | Color |
|-------|-------|-------|
| >= 70% | LIKELY | Green (#00ff88) |
| 40-69% | BORDERLINE | Yellow (#ffcc00) |
| < 40% | UNLIKELY | Red (#ff4466) |

---

## Styling

### Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--unmc-red` | #D00000 | Header, slider thumbs, primary buttons |
| `--unmc-dark` | #0a0a14 | Page background |
| `--unmc-gray` | #1a1a2e | Panel base |
| `--unmc-panel` | rgba(26,26,46,0.85) | Glassmorphism panels |
| `--unmc-gold` | #FFD700 | Accents, labels, stat values |
| `--accent-green` | #00ff88 | Positive outcomes |
| `--accent-red` | #ff4466 | Negative outcomes |
| `--accent-yellow` | #ffcc00 | Borderline outcomes |

### Visual Effects

- Glassmorphism panels with `backdrop-filter: blur(20px)`
- Header gradient: UNMC red to dark red
- Gold border accent below header
- Pulsing keyframe animation on user marker (scale 1 -> 1.3)
- Slider thumb glow on hover
- Toggle switch with sliding knob animation

---

## Architecture

### Global Objects

| Object | Role |
|--------|------|
| `NEURON` | Mutable weights, bias, learning rate |
| `INITIAL_WEIGHTS` | Deep-cloned snapshot for reset |
| `RANGES` | Min/max for each input (normalization) |
| `state` | Current slider values + flags |
| `TRAINING_DATA` | 27-element array of labeled applicants |
| `PRESETS` | 4 named input configurations |

### Function Map

| Function | Triggered By | Updates |
|----------|-------------|---------|
| `normalize(value, key)` | Internal | — |
| `sigmoid(z)` | Internal | — |
| `predict(inputs, isNE)` | Everything | Returns `{probability, z}` |
| `renderHeatmap()` | `updateAll()` | Canvas pixels, boundary, data points, marker |
| `updateUserMarker()` | `renderHeatmap()` | Marker DOM position |
| `calculateSensitivity()` | `renderSensitivity()` | Returns sensitivity map |
| `renderSensitivity()` | `updateAll()` | Sensitivity bars innerHTML |
| `updateMathBreakdown()` | `updateAll()` | Math panel innerHTML |
| `updateProbability()` | `updateAll()` | Probability value + status badge |
| `trainEpoch()` | Train buttons | Weights, stats, then `updateAll()` |
| `resetWeights()` | Reset button | Restores initial weights, then `updateAll()` |
| `applyPreset(name)` | Preset buttons | State + sliders, then `updateAll()` |
| `updateAll()` | Any input change | Calls render/update chain |
| `updateFPS()` | `requestAnimationFrame` | FPS counter text |

### Data Flow

```
User Input (slider/toggle/preset)
  -> update state{}
  -> updateAll()
     -> renderHeatmap()       [canvas pixels + boundary + marker]
     -> renderSensitivity()   [bar chart DOM]
     -> updateMathBreakdown() [term list DOM]
     -> updateProbability()   [percentage + status badge]
```

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| > 900px | 2-column grid (heatmap left, controls right sticky) |
| <= 900px | Single column, controls below heatmap |

---

## File Structure

```
Decision-Neuron/
  index.html    <- Everything: HTML + CSS + JS (single file, ~1370 lines)
  SPEC.md       <- This file
```

No external dependencies. Pure vanilla HTML/CSS/JS with Canvas 2D.
