# Physarum Transport Engine

A high-performance bio-simulation of Physarum polycephalum (slime mold) demonstrating emergent transport network formation.

## Live Demo

**[View Live Demo](https://aiml-1870-2026.github.io/omyclaude/Physarum-Engine/)**

## Features

- **50,000+ Agents**: Vectorized simulation using TypedArrays for high performance
- **Emergent Networks**: Watch slime mold-like transport networks self-organize
- **Procedural Mazes**: Perfect maze generation with wall collision physics
- **Real-time Controls**: Adjust all simulation parameters on the fly
- **Bio-fluorescence Visualization**: Beautiful green glow effect mimicking biological imaging
- **Dynamic Rerouting**: Click to clear regions and observe network rebuilding

## How It Works

The simulation models the behavior of Physarum polycephalum slime mold:

1. **Agents** deposit pheromone trails as they move
2. **Sensors** detect pheromone concentrations ahead (left, center, right)
3. **Steering** turns agents toward higher concentrations
4. **Diffusion** spreads pheromones to neighboring cells
5. **Decay** gradually reduces pheromone levels

This simple ruleset produces complex, self-organizing transport networks.

## Controls

| Parameter | Description |
|-----------|-------------|
| Agent Count | Number of simulated organisms (1k-100k) |
| Move Speed | How fast agents move |
| Sensor Angle | Spread of left/right sensors |
| Sensor Distance | How far ahead agents sense |
| Decay Rate | How quickly pheromones fade |
| Deposit Amount | Pheromone strength per agent |
| Enable Maze | Toggle procedural maze overlay |
| New Maze | Generate a new random maze |
| Maze Complexity | Grid size (10x10 to 80x80) |
| Wall Thickness | Width of maze walls in pixels |

## File Structure

```
Physarum-Engine/
├── index.html      # HTML structure and UI
├── styles.css      # All styling
├── config.js       # Simulation constants
├── maze.js         # Procedural maze generator (MazeMap class)
├── engine.js       # Agent simulation (PhysarumEngine class)
├── simulation.js   # Trail map (TrailMap class)
├── app.js          # Main application loop
├── spec.md         # Technical specification
└── README.md       # This file
```

## Technologies Used

- HTML5 Canvas for rendering
- Vanilla JavaScript with TypedArrays
- CSS3 (glassmorphism, custom sliders)
- No external dependencies (except Google Fonts)

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/AIML-1870-2026/omyclaude.git
   ```
2. Open `Physarum-Engine/index.html` in a web browser

## Emergent Behaviors

Observe these phenomena in the simulation:
- **Network Formation**: Random agents self-organize into efficient networks
- **Branch Merging**: Thin trails consolidate into major pathways
- **Shortest Paths**: Networks naturally optimize for efficiency
- **Adaptive Rerouting**: Click to disrupt and watch the network rebuild
- **Maze Solving**: Enable maze mode to watch agents find paths through corridors

## Course

AIML 1870 - 2026
