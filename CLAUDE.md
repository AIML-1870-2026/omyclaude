Create a CLAUDE.md file in this folder with the following content:

# AIML 1870 - The Royal Decree

## Configuration
UserGamertag: "omyclaude"
Organization: "AIML-1870-2026"

## Project Structure
This folder is your entire AIML 1870 portfolio. It is a single git repository
containing all your assignments as subfolders.

Structure:
- Root folder = Your Gamertag (this IS the git repo)
- Each assignment = A subfolder (NOT a separate repo)
- CLAUDE.md = Lives at the root, governs everything

Current Projects:
- Hello-World/ - Kingdom Home Landing Page
- Starfield/ - Cockpit Flight Deck
- Stellar-Web/ - Orbital Gravity Simulator
- Snake-Quest/ - The Living Circuit
- Physarum-Engine/ - Slime Mold Transport Network
- Boids/ - 3D Flocking Simulation (GPU Compute)
- Turing-Patterns/ - GPU Reaction-Diffusion (Gray-Scott)
- Decision-Neuron/ - UNMC Admissions AI Simulator (Perceptron)
- RGB-Petal-Wheel/ - Bioluminescent Neural-Link Studio

---

## Boids/ - Code Reference

**File:** `Boids/index.html` (single-file application)
**Live:** https://aiml-1870-2026.github.io/omyclaude/Boids/

### The Three Laws (Craig Reynolds 1987)
| Rule | Description | Implementation |
|------|-------------|----------------|
| **Separation** | Steer away from nearby boids | Weighted inverse distance vector |
| **Alignment** | Match neighbor heading | Average velocity of neighbors |
| **Cohesion** | Steer toward flock center | Seek center of mass |

### Code Architecture in index.html

#### Global State
- `boids[]` - Array of boid objects (CPU mode)
- `params{}` - GUI-controlled parameters (separation, alignment, cohesion weights)
- `grid{}` - Spatial hash for O(N) neighbor lookup

#### Key Functions
| Function | Purpose |
|----------|---------|
| `initBoids()` | Create boid array with random positions/velocities |
| `updateBoids()` | Main loop: apply 3 rules + boundary steering |
| `getNeighbors(boid)` | Spatial grid lookup for nearby boids |
| `separation(boid, neighbors)` | Calculate flee vector from too-close boids |
| `alignment(boid, neighbors)` | Calculate average heading of neighbors |
| `cohesion(boid, neighbors)` | Calculate vector toward center of mass |
| `boundarySteer(boid)` | Soft turn-away from tank walls |

#### GPU Mode (God Mode)
| Component | Purpose |
|-----------|---------|
| `GPUComputationRenderer` | GPGPU compute via Three.js |
| `positionTexture` | Float texture storing XYZ positions |
| `velocityTexture` | Float texture storing velocity vectors |
| `velocityShader` | GLSL: computes all boid forces in parallel |
| `positionShader` | GLSL: integrates velocity → position |

#### Visual Systems
| System | Implementation |
|--------|----------------|
| Rendering | `InstancedMesh` (CPU) / `Points` (GPU) |
| Colors | Velocity-based (speed→hue) or position-based |
| Trails | 200 boids with position history arrays |
| Glow | Emissive materials + additive blending |
| Boundary | Cyan wireframe box with corner markers |

#### Camera Modes
| Mode | Controls |
|------|----------|
| Orbit | `OrbitControls` - drag/scroll |
| Boid's Eye | Locks to random boid, click to exit |
| Predator Cam | WASD+mouse FPS, camera repels boids |

### Performance
| Mode | Boids | Target |
|------|-------|--------|
| CPU | 1,500 | 60 FPS |
| CPU | 5,000 | 30-60 FPS |
| GPU | 32,768 | 60 FPS |

---

## Turing-Patterns/ - Code Reference

**File:** `Turing-Patterns/index.html` (single-file application)
**Live:** https://aiml-1870-2026.github.io/omyclaude/Turing-Patterns/

