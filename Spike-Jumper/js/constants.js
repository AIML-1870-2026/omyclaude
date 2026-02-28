// js/constants.js — All tunable constants for Syntax Error

const CONFIG = Object.freeze({
  // Canvas / world dimensions
  CANVAS_WIDTH:    800,
  CANVAS_HEIGHT:   480,
  WORLD_TILE:       40,   // px per grid tile in level data
  GROUND_Y:        360,   // y-pixel of ground surface (top of floor)
  FLOOR_HEIGHT:    120,   // px from GROUND_Y to canvas bottom

  // Physics — Cube mode
  GRAVITY:        1900,   // px/s² (downward acceleration)
  JUMP_VELOCITY:  -620,   // px/s (instant upward velocity on jump)

  // Physics — Ship mode
  SHIP_THRUST:    -700,   // px/s² (upward acceleration while SPACE held)
  SHIP_GRAVITY:    900,   // px/s² (downward when not thrusting)
  SHIP_MAX_SPEED:  300,   // px/s vertical clamp

  // Scrolling
  SCROLL_SPEED:    180,   // px/s (base world scroll speed)
  FAST_SPEED:      260,   // px/s (after speed portal)
  PLAYER_X:        160,   // fixed screen x-position for player

  // Hitbox
  HITBOX_SIZE:      34,   // px (square)
  HITBOX_MARGIN:     9,   // px shrink per side (forgiveness)

  // Jump trail
  TRAIL_COUNT:       6,   // number of trailing semicolons

  // Camera shake
  SHAKE_FRAMES:     18,
  SHAKE_INTENSITY:  10,

  // Audio
  BPM:             140,
  BEAT_WINDOW_MS:   50,   // ±ms for "Perfect Syntax" window

  // Colors — VS Code Dark+ palette
  COLOR_BG:        '#1e1e1e',
  COLOR_SURFACE:   '#252526',
  COLOR_GROUND:    '#2d2d2d',
  COLOR_FLOOR:     '#3c3c3c',
  COLOR_SPIKE:     '#f44747',   // error red
  COLOR_BRACE:     '#d4d4d4',   // text gray
  COLOR_NULL:      '#569cd6',   // keyword blue
  COLOR_NULL_TEXT: '#9cdcfe',   // variable light-blue
  COLOR_BOMB:      '#dcdcaa',   // function yellow
  COLOR_PAD:       '#4ec9b0',   // type teal
  COLOR_RING:      '#c586c0',   // macro purple
  COLOR_PORTAL:    '#9cdcfe',   // variable light-blue
  COLOR_PLAYER:    '#ff8c00',   // warning orange
  COLOR_GHOST:     'rgba(100,180,255,0.35)',
  COLOR_COMMENT:   '#6a9955',   // comment green
  COLOR_DIM:       'rgba(255,255,255,0.06)',

  // Grid / parallax
  GRID_COLOR:      'rgba(100,140,200,0.04)',
  TERMINAL_COLOR:  'rgba(80,100,80,0.15)',
  FG_CODE_COLOR:   'rgba(255,255,255,0.07)',
});
