# Syntax Error — Game Specification
**AIML-1870 | omyclaude**

## Overview

A rhythm-based single-button platformer parodying Geometry Dash.
The player controls a lone Semicolon (`;`) attempting to escape a repository of horrific spaghetti code inside a corrupted IDE.

**Technology:** HTML5 Canvas, ES6 JavaScript, CSS3, Web Audio API (no audio files)
**Live URL:** https://aiml-1870-2026.github.io/omyclaude/Spike-Jumper/

---

## Controls

| Input | Cube Mode | Ship Mode |
|-------|-----------|-----------|
| SPACE (press) | Fixed-height jump | — |
| SPACE (hold) | — | Upward thrust |
| SPACE (release) | — | Gravity applies |
| ESC | Pause / Resume | Pause / Resume |
| M | Toggle mute | Toggle mute |
| Touch | Tap = jump / thrust | Same |

---

## Player Modes

### Cube Mode (default)
- Standard gravity pulls down continuously
- SPACE triggers an instant, fixed-height jump
- Can only jump when grounded
- Cube spins in air, snaps to 90° on landing

### Ship Mode (Python Vector)
- Entered by passing through a `()` portal
- Holding SPACE applies upward thrust
- Releasing SPACE lets gravity pull down
- Vertical speed clamped at ±380 px/s

---

## Hazards

| Hazard | Visual | Behavior |
|--------|--------|----------|
| **Spikes** | `<>` triangle (angled bracket) | Instant death on any contact |
| **Braces** | `{ }` solid block | Instant death on any contact |
| **Null Pointer** | Bottomless pit labeled `undefined` | Falling into pit = death |
| **Logic Bomb** | `Error 404` yellow block | Side contact = death; top surface = safe platform |

---

## Interactive Elements

| Element | Visual | Effect |
|---------|--------|--------|
| **Jump Pad** | `return true;` strip on floor | Auto-launches player higher than normal jump |
| **Gravity Ring** | `!==` operator circle | SPACE while inside = flip gravity direction |
| **Portal** | `()` glowing parentheses | Change mode (Cube↔Ship) or scroll speed |

---

## Physics Constants

| Parameter | Value | Description |
|-----------|-------|-------------|
| GRAVITY | 2800 px/s² | Cube downward acceleration |
| JUMP_VELOCITY | -680 px/s | Cube jump initial velocity |
| SHIP_THRUST | -900 px/s² | Ship upward thrust while SPACE held |
| SHIP_GRAVITY | 1200 px/s² | Ship downward gravity |
| SCROLL_SPEED | 280 px/s | Base world scroll speed |
| FAST_SPEED | 420 px/s | After speed-up portal |
| HITBOX_SIZE | 34×34 px | Strict square hitbox |
| HITBOX_MARGIN | 3 px | Per-side forgiveness shrink |

---

## Visual Design

**Theme:** VS Code Dark Mode IDE

**Color Palette:**
- Background: `#1e1e1e`
- Player (Semicolon): `#ff8c00` (VS Code warning orange)
- Spikes: `#f44747` (VS Code error red)
- Braces: `#d4d4d4` (VS Code text gray)
- Null pits: `#569cd6` (VS Code keyword blue)
- Logic bombs: `#dcdcaa` (VS Code function yellow)
- Jump pads: `#4ec9b0` (VS Code type teal)
- Gravity rings: `#c586c0` (VS Code macro purple)
- Portals: `#9cdcfe` (VS Code variable light-blue)

**Parallax Layers (back → front):**
1. Background: `npm install` terminal logs scrolling at 0.2× speed
2. Midground 2: CSS wireframe grid at 0.5× speed
3. Midground 1: Commented-out code snippets at 0.7× speed
4. Ground: Solid dark gray floor
5. Entities: All obstacles and interactives
6. Foreground: Blurry Python error snippets at 1.3× speed

---

## Visual Effects