### Gray-Scott Model
```
∂U/∂t = Dᵤ∇²U - UV² + f(1-U)
∂V/∂t = Dᵥ∇²V + UV² - (f+k)V
```

| Parameter | Symbol | Role |
|-----------|--------|------|
| Feed Rate | f | Rate substrate U enters system |
| Kill Rate | k | Rate activator V is removed |
| Diffusion U | Dᵤ | Substrate spread rate (1.0) |
| Diffusion V | Dᵥ | Activator spread rate (0.5) |

### Code Architecture in index.html

#### Global State
- `state{}` - All parameters (feed, kill, speed, theme, brushSize)
- `renderTargets[]` - Ping-pong texture pair for GPGPU
- `currentTarget` - Index of read texture (0 or 1)

#### Shaders (GLSL)
| Shader | Purpose |
|--------|---------|
| `computeShader` | Gray-Scott equations + mouse interaction |
| `displayShader` | Maps chemical concentration → color themes |

#### Key Functions
| Function | Purpose |
|----------|---------|
| `createRenderTarget()` | Create Float RGBA texture for GPGPU |
| `initializeChemicals()` | Reset grid: U=1, V=0, add seeds |
| `animate()` | Main loop: run N simulation steps, render display |
| `updateChaosPad(x, y)` | Convert pad position → feed/kill values |
| `setPadFromValues(f, k)` | Move puck to match parameter values |

#### Ping-Pong Buffering
```
Frame N:
  Read from renderTargets[0]
  Write to renderTargets[1]
  Swap: currentTarget = 1

Frame N+1:
  Read from renderTargets[1]
  Write to renderTargets[0]
  Swap: currentTarget = 0
```

#### Mouse Actions (in computeShader)
| Action | Trigger | Effect |
|--------|---------|--------|
| Seed | Left click | Inject V (activator) |
| Erase | Right click | Reset to U=1, V=0 |
| Disrupt | Drag | Push chemicals along mouse direction |

#### Visual Themes
| Theme ID | Name | Colors |
|----------|------|--------|
| 0 | Neon Night | Purple/cyan/magenta |
| 1 | X-Ray | Black & white |
| 2 | Acid Trip | Rainbow heatmap |
| 3 | Bio-Hazard | Toxic green/yellow |

#### Presets
| Name | f | k | Pattern |
|------|---|---|---------|
| Mitosis | 0.0367 | 0.0649 | Splitting spots |
| Coral | 0.0545 | 0.062 | Fingerprint mazes |
| U-Skate | 0.062 | 0.061 | Moving worms |
| Black Hole | 0.039 | 0.058 | Imploding rings |

---

## Decision-Neuron/ - Code Reference

**File:** `Decision-Neuron/index.html` (single-file application)
**Live:** https://aiml-1870-2026.github.io/omyclaude/Decision-Neuron/

### Perceptron Model
```
z = Σ(wᵢxᵢ) + b
P(interview) = σ(z) = 1/(1 + e⁻ᶻ)
```

| Input | Range | Weight | Description |
|-------|-------|--------|-------------|
| GPA | 2.0 - 4.0 | w₁ = 4.0 | Academic rigor |
| MCAT | 472 - 528 | w₂ = 3.5 | Standardized test |
| Research | 0 - 2000 hrs | w₃ = 1.5 | Lab experience |
| Clinical | 0 - 3000 hrs | w₄ = 2.0 | Patient care |
| Service | 0 - 1000 hrs | w₅ = 1.0 | Leadership |
| Nebraska | boolean | +2.5 bias | 84% in-state preference |

### Code Architecture in index.html

#### Global State
- `NEURON{}` - Weights, bias, learning rate
- `state{}` - User inputs (GPA, MCAT, etc.)
- `TRAINING_DATA[]` - Mock applicant dataset (28 points)

