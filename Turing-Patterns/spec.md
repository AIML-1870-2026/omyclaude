# NEON MORPHOGENESIS // The Living Canvas

## Overview
A high-performance, GPU-accelerated Turing Pattern explorer using the Gray-Scott Reaction-Diffusion model. Built with WebGL Fragment Shaders for 60FPS performance at high resolution.

**Live URL:** https://aiml-1870-2026.github.io/omyclaude/Turing-Patterns/

## The Gray-Scott Model

Two virtual chemicals (U and V) react and diffuse across a 2D grid:

```
∂U/∂t = Dᵤ∇²U - UV² + f(1-U)
∂V/∂t = Dᵥ∇²V + UV² - (f+k)V
```

| Parameter | Symbol | Description |
|-----------|--------|-------------|
| Feed Rate | f | Rate U is added to system |
| Kill Rate | k | Rate V is removed from system |
| Diffusion U | Dᵤ | How fast U spreads (typically 1.0) |
| Diffusion V | Dᵥ | How fast V spreads (typically 0.5) |

## Features

### Core Engine (GPU-Based)
- [x] Gray-Scott algorithm in GLSL fragment shaders
- [x] Ping-pong texture buffering (read/write swap)
- [x] High resolution grid (canvas-sized)
- [x] Speed control up to 50x simulation steps per frame

### The Chaos Pad (XY Controller)
- [x] X-Axis = Feed Rate (f)
- [x] Y-Axis = Kill Rate (k)
- [x] Draggable glowing puck
- [x] Background map showing Turing instability regions
- [x] Real-time morphing as you drag

### God Tools (Mouse Interaction)
| Tool | Trigger | Effect |
|------|---------|--------|
| Seeder | Left Click | Inject Chemical V (activator) |
| Eraser | Right Click | Wipe area clean (reset to U=1, V=0) |
| Disruptor | Drag | Push chemicals around like fluid |

### Visual Themes
| Theme | Description |
|-------|-------------|
| X-Ray | Black & white medical style |
| Acid Trip | Rainbow heatmap cycling |
| Neon Night | Purple/cyan/magenta synthwave |
| Bio-Hazard | Toxic green and yellow |

### Presets (Magic Buttons)
| Name | f | k | Pattern |
|------|---|---|---------|
| Mitosis | 0.0367 | 0.0649 | Splitting spots |
| Coral | 0.0545 | 0.062 | Fingerprint mazes |
| U-Skate | 0.062 | 0.061 | Moving worms |
| Black Hole | 0.039 | 0.058 | Imploding rings |

## Technical Stack

| Component | Technology |
|-----------|------------|
| 3D/WebGL | Three.js r160 |
| Compute | GPUComputationRenderer (ping-pong) |
| UI | Glassmorphism CSS |
| Rendering | Full-screen quad with custom shader |

## File Structure
```
Turing-Patterns/
├── index.html    # Single-file application
└── spec.md       # This specification
```

## The Science Connection

Turing Patterns explain how zebras get stripes, leopards get spots, and coral grows its fractal structure. Two chemicals—an activator and inhibitor—chase each other across a surface, creating order from chaos.

```
Simple Rules → Complex Patterns
Local Reactions → Global Structure
Chemistry → Life
```

This is emergence in action.
