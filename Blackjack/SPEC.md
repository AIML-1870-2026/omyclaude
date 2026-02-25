# Blackjack — Deterministic Card Engine

**A high-fidelity Blackjack simulation prioritizing UI/UX clarity, software correctness, and probability education.**

Live: https://aiml-1870-2026.github.io/omyclaude/Blackjack/

---

## 1. Overview

A fully playable browser-based Blackjack game built in vanilla JavaScript. The engine implements casino-standard rules with a 6-deck shoe, Fisher-Yates shuffle, and a deterministic state machine. It includes stretch-goal features: Split, Double Down, Insurance, a Hi-Lo card counting HUD, and a real-time Basic Strategy hint engine.

---

## 2. System Architecture

### A. The Kinetic Deck (`js/deck.js`)

| Feature | Implementation |
|---------|---------------|
| Shoe Size | 6 standard decks (312 cards) |
| Shuffle | Fisher-Yates algorithm (true uniform randomness) |
| Draw | `Array.pop()` — non-destructive, prevents duplicates |
| Reshuffle | Triggered automatically when < 15 cards remain |

### B. The Scoring Heuristic (`js/hand.js`)

| Card | Value |
|------|-------|
| 2 – 10 | Face value |
| J, Q, K | 10 |
| Ace | 11 → reduces to 1 if total > 21 (Ace Paradox) |

**Ace Paradox:** `while (total > 21 && aces > 0) { total -= 10; aces-- }`

**Verification:** A-5-K = 11+5+10 = 26 → reduce ace → 1+5+10 = **16** ✓

### C. The Dealer Protocol (`js/game.js`)

| Threshold | Action |
|-----------|--------|
| Total < 17 | Must HIT |
| Total ≥ 17 | Must STAND |

Dealer plays after all player hands are resolved. Hole card is revealed before dealer acts.

### D. The Game Loop State Machine

```
BETTING ──[deal]──▶ INSURANCE ──[peek: dealer BJ]──▶ RESOLUTION
                │                └──[no dealer BJ]──▶ PLAYER_TURN
                └───────────────────────────────────▶ PLAYER_TURN
                                                         │
                                                    [all hands done]
                                                         │
                                                    DEALER_TURN
                                                         │
                                                    [resolve()]
                                                         │
                                                    RESOLUTION ──[new game]──▶ BETTING
```

---

## 3. UI/UX Design

### Layout (Top → Bottom)

1. **HUD Bar** — Bankroll display, current bet, optional running count, optional strategy hint
2. **Dealer Zone** — Dealer's cards + visible total
3. **Message Overlay** — Centered result banner (WIN / LOSE / BUST / PUSH / BLACKJACK)
4. **Player Zone** — One or two hand containers (split support)
5. **Betting Controls** — Chip buttons ($5/$10/$25/$50/$100) + Clear Bet
6. **Action Controls** — Deal / Hit / Stand / Double / Split / Insurance / New Game
7. **Analytics Panel** — Toggle buttons for Count HUD and Strategy Hint

### Visual Design

- Casino green felt table (`#1b4332`) with radial gradient center light
- Dark navy surround (`#0a1628`)
- Gold accents (`#c9a84c`) on borders and primary buttons
- White playing cards with CSS 3D flip animation for hole card reveal
- Animated card dealing (slide-in from above, staggered 400ms)

### State-Gated Controls

| Control | Active State |
|---------|-------------|
| Chips + Clear + Deal | BETTING |
| Hit + Stand | PLAYER_TURN |
| Double | PLAYER_TURN, 2-card hand, sufficient bankroll |
| Split | PLAYER_TURN, matching pair, sufficient bankroll |
| Insurance / No Insurance | INSURANCE |
| New Game | RESOLUTION |

---

## 4. Win/Loss Matrix

| Scenario | Condition | Outcome | Payout |
|----------|-----------|---------|--------|
| Natural Blackjack | Player 21 on deal, dealer no BJ | WIN | 1.5× bet |
| Standard Win | Player total > dealer total | WIN | 1× bet |
| Dealer Bust | Dealer total > 21 | WIN | 1× bet |
| Push | Player total == dealer total | PUSH | Bet returned |
| Bust | Player total > 21 | LOSE | Bet lost |
| Dealer Blackjack | Dealer 21 on deal, player no BJ | LOSE | Bet lost |
| Both Blackjack | Both have natural 21 | PUSH | Bet returned |
| Insurance Win | Dealer has BJ, player took insurance | SIDE WIN | 2:1 on side bet |

---

## 5. Stretch Goals

### Gameplay
- **Double Down** — Double bet after first two cards; receive exactly one more card
- **Split** — Bifurcate identical cards into two independent hands; each receives one additional card
- **Insurance** — Side bet (up to half main bet) offered when dealer shows Ace; pays 2:1 if dealer has Blackjack

### Analytics
- **Running Count HUD** — Hi-Lo system: 2-6 = +1, 7-9 = 0, 10/J/Q/K/A = -1
- **Strategy Hint Engine** — Real-time Basic Strategy advice (Hard, Soft, Pairs tables)

