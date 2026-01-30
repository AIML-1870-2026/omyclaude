# Snake Quest: The Living Circuit

A unique Snake game themed as an emergent ecosystem inside a petri dish. Simple rules create complex challenges through metabolism, bio-waste, and reactive prey mechanics.

## Live Demo

**[Play Snake Quest](https://abrahmanzai.github.io/Snake-Quest/)**

## Features

### Metabolism System
Your snake has a **Hunger** bar that constantly fills:
- **Satiated** (low hunger): Move slower, thicker appearance, easier control
- **Starving** (high hunger): Move 2x faster, thinner/flickery, harder to control
- **FRENZY** (critical): 3x speed, can phase through ONE obstacle

### Toxic vs Inert Shedding
Every 10 length, your snake sheds its tail as a permanent obstacle:
- **Hungry when shedding** = Toxic waste (purple, deadly)
- **Fed when shedding** = Inert waste (gray, just blocks)

Strategic choice: stay hungry for dangerous traps, or stay fed for safety?

### Reactive Prey
Food cells are alive! When you get within 3 tiles, they try to escape in the opposite direction. Hunt your prey!

### Nutrient Aura
Shed waste attracts food spawns nearby—creating high-risk, high-reward zones.

### Decay System
Waste slowly shrinks over 30 seconds, preventing late-game gridlock while remaining an obstacle.

## Controls

| Platform | Control |
|----------|---------|
| Desktop | Arrow Keys or WASD |
| Mobile | Swipe gestures |

## Technologies

- HTML5 Canvas
- CSS3 (Glassmorphism, Animations)
- Vanilla JavaScript
- localStorage (High Scores)

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/abrahmanzai/Snake-Quest.git
   ```
2. Open `index.html` in a web browser

## The Mechanics

### Why Metabolism Matters
```
Hunger → Speed → Risk
  ↓
Shedding → Waste Type → Obstacles
```

When you're hungry, you move faster (harder to control) AND shed toxic obstacles. When you're fed, you're slower (safer) AND shed harmless obstacles. This creates a constant strategic tension.

### Emergent Gameplay
Simple rules create complex scenarios:
1. Prey flees → You chase into corners
2. You shed waste → Creates obstacles
3. Waste attracts food → Risk/reward zones
4. Hunger affects everything → Strategic eating

## Author

Abdul Hameed Rahmanzai
