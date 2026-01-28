# Stellar Web - Orbital Gravity Simulator

An interactive orbital mechanics simulation combining Newtonian gravity physics with emergent network visualization. Watch planets orbit a central star while forming dynamic connection webs.

## Live Demo

**[View Live Demo](https://abrahmanzai.github.io/Stellar-Web/)**

## Features

### Physics Simulation
- **Newtonian Gravity**: Real F = GMm/r² physics
- **Angular Momentum**: Elliptical orbits with varying eccentricity
- **Energy Conservation**: Tracks kinetic + potential energy in real-time
- **Velocity Vectors**: Visualize direction and speed of each planet

### Network Visualization
- **Proximity Connections**: Dynamic edges form between nearby planets
- **Orbital Trails**: Colored paths show orbital history
- **Mouse Gravity Well**: Cursor attracts nearby planets

### Interactive Controls
| Control | Description |
|---------|-------------|
| Central Mass (G) | Gravitational strength of the sun |
| Planet Count | Number of orbiting bodies (10-150) |
| Time Scale | Speed up or slow down simulation |
| Trail Length | Length of orbital path trails |
| Connectivity Radius | Distance for network connections |
| Show Velocity | Toggle velocity vector arrows |

### Themes
- **Deep Space**: Cyan/Blue planets with yellow sun
- **Supernova**: Amber/Red planets with red sun

## Technologies

- HTML5 Canvas
- CSS3 Glassmorphism (backdrop-filter)
- Vanilla JavaScript
- Newtonian Physics Simulation
- Google Fonts (Inter, JetBrains Mono)

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/abrahmanzai/Stellar-Web.git
   ```
2. Open `index.html` in a web browser

## The Physics

### Orbital Mechanics
Planets are initialized with tangential velocity calculated for circular orbits:
```
v = sqrt(GM/r)
```
Random eccentricity creates elliptical paths following Kepler's laws.

### Gravity Calculation
Each frame, gravitational acceleration is computed:
```
a = GM/r²
```
Applied toward the central star to update velocity and position.

### Energy Conservation
The simulation tracks:
- **Kinetic Energy**: KE = 0.5 × m × v²
- **Potential Energy**: PE = -GMm/r
- **Total Energy**: Should remain constant (conservation law)

## Author

Abdul Hameed Rahmanzai
