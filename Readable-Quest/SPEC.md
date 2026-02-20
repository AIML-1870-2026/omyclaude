# Readable Quest - Ultra Edition

## Overview
A professional-grade accessibility laboratory for exploring color contrast, WCAG 2.1 compliance, and vision deficiency simulations.

## Technical Stack
- HTML5 / CSS3 (CSS Grid & Flexbox)
- Vanilla JavaScript (ES6)
- SVG Filters for real-time color matrix transformations

## Features

### Dual-Sync Color Controls
- RGB Sliders (0-255) bi-directionally linked to integer input fields
- Real-time rendering of Background RGB, Text RGB, and Font Size changes

### Mathematical Engine
- WCAG Relative Luminance: L = 0.2126R + 0.7152G + 0.0722B (sRGB linearized)
- Contrast Ratio in X.XX:1 format
- Separate L(Background) and L(Text) readouts

### WCAG Compliance Badges
- AA (4.5:1) & AAA (7.0:1) for Normal Text
- AA (3.0:1) for Large Text (18pt/24px+)

### Vision Simulators
- Normal, Protanopia, Deuteranopia, Tritanopia, Monochromacy
- SVG color matrix filters
- Color inputs locked during simulation

### Presets
- High Contrast (Black/White)
- Solarized
- Dracula
- WCAG Fail (Grey/Light Grey)

## Design
- Responsive sidebar + lab area layout
- Glassmorphism aesthetic
- Font size slider uses rem/em units

## Deployment
- GitHub Pages: https://aiml-1870-2026.github.io/omyclaude/Readable-Quest/
