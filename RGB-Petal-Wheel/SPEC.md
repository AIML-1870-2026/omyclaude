# Spec: Bioluminescent Neural-Link Studio

## 1. Overview
The Bioluminescent Neural-Link Studio is an interactive RGB exploration tool designed with a "Cyber-Medical / Deep-Sea Research" aesthetic. It simulates the mixing of light as biological signals within a neural synapse. The tool serves as both a high-fidelity visualizer for additive color mixing and a professional palette generator for UI/UX design.

## 2. Features
- **The Synapse Explorer (Animated RGB Mixer):**
    - A central "Synapse Core" that changes color based on RGB input.
    - Three particle emitters (Red, Green, Blue) that shoot "photon-neurotransmitters" into the core.
    - Particle density and speed are tied to the slider values.
- **Dynamic Harmony Generator:**
    - Real-time generation of Complementary, Analogous, Triadic, and Split-Complementary palettes.
    - Visual "Neural Map" showing where these colors sit on the RGB wheel.
- **Medical HUD UI:**
    - Glassmorphic panels with neon cyan accents.
    - Real-time data readouts: Hex, RGB, and HSL values.
- **One-Touch Export:** - Click any generated swatch to copy the Hex code to clipboard with a "Signal Sent" animation.

## 3. Layout & Visual Style
- **Theme:** "Used Future" Dark Mode. Deep navy/black background (#050505).
- **Layout:** - Left Panel: RGB Control Sliders (Cyberpunk style) and HUD readouts.
    - Center: The Synapse Core (Canvas-based animation).
    - Right Panel: Harmony Palette Generation and "Neural Map" (Color Wheel).
- **Fonts:** Monospace for data (JetBrains Mono or Roboto Mono) and a clean sans-serif for UI.

## 4. Explorer Details (The Visual Metaphor)
- **Visuals:** Use HTML5 Canvas or Three.js for a fluid, glowing effect.
- **The "Mental Model" Constraint:** - The UI highlights that the two highest sliders define the "Signal Hue."
    - The third slider acts as a "Luminance Booster," desaturating the core toward White.
- **Animations:** - The core should have a "breathing" or pulsing glow effect.
    - Particle collisions should create subtle "ripple" effects in the core.

## 5. Palette & Harmony Details
- **Harmony Types:**
    - **Complementary:** 180° opposite.
    - **Analogous:** +/- 30° from base.
    - **Triadic:** 120° offsets.
- **UI Integration:** Clicking a color in the palette "injects" it into the explorer to see it in the Synapse Core.

## 6. Technical Requirements
- **Framework:** Vanilla JavaScript or React (User's choice).
- **Styling:** Tailwind CSS or custom CSS for Glassmorphism.
- **Deployment:** Must be compatible with GitHub Pages.
- **Code Standards:** Clean, modular functions for color conversions (RGB to HLS, RGB to Hex).

## 7. Interaction Logic
- Adjusting sliders updates the Synapse Core color and the Harmony Panel instantly.
- Hovering over a palette swatch shows the "Contrast Ratio" against the current background (Accessibility).

## 8. Color Blindness Simulator (Accessibility Stretch Goal)
- **Vision Deficiency Filters:** Toggle modes to simulate how the UI and palettes appear to users with Protanopia (red-blind), Deuteranopia (green-blind), and Tritanopia (blue-blind).
- **Transformation Logic:** Apply SVG color matrix filters to the entire application container to accurately shift RGB values into the visible spectrum for each deficiency.
- **Inclusive Design Toggle:** A dedicated "Accessibility Mode" button that overlays the simulated view, allowing the user to verify that their "Neural-Link" signals remain distinguishable for all users.
