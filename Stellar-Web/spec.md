# Stellar Web - Orbital Gravity Simulator Specification

## Overview

Create an interactive orbital mechanics simulation that combines Newtonian gravity physics with emergent network visualization. Planets orbit a central star following real physics while forming dynamic connection webs based on proximity.

## Core Physics

### Newtonian Gravity
- Gravitational force: `F = GMm/r²`
- Acceleration toward central mass: `a = GM/r²`
- Stable orbits require tangential velocity: `v = sqrt(GM/r)`

### Angular Momentum
- Planets initialized with perpendicular velocity to radius
- Conservation of angular momentum creates elliptical orbits
- Random eccentricity (0.7-1.3) produces varied orbital shapes

### Energy Conservation
- Kinetic Energy: `KE = 0.5 * m * v²`
- Potential Energy: `PE = -GMm/r`
- Total mechanical energy tracked in real-time

## Visual Engine

### Central Star
- Glowing radial gradient with white-hot core
- Outer corona effect with transparency falloff
- Collision detection prevents planets from passing through

### Orbiting Planets
- Variable mass affects visual size
- Color-coded by index (5 distinct colors per theme)
- Glow effect with radial gradient
- Specular highlight for 3D appearance

### Orbital Trails
- Position history stored per planet
- Configurable trail length (10-300 points)
- Fading trail visualization shows orbital path

### Network Web
- Proximity-based edge connections (from original Stellar Web)
- Dynamic opacity: `opacity = (1 - distance/radius)^1.5`
- Connects orbiting bodies that pass near each other

## Interactive Controls

### Orbital Physics Panel
| Control | Range | Description |
|---------|-------|-------------|
| Central Mass (G) | 1000-15000 | Gravitational constant strength |
| Planet Count | 10-150 | Number of orbiting bodies |
| Time Scale | 0.1-3.0 | Simulation speed multiplier |
| Trail Length | 10-300 | Orbital path history length |

### Network Web Panel
| Control | Range | Description |
|---------|-------|-------------|
| Connectivity Radius | 0-300 | Distance threshold for edges |
| Edge Thickness | 0.5-4.0 | Line width for connections |

### Display Toggles
- **Show Trails**: Enable/disable orbital path visualization
- **Show Web**: Enable/disable network connections
- **Show Velocity**: Display velocity vectors with arrow heads

### Mouse Interaction
- Cursor creates secondary gravity well
- Planets within 300px are attracted to mouse position
- Allows user to perturb orbits dynamically

## Analytics HUD

Real-time metrics displayed:
- **Total Energy**: Combined kinetic + potential energy
- **Avg Velocity**: Mean orbital speed across all planets
- **Connections**: Active edge count in network web
- **FPS**: Performance monitoring

## Technical Implementation

### Integration Method
- Euler integration for velocity and position updates
- Time step: `dt = timeScale * 0.16`
- Collision handling with sun (elastic bounce)

### Performance
- O(n) gravity calculation (single central mass)
- O(n²) edge detection (can be optimized with spatial hashing)
- RequestAnimationFrame for smooth 60fps rendering
- Canvas fade effect for motion trails

### Themes
- **Deep Space**: Cyan/Blue planets, Yellow sun
- **Supernova**: Amber/Red planets, Red sun

## Scientific Principles Demonstrated

1. **Kepler's Laws**: Elliptical orbits with sun at focus
2. **Conservation Laws**: Energy and angular momentum preserved
3. **Orbital Mechanics**: Relationship between distance and velocity
4. **Emergent Networks**: Proximity connections form dynamic structures

## Author

Abdul Hameed Rahmanzai
