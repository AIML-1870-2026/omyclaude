# Physarum Transport Engine - Project Specification

## Overview

A high-performance bio-simulation of Physarum polycephalum (slime mold) demonstrating emergent transport network formation. The engine prioritizes vectorization over iteration, targeting N > 50,000 particles on consumer-grade hardware.

## Core Mathematical Logic

### A. The Agent State

Agents are stored as parallel TypedArrays (Float32Array) for performance:
- `positionsX[N]` - X coordinates
- `positionsY[N]` - Y coordinates
- `headings[N]` - Heading angles (theta)

**Update Rule**: P(t+1) = P(t) + V * dt, where V = [cos(theta), sin(theta)] * speed

### B. The Sensory Triple-Sample

Each agent samples three coordinates:
- **Center**: C = P + d * [cos(theta), sin(theta)]
- **Left**: L = P + d * [cos(theta - phi), sin(theta - phi)]
- **Right**: R = P + d * [cos(theta + phi), sin(theta + phi)]

Parameters: d (Sensor Offset Distance), phi (Sensor Angle)

### C. Environment: The Trail Map (Pheromone Field)

The map is a 2D Float32Array.
- **Deposition**: Map[y, x] += DepositAmount
- **Diffusion**: 3x3 box blur (separable convolution for performance)
- **Decay**: Map_new = Map_diffused * (1 - DecayRate)

## Software Architecture

### Module 1: config.js
- Default simulation constants
- Color gradient mapping for bio-fluorescence visualization
- Canvas and performance settings

### Module 2: engine.js (PhysarumEngine class)
- Agent state as TypedArrays
- Bilinear interpolation for trail sampling
- Steering logic based on L, C, R pheromone values
- Toroidal boundary wrapping (modulo arithmetic)

### Module 3: simulation.js (TrailMap class)
- Trail map as Float32Array (width x height)
- Separable 3x3 box blur for diffusion (optimized)
- Exponential decay
- ImageData generation for Canvas rendering

### Module 4: app.js (Main Application)
- Initialize engine and trail map
- Animation loop with requestAnimationFrame
- UI event bindings for real-time parameter adjustment
- FPS counter and stats display

### Module 5: maze.js (Procedural Maze Generator)
- Iterative recursive backtracking algorithm (stack-based)
- Perfect maze generation (no loops, fully connected)
- Upscaling to high-resolution binary collision mask
- Configurable wall thickness and grid complexity
- Dynamic regeneration with random seeds

## Maze Integration

### Algorithm: Recursive Backtracking
1. Initialize grid with all walls active
2. Pick random start cell, push to stack
3. While stack not empty:
   - Get current cell
   - Find unvisited neighbors
   - If neighbors exist: choose random, remove wall, push to stack
   - Else: pop from stack (backtrack)

### Collision Mask
- The simulation runs at high resolution (800x800 px)
- Maze logic runs on low resolution (e.g., 40x40 cells)
- `getMask(width, height)` creates binary Uint8Array
- Walls = 0 (blocked), Paths = 1 (open)
- Wall thickness prevents tunneling (default: 8px)

### Wall Collision Handling
- Agents sense walls as repulsive (pheromone = 0)
- Blocked movement causes bounce with random turn
- Agents cannot deposit pheromones on walls

## Technical Specifications

### Technologies
- HTML5 Canvas for rendering
- Vanilla JavaScript (no frameworks)
- TypedArrays for performance
- CSS3 for UI (glassmorphism, custom sliders)
- Google Fonts (JetBrains Mono)

### Performance Targets
- 50,000 agents at 30+ FPS
- < 5ms per simulation step
- Efficient memory usage with TypedArrays

### Visual Style
- Dark theme (#0a0a0f background)
- Bio-fluorescence color gradient (black -> green -> white)
- Glassmorphism control panel
- Neon green accents

## UI Controls

| Control | Range | Default |
|---------|-------|---------|
| Agent Count | 1k-100k | 50,000 |
| Sensor Angle | 10-90 deg | 45 deg |
| Sensor Distance | 5-50px | 20px |
| Move Speed | 0.5-5 | 1.5 |
| Decay Rate | 0.001-0.1 | 0.02 |
| Deposit Amount | 1-20 | 5 |
| Maze Complexity | 10x10-80x80 | 40x40 |
| Wall Thickness | 2-20px | 8px |

## Emergent Phenomena

If implemented correctly, the simulation exhibits:
1. **Spontaneous Branching**: Thin filaments merging into thick veins
2. **T-Junction Optimization**: Networks find shortest paths
3. **Dynamic Rerouting**: Click to clear regions and observe rebuilding

## Deliverables

1. Modular JavaScript files (config.js, maze.js, engine.js, simulation.js, app.js)
2. Separate styles.css for all styling
3. index.html with UI controls
4. Procedural maze generation with collision detection
5. Deployed to GitHub Pages