| Effect | Trigger | Implementation |
|--------|---------|----------------|
| Jump trail | Player in air | 6 fading `;` chars trailing behind |
| Cube spin | Air time | +4.5°/frame, snaps to nearest 90° on land |
| Ship tilt | Vertical velocity | ±0.4 rad based on vy |
| Thrust flame | SPACE held in Ship | Flickering triangle behind ship |
| Death shatter | Collision | 36 binary `0`/`1` particles with gravity |
| BSOD | Death | Blue screen overlay for 1.1 seconds |
| Camera shake | Death | Random translate for 18 frames |
| Beat flash | Music downbeat | Subtle green overlay tint |
| Perfect toast | SPACE ±50ms to beat | "✓ Perfect Syntax" toast |

---

## Audio System (Web Audio API)

All audio is procedurally generated — no files needed.

**Background Music:** BPM 140, D-minor pentatonic
- Kick drum on beats 1 and 3
- Snare on beats 2 and 4
- Hi-hat every 8th note
- Bass line: sawtooth oscillator, `[D3, F3, G3, A3, C4, A3, G3, F3]` cycle
- 16th-note arpeggio at beat+¼ and beat+¾

**Sound Effects:**
| SFX | Description |
|-----|-------------|
| Jump | Short ascending square wave |
| Death | Descending sawtooth arpeggio + noise (Windows error style) |
| Jump Pad | Rising sine tones |
| Portal | Frequency sweep 200Hz → 900Hz |
| Gravity Ring | Descending sweep + noise burst |
| Perfect Syntax | Ascending 4-note chord |

**Beat Window:** SPACE pressed within ±50ms of a downbeat = "Perfect Syntax" bonus

---

## Level 1: "Null Reference Nightmare"

**Length:** 138 tiles = 5520px
**Duration:** ~20 seconds at base speed

| Act | Tiles | Theme | Key Obstacles |
|-----|-------|-------|---------------|
| I — Tutorial | 0–25 | First spikes + jump pad | spike×1, double-spike, pad, brace wall |
| II — Rhythm | 26–55 | Null pit + gravity ring | 3-beat spikes, null pit, rings×2, ceiling spikes |
| III — Ship | 56–80 | Cube→Ship portal corridor | brace maze top/bottom, null, Ship→Cube portal |
| IV — Bombs | 81–110 | Error 404 + speed portal | bomb×2, speed portal, spike×3, bomb+null, triple spike |
| V — Ascent | 111–138 | All mechanics combined | normal portal, pad+ring, ceiling spikes×3, ring, brace+spike, end |

---

## Stretch Goals

### Git Blame Mode (Ghost Racing)
- Records `{x, y, mode, rotation}` every game tick during best run
- Stored in `localStorage` as JSON array
- Replayed as semi-transparent blue ghost on subsequent attempts
- Ghost data overwritten only when player beats their previous best %

### Perfect Syntax (Rhythm Scoring)
- `AudioEngine.checkBeatWindow()` checks if SPACE press ≤50ms from a beat downbeat
- Triggers: sfxPerfect chord, green beat flash, "✓ Perfect Syntax" toast, progress bar glow

---

## Data Persistence

| localStorage Key | Type | Description |
|-----------------|------|-------------|
| `sj_bestPct` | float string | Highest completion percentage (0.0–1.0) |
| `sj_attempts` | int string | Total attempts across all sessions |
| `sj_ghost` | JSON array | Frame data for best run ghost replay |

---

## File Structure

```
Spike-Jumper/
  SPEC.md            ← This file
  index.html         ← HTML shell + overlay DOM
  css/
    style.css        ← Design tokens, layout, overlays
    animations.css   ← @keyframes
  js/
    constants.js     ← CONFIG (all tunable values)
    level.js         ← LEVEL_1 data + parseLevel()
    audio.js         ← AudioEngine IIFE
    physics.js       ← Physics utility class
    player.js        ← Player entity
    world.js         ← World scroll + entity queries
    renderer.js      ← Canvas draw pipeline
    ghost.js         ← GhostRecorder + GhostPlayer
    ui.js            ← DOM + event coordination
    game.js          ← STATE enum + GameEngine
    main.js          ← Bootstrap (5 lines)
  assets/            ← Reserved
```

Script dependency order: constants → level → audio → physics → player → world → renderer → ghost → ui → game → main
