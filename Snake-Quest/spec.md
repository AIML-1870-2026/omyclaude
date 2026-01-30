# Snake Quest: The Living Circuit - Specification

## Overview

A unique, polished Snake game themed as an "Emergent Ecosystem" inside a petri dish. Simple rules create complex challenges through metabolism, bio-waste, and reactive prey mechanics.

## Core Mechanics

### 1. Metabolism System

The snake has a **Hunger** bar (0-100) that constantly increases and dramatically affects gameplay:

| Hunger Level | State | Speed | Visual Effect | Turning |
|--------------|-------|-------|---------------|---------|
| 0-30 | Satiated | Slow (120ms) | Thick, pulsing glow | Wide turns |
| 30-60 | Balanced | Normal | Standard appearance | Normal |
| 60-90 | Starving | Fast (60ms) | Thin, flickery | Tight turns |
| 90-100 | **FRENZY** | Very Fast (40ms) | Red, screen pulses | Very tight |

**Frenzy Mode Bonus**: When in frenzy, the snake can phase through ONE waste obstacle (consuming it).

### 2. Bio-Waste / Shedding System

Every time the snake reaches a length **multiple of 10**, it automatically sheds its tail segment:

| Shed Condition | Waste Type | Color | Behavior |
|----------------|------------|-------|----------|
| Hunger > 50% | **Toxic** | Purple | Lethal obstacle |
| Hunger < 50% | **Inert** | Gray | Blocking obstacle |

**Decay Mechanic**: All waste slowly decays over 30 seconds, shrinking to 30% of original size (still an obstacle).

**Nutrient Aura**: Waste emits a faint glow that attracts food spawns (40% chance food spawns near waste).

### 3. Reactive Prey

Food is a **living cell** with escape behavior:
- When snake's head is within **3 tiles**, food has 70% chance to flee
- Food moves **1 tile** in the opposite direction from the snake
- 200ms cooldown between escape attempts
- Creates hunting dynamics instead of passive collection

### 4. Digestion Bulge

When the snake eats, the food visually travels through its body as a **glowing bulge** moving tail-ward over 500ms. This provides satisfying feedback and makes the snake feel alive.

## Visual Design

### Petri Dish Aesthetic
- **Circular play area** representing a petri dish
- **Background**: Dark charcoal (#0d1117) with subtle grid
- **Edge**: Glowing inset shadow with glass-like border
- **Frenzy pulse**: Red glow animation when in critical hunger

### Snake Appearance
- **Organic segments**: Rounded circles with gradients
- **Satiated**: Thick, slow pulse, green-cyan
- **Starving**: Thin, rapid flicker, duller green
- **Frenzy**: Red coloration, aggressive animation
- **Eyes**: Follow movement direction
- **Specular highlights**: 3D appearance

### Food Cell
- **Amber/gold** living cell with nucleus
- **Pulsing glow** animation
- **Organic texture** with specular highlight

### Waste Obstacles
- **Toxic (purple)**: Bright violet with glow
- **Inert (gray)**: Muted gray-blue
- **Rough texture**: Multiple overlapping circles
- **Decay**: Shrinks over time visually

### Particle Effects
- **Eating**: Gold particle burst
- **Shedding**: Purple or gray burst (matches waste type)
- **Frenzy phase-through**: Colored burst when consuming obstacle

## Controls

### Desktop
- **Arrow Keys** or **WASD** for movement
- Direction queued until next game tick

### Mobile
- **Swipe gestures** for direction changes
- Minimum 30px swipe threshold
- Touch events properly handled (no scroll interference)

## Game States

1. **Start Screen**: Title, mechanics explanation, start button
2. **Playing**: Active gameplay with HUD
3. **Frenzy**: Visual overlay when hunger critical
4. **Game Over**: Final score, high score, restart option

## HUD Elements

- **Score**: Points earned (top-left)
- **Length**: Current snake length (top-right)
- **Metabolism Bar**: Visual hunger indicator (bottom-center)
- **Status Text**: "Satiated" / "Balanced" / "Starving" / "FRENZY!"

## Scoring

- **+10 points** per food eaten
- High score saved to localStorage

## Technical Implementation

### Architecture
- **Single HTML file** with embedded CSS and JavaScript
- **IIFE pattern** for encapsulation
- **RequestAnimationFrame** render loop
- **Delta-time** based updates for consistent speed

### Performance
- **60 FPS** target
- **Particle pooling** (max 100 particles)
- **Efficient collision detection** (grid-based)

### Responsive Design
- Canvas resizes to fit viewport
- Maintains square aspect ratio
- Mobile-optimized touch handling
- Scales UI elements for small screens

## Configuration Constants

```javascript
TILE_SIZE: 20,
INITIAL_LENGTH: 3,
BASE_SPEED: 120,           // ms (satiated)
STARVING_SPEED: 60,        // ms (starving)
FRENZY_SPEED: 40,          // ms (frenzy)
FRENZY_THRESHOLD: 90,      // hunger level
SHED_INTERVAL: 10,         // length multiple
WASTE_DECAY_TIME: 30000,   // 30 seconds
PREY_ESCAPE_RADIUS: 3,     // tiles
PREY_ESCAPE_CHANCE: 0.7,   // 70%
FOOD_ATTRACT_CHANCE: 0.4,  // 40% spawn near waste
```

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep charcoal | #0a0e14 |
| Surface | Dark gray | #0d1117 |
| Grid | Subtle blue | #1a2030 |
| Snake (normal) | Cyan | #00ffc8 |
| Snake (frenzy) | Red | #ff6b6b |
| Food | Amber | #fbbf24 |
| Toxic waste | Purple | #a855f7 |
| Inert waste | Gray | #6b7280 |

## Author

Abdul Hameed Rahmanzai