#### Key Functions
| Function | Purpose |
|----------|---------|
| `normalize(value, key)` | Map raw input to 0-1 range |
| `sigmoid(z)` | Activation: 1/(1+e⁻ᶻ) |
| `predict(inputs, isNebraska)` | Forward pass → probability |
| `trainEpoch()` | One pass of gradient descent |
| `renderHeatmap()` | Draw GPA×MCAT probability grid |
| `calculateSensitivity()` | Weight contribution analysis |

#### Visualization Components
| Component | Implementation |
|-----------|----------------|
| Heatmap | Canvas 2D pixel-by-pixel rendering |
| Decision Boundary | Binary search for P=0.5 contour |
| User Marker | Pulsing CSS animation |
| Sensitivity Bars | Dynamic width based on weight impact |
| Training Data | Scatter overlay (green=accept, red=reject) |

#### Training System
| Feature | Description |
|---------|-------------|
| Learning Rule | Gradient descent with sigmoid derivative |
| Epoch Counter | Tracks training iterations |
| Accuracy | Percentage of correct predictions |
| Loss | Mean absolute error |

#### Presets
| Name | GPA | MCAT | Profile |
|------|-----|------|---------|
| Strong | 3.90 | 520 | High stats, balanced experience |
| Borderline | 3.60 | 508 | Needs in-state advantage |
| Research Focus | 3.75 | 514 | Heavy lab hours (1800) |
| Clinical Focus | 3.70 | 512 | Heavy patient care (2500) |

---

## Commands

### Deploy
When I say "Deploy":

1. **Verify Location**
   - Confirm we're inside the Gamertag folder (or a subfolder of it)
   - Check that .git exists at the root level

2. **Stage and Commit**
   - `git add .`
   - `git commit -m "Update: [describe what changed]"`

3. **Push**
   - `git push origin main`

4. **Report Success**
   - Confirm the push succeeded
   - Remind me of my live URL: https://aiml-1870-2026.github.io/[Gamertag]/

### New Assignment
When I say "Start [AssignmentName]":

1. Create a folder called `[AssignmentName]/` in the root
2. Create subfolders: `css/`, `js/`, `assets/`
3. Create starter files:
   - `index.html` (links to `css/style.css` and `js/main.js`)
   - `css/style.css` (base reset/styles)
   - `js/main.js` (entry point with DOMContentLoaded)
4. Tell me the folder is ready

### Show My URLs
When I say "Show my URLs" or "Where's my stuff?":

1. List all subfolders that contain an index.html
2. For each, show the live URL pattern

## Coding Standards
- New projects use separated files with dedicated subfolders (see structure below)
- Existing single-file projects (Boids, Turing-Patterns, etc.) stay as-is unless refactored
- No personally identifiable information in code or comments
- Use descriptive folder names (e.g., "Julia-Set-Explorer" not "assignment3")

## New Project Folder Structure
When creating a new project, use this layout:
```
ProjectName/
  SPEC.md             ← Project specification / requirements
  index.html          ← Main HTML (minimal, links to css/js)
  css/
    style.css         ← All styles
  js/
    main.js           ← Core application logic
  assets/             ← Images, fonts, audio, data files
```
- Every project MUST include a `SPEC.md` at its root describing the project's purpose, features, and technical details
- `index.html` should link to `css/style.css` and `js/main.js`
- Additional JS modules go in `js/` (e.g., `js/utils.js`, `js/renderer.js`)
- Additional stylesheets go in `css/` (e.g., `css/components.css`)
- Keep `assets/` organized by type if needed (e.g., `assets/images/`, `assets/audio/`)

## File Naming
- Main file: `index.html`
- Stylesheets: lowercase, hyphens (e.g., `css/particle-effects.css`)
- Scripts: lowercase, hyphens (e.g., `js/particle-system.js`)
- Assets: lowercase, hyphens (e.g., `assets/hero-bg.png`)
- Assignment folders: Descriptive names or `Assignment-XX`