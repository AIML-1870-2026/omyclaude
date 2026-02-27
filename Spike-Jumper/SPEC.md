# Spike Jumper — SPEC

**Concept:** Macrophage Mayhem — an endless runner set inside the human circulatory system.
**Player:** Controls a Macrophage navigating vascular and lymphatic environments.
**Objective:** Survive as long as possible, collecting ATP (distance score). Avoid all pathogens.
**Live URL:** https://aiml-1870-2026.github.io/omyclaude/Spike-Jumper/

---

## Technology Stack
- HTML5 Canvas 2D (single `<canvas>` element, full-screen)
- Vanilla JavaScript ES6+ (9 modules, no npm, no bundler)
- Web Audio API (procedural SFX + 120 BPM background track)
- CSS3 (minimal — layout only; game rendered entirely on canvas)

---

## Visual Design
- **Aesthetic:** Darkfield microscopy — high-contrast, bioluminescent
- **Palette:**
  - Background: `#0d0006` (deep void)
  - Player (Macrophage): `#c8f0ff` cyan/white with glow
  - Pathogens (ViralCluster): `#39ff14` neon green
  - Cholesterol Plaques: `#c8a600` gold
  - Free Radicals: `#ff6030` orange-red
  - Ground / Endothelial Wall: crimson/purple gradients

---

## Player Mechanics

### Controls
| Input | Action |
|-------|--------|
| Tap `SPACE` | Short hop (low velocity) |
| Hold `SPACE` | High jump (velocity boosted for up to 180ms) |
| `SPACE` (menu/dead) | Start / Restart game |
| Touch screen | Same as SPACE (mobile support) |

### Physics
| Parameter | Value |
|-----------|-------|
| Gravity | 0.55 px/frame² |
| Short hop vy | -9.5 px/frame |
| Hold boost | -0.12 px/frame per held frame |
| Max fall speed | 14 px/frame |
| Ground Y | 78% of canvas height |

### Animation (Squash & Stretch)
| State | scaleY | scaleX |
|-------|--------|--------|
| Idle (ground) | 1 ± 0.04 sine pulse | inverse of scaleY |
| Jumping | lerp → 1.35 | lerp → 0.85 |
| Landing impact | 0.65 | 1.30 |
| Recovery | lerp → 1.0 | lerp → 1.0 |

---

## Hazard Taxonomy
| Entity | Behavior | Collision | Lethality |
|--------|----------|-----------|-----------|
| **ViralCluster** | Static, spiky geometric | Shrunk AABB | Instant |
| **CholesterolPlaque** | Static vertical wall | Shrunk AABB | Instant |
| **FreeRadical** | Bounces vertically on x-axis | Circle-rect | Instant |
| **EndothelialGap** | Void in ground | Player walks in | Instant fall |

All hitboxes are shrunk ~20% from visual bounds for fair feel.

---

## Procedural Chunk System
The world is generated from 10 pre-validated chunk templates (~600px wide each).
A 4-chunk look-ahead buffer is maintained; chunks are culled when off-screen left.

| # | Template Name | Hazards |
|---|--------------|---------|
| 0 | Baseline | Single ViralCluster |
| 1 | Binary Threat | Two ViralClusters (hop-gap spacing) |
| 2 | Plaque Wall | Single CholesterolPlaque |
| 3 | Gap Leap | Single EndothelialGap |
| 4 | Radical Intercept | Single FreeRadical (vertical bounce) |
| 5 | Cluster + Gap | ViralCluster then EndothelialGap |
| 6 | Dual Radicals | Two FreeRadicals at different heights |
| 7 | Plaque + Cluster | CholesterolPlaque then ViralCluster |
| 8 | Wide Gap | Large EndothelialGap |
| 9 | Clear (Breather) | No hazards |

**Difficulty ramp:** Score < 500 → easy pool (templates 0,1,2,9). Score ≥ 500 → full pool.

---

## Parallax Layers (4 total)
| Layer | Speed | Content |
|-------|-------|---------|
| 0 (background) | 0.10× scroll | Pulsing arterial walls (sine-animated bands) |
| 1 | 0.25× scroll | Drifting plasma proteins (translucent ellipses) |
| 2 (play area) | 0.55× scroll | Vascular endothelial ground stripe |
| 3 (foreground) | 1.00× scroll | Fast-moving red blood cells (biconcave discs) |

---

## Game Feel Features
| Feature | Description |
|---------|-------------|
| Anticipation | 3-frame squash before jump velocity applies |
| Freeze Frame | 150ms logic pause on lethal impact (canvas still renders) |
| Camera Shake | 20-frame decaying random offset on death |
| Land Particles | 8 cyan geometric particles on ground impact |
| Death Particles | 24 green radial burst particles on lethal collision |

---

## Audio Architecture (Web Audio API)
| Sound | Type | Character |
|-------|------|-----------|
| Jump | Rising sine sweep (280Hz → 448Hz) | Membrane resonance |
| Land | Triangle tone + noise burst | Low-pass thud |
| Death | Descending sawtooth + noise | Cellular rupture |
| Background | 120 BPM: kick, hi-hat, bass sine | Procedural rhythm |

Audio context lazy-initialized on first user gesture (browser autoplay policy compliant).

---

## HUD & State Persistence
| Element | Location | Content |
|---------|----------|---------|
| ATP Counter | Top-left | Current distance score |
| Best ATP | Top-left (dim) | All-time best (localStorage) |
| Game Over | Center overlay | "Membrane Compromised." + Final/Best ATP + restart prompt |
| Mute | On-canvas (top-right) | Toggle audio |

**localStorage key:** `macrophage-hi`

---

## Speed Scaling (Phase 1 Stretch Goal)
- Base scroll speed: 4 px/frame
- Increases 5% every 30 seconds of survival
- Maximum: 12 px/frame (3× base)

---

## Deferred (Phase 2)
- **Phase Theming:** Venous (0-60s) → Arterial (60-120s) → Lymphatic (120s+) palette crossfade
- **Boss Encounters:** Superbug entity at 60s intervals with telegraphed projectile attacks

---

## Module Dependency Graph
```
constants.js
    └─ entities.js
         └─ chunks.js
physics.js
particles.js
audio.js
renderer.js  (uses constants, entities)
game.js      (uses all above)
main.js      (bootstrap)
```
