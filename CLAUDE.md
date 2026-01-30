# Royal Decree - Kingdom of omyclaude

## Identity
- **Gamertag**: omyclaude
- **Kingdom**: AIML-1870-2026/omyclaude
- **Author**: Abdul Hameed Rahmanzai

## Commands

### Deploy
Push all changes to GitHub and ensure GitHub Pages is enabled:
```bash
git add -A && git commit -m "Deploy kingdom" && git push origin main
```

### New Assignment
Create a new assignment folder in the kingdom:
```bash
mkdir -p <assignment-name>
```
Each assignment is a subfolder containing its own `index.html`, `spec.md`, and `README.md`.

### Show URLs
Display all live GitHub Pages URLs for each assignment:
- **Kingdom Home**: https://aiml-1870-2026.github.io/omyclaude/
- **Assignment-2 (Starfield Cockpit)**: https://aiml-1870-2026.github.io/omyclaude/Assignment-2/
- **Stellar-Web (Orbital Gravity Simulator)**: https://aiml-1870-2026.github.io/omyclaude/Stellar-Web/
- **Snake-Quest (The Living Circuit)**: https://aiml-1870-2026.github.io/omyclaude/Snake-Quest/

## Structure
```
omyclaude/
├── CLAUDE.md          # Royal Decree (this file)
├── Assignment-2/      # Starfield Cockpit Flight Deck
│   ├── index.html
│   ├── spec.md
│   └── README.md
├── Stellar-Web/       # Orbital Gravity Simulator
│   ├── index.html
│   ├── spec.md
│   └── README.md
└── Snake-Quest/       # The Living Circuit (Snake Game)
    ├── index.html
    ├── spec.md
    └── README.md
```

## Inheritance
This CLAUDE.md applies to all subdirectories. Each assignment inherits these deployment and structure rules.