---

## 6. File Structure

```
Blackjack/
  SPEC.md
  index.html          ← DOM shell, script loading
  css/
    style.css         ← All styles: layout, cards, animations, chips
  js/
    deck.js           ← Card, Deck (Fisher-Yates shoe)
    hand.js           ← Hand (scoring, Ace paradox, state detection)
    strategy.js       ← Hi-Lo count, Basic Strategy matrix
    game.js           ← GameEngine state machine, payouts
    ui.js             ← DOM rendering, card animations, event coordination
    main.js           ← Bootstrap (DOMContentLoaded)
  assets/             ← Reserved for future card images / audio
```

---

## 7. Testing & Validation

| Test | Condition | Expected |
|------|-----------|---------|
| Payout Accuracy | $10 bet, natural BJ | Bankroll +$15 |
| Ace Pivot | A + 5 + K | Total = 16 |
| Bet Integrity | Bet after Deal clicked | No change allowed |
| Dealer Threshold | Dealer at 16 | Must HIT |
| Dealer Threshold | Dealer at 17 | Must STAND |
| Push | Player 18, Dealer 18 | Bet returned |
| Double Down | Two-card hand | Bet doubled, one card dealt |
| Split | Pair of 8s | Two separate hands of one card each + dealt card |

---

## 07. Atmospheric & Border Architecture (The "Vibe")

**Concept:** "A pre-med student's illegal Blackjack rig running on a bio-luminescent terminal."

The entire screen is a dashboard, not a webpage. The center is the Blackjack table; the periphery is an Underground Terminal environment.

### A. The Bio-Grid Frame

| Element | Specification |
|---------|--------------|
| Background | `#0a0a0c` Obsidian with floating bio-particle field (55 particles, Canvas 2D) |
| Scanlines | Fixed `position: fixed` CRT overlay (`repeating-linear-gradient`, 4px repeat, z-index: 999) |
| Table border | State-reactive neon pulse — see State Color Matrix |
| Font | JetBrains Mono (Google Fonts) — monospace terminal feel |

### B. State Color Matrix (Table Border)

| Game State | Border Color | Glow |
|-----------|-------------|------|
| Betting (idle) | Teal `#00e5c8` | Subtle `rgba(0,229,200,0.15)` |
| Player Turn | Bio-Green `#00ff78` | `rgba(0,255,120,0.25)` |
| Dealer Turn | Amber `#f59e0b` | `rgba(245,158,11,0.25)` |
| Insurance | Orange `#f97316` | `rgba(249,115,22,0.25)` |
| WIN | Bio-Green | `rgba(0,255,120,0.40)` |
| LOSE / BUST | Red `#ef4444` | `rgba(239,68,68,0.40)` |
| BLACKJACK | Gold `#c9a84c` | `rgba(201,168,76,0.50)` |
| PUSH | Blue `#3b82f6` | `rgba(59,130,246,0.30)` |

### C. Left Panel — Vitals

| Widget | Implementation |
|--------|---------------|
| **Cardiac Monitor** | SVG EKG line with `stroke-dashoffset` pan animation; speed reacts to hand total |
| BPM | 60 (idle) → 80 (≥13) → 100 (≥17) → 130 (≥19) → 160 (≥21/bust) |
| **DNA Helix 3D** | Three `div.dna-ring` elements with `rotateY` CSS animation at offset delays |
| **System Heat** | Gradient progress bar (green→amber→red), increments 4% per round |
| **Researcher ID** | Static ID card (SCT-2026 / COMP-BIO / AIML-1870) with live clock |

### D. Right Panel — Terminal Log

| Element | Details |
|---------|---------|
| **Live Log** | `column-reverse` flex div; newest entries at top; capped at 120 entries |
| Tags | `[SYSTEM]` teal, `[LOG]` green, `[CALC]` yellow, `[WARN]` orange, `[RESULT]` gold |
| Events logged | Card draws, totals, bust risk, insurance, dealer reveal, results |
| **Probability Engine** | Bust risk bar (0–100% lookup table by hand total) + Shoe integrity bar |

### E. Top / Bottom Status Bars

| Bar | Content |
|-----|---------|
| **Top** | `SECURE CONNECTION: ENCRYPTED` · `NODE_ID: BJ-OMEGA-7` · Live system clock |
| **Bottom** | Session P&L (color-coded ±) · Shoe integrity % · Running count · Strategy engine status |

### F. Background Particle Field

- 55 floating dots on a `position:fixed` `<canvas>` behind everything
- Color: `rgba(0,255,120, α)` where α oscillates 0 → 0.7
- Slow drift velocity `±0.2px/frame`; wrap-around at viewport edges
- Rendered via `requestAnimationFrame` loop

### G. CSS Design Constraints

```css
/* Bio-luminescent card glow */
.card-front { box-shadow: 0 3px 12px rgba(0,0,0,0.5), 0 0 16px rgba(0,255,120,0.12); }

/* Scanline overlay */
#scanlines  { background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 4px); }

/* Table transition */
#table      { transition: border-color 0.4s ease, box-shadow 0.4s ease; }
```
