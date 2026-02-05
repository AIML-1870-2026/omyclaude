# Code Quest: 3D Boids & Emergence

## Overview
A high-performance 3D simulation where thousands of autonomous agents ("boids") exhibit complex flocking behavior using Craig Reynolds' (1987) algorithm. Intelligence emerges from the swarm through three simple local rules.

**Live URL:** https://aiml-1870-2026.github.io/omyclaude/Boids/

## The Three Laws of Boids

| Rule | Description | Vector Math |
|------|-------------|-------------|
| **Separation** | "Don't crash." Steer away from neighbors who are too close. | Weighted inverse distance |
| **Alignment** | "Fly with the flow." Steer towards average heading of neighbors. | Average velocity vector |
| **Cohesion** | "Stay close." Steer towards center of mass of neighbors. | Seek center point |

## Features Implemented

### Core Engine
- [x] Craig Reynolds' boids algorithm (1987)
- [x] THREE.InstancedMesh rendering (1,500+ boids at 60 FPS)
- [x] Spatial grid partitioning for O(N) neighbor lookup
- [x] Fish tank boundary steering (soft turn away from walls)
- [x] Smooth orientation (boids point where they fly)

### Dashboard (dat.GUI)
- [x] Separation weight (0 - 5)
- [x] Alignment weight (0 - 5)
- [x] Cohesion weight (0 - 5)
- [x] Visual radius (perception range)
- [x] Max speed / steering force
- [x] Population controls (+/- 100, +/- 500 boids)

### Presets
- [x] **The School** - High alignment, smooth river flow
- [x] **The Swarm** - Low alignment, tight buzzing (gnat-like)
- [x] **Chaos** - High separation, zero cohesion (gas molecules)

### Visual Polish
- [x] Exponential fog for depth perception
- [x] Color by velocity (fast=red, slow=blue)
- [x] Color by position (rainbow gradient)
- [x] Neon emissive materials with glow
- [x] Trail renderers (200 boids with history)
- [x] Cone geometry for clear orientation
- [x] Glowing boundary box with corner markers

### Camera Modes
- [x] **OrbitControls** - Rotate, zoom, pan around flock
- [x] **Boid's Eye View** - Ride a random boid (Level 3)
- [x] **Predator Cam** - WASD/mouse FPS controls, camera repels boids

## Stretch Challenges Completed

### Level 1: The Predator
- [x] Large red boid chases center of flock
- [x] All boids have flee force away from predator
- [x] Adjustable flee radius and weight
- [x] Visual glow sphere showing flee radius

### Level 2: Spatial Partitioning
- [x] 3D grid-based spatial hash
- [x] Only checks neighbors in adjacent cells
- [x] Enables 5,000+ boids smoothly on CPU

### Level 3: Boid's Eye View
- [x] Camera snaps to random boid
- [x] Locks position/rotation to boid
- [x] Click anywhere to exit

### Level 4: GPU Compute (God Mode)
- [x] GPUComputationRenderer for GPGPU
- [x] Position shader (updates positions)
- [x] Velocity shader (computes all boid forces)
- [x] 32,768 boids at 60 FPS
- [x] Point sprite rendering with additive blending
- [x] Real-time parameter updates via uniforms

## Technical Stack

| Component | Technology |
|-----------|------------|
| 3D Engine | Three.js r160 |
| Controls | OrbitControls |
| UI | lil-gui (dat.GUI successor) |
| GPU Compute | GPUComputationRenderer |
| Rendering | InstancedMesh (CPU) / Points (GPU) |

## Performance Targets

| Mode | Boid Count | Target FPS |
|------|------------|------------|
| CPU Mode | 1,500 | 60 |
| CPU Mode | 5,000 | 30-60 |
| GPU Mode | 32,768 | 60 |

## File Structure
```
Boids/
├── index.html    # Single-file application
└── spec.md       # This specification
```

## Controls Reference

### Keyboard (Predator Cam)
| Key | Action |
|-----|--------|
| W/S | Forward/Back |
| A/D | Strafe Left/Right |
| Q/E | Down/Up |
| ESC | Exit mode |

### Mouse
- **Orbit Mode:** Drag to rotate, scroll to zoom
- **Predator Cam:** Move to look around

## The Emergence Connection

Just like neurons in an LLM create intelligence from simple activations, boids create complex "life" from simple steering forces:

```
Neuron ≈ Boid
Attention Mechanism ≈ Neighbor Check
Emergent Behavior ≈ Flocking Patterns
```

No leader. No central brain. Intelligence emerges from the swarm.
