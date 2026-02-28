// js/level.js — Level data and parsing helpers

// ─────────────────────────────────────────────────────────────
// Tile → World coordinate conversion
// ─────────────────────────────────────────────────────────────
// worldX = entity.x * WORLD_TILE  (left edge of entity)
// worldY = GROUND_Y - entity.y * WORLD_TILE - WORLD_TILE
//   where entity.y = 0 means sitting on the ground,
//         entity.y = 1 means one tile above ground, etc.

function tileToWorld(e) {
  const T  = CONFIG.WORLD_TILE;
  const GY = CONFIG.GROUND_Y;

  const pixW = (e.w || 1) * T;
  const pixH = (e.h || 1) * T;

  // Null pits are gaps IN the ground surface, not entities above it.
  // Their worldY is always GROUND_Y (the pit mouth is at ground level).
  if (e.type === 'null') {
    return {
      ...e,
      worldX: e.x * T,
      worldY: GY,
      pixW,
      pixH: CONFIG.CANVAS_HEIGHT - GY,  // full pit depth to canvas bottom
      meta: e.meta || {},
    };
  }

  // worldY: top-left corner of entity, measured from canvas top
  //   y=0 (ground level) → top of entity is at GROUND_Y - WORLD_TILE
  //   y=1 (one tile up)  → top of entity is at GROUND_Y - 2*WORLD_TILE
  //   Ceiling entities use large y values (max y=8 for GROUND_Y=360, TILE=40)
  const baseY = GY - pixH - (e.y || 0) * T;

  return {
    ...e,
    worldX: e.x * T,
    worldY: baseY,
    pixW,
    pixH,
    meta: e.meta || {},
  };
}

function parseLevel(rawEntities) {
  return rawEntities.map(tileToWorld);
}

// ─────────────────────────────────────────────────────────────
// Level 1: "Null Reference Nightmare"
// 43 hand-crafted entities across 5 acts, 138 tiles = 5520px
// BPM=140 → 1 beat ≈ 3 tiles at 280px/s
// ─────────────────────────────────────────────────────────────
const LEVEL_1_RAW = [

  // ════════════════════════════════════════════
  // ACT I — Tutorial (tiles 0–25)
  // "First encounter with spikes and a jump pad"
  // ════════════════════════════════════════════

  // Big open runway to learn the feel before first spike
  // Beat 4: first spike — simple single hop
  { type: 'spike', x: 12 },

  // Beat 6: jump pad — shows player how auto-launch works
  { type: 'pad', x: 18 },

  // Beat 8: second spike after pad
  { type: 'spike', x: 23 },

  // ════════════════════════════════════════════
  // ACT II — Rhythm Groove (tiles 26–55)
  // "Null pit + gravity ring introduced"
  // ════════════════════════════════════════════

  // Beat 10-12: two spikes with big gaps
  { type: 'spike', x: 30 },
  { type: 'spike', x: 36 },

  // Beat 13: first null pit — narrow, easy to jump
  { type: 'null', x: 42, w: 2 },

  // Beat 15: gravity ring — shows mechanic with no danger nearby
  { type: 'ring', x: 50, y: 2 },

  // Beat 16: one ceiling spike — only dangerous if you flipped
  { type: 'spike', x: 54, y: 8, meta: { flipped: true } },

  // Beat 17: ring to flip back down safely
  { type: 'ring', x: 57, y: 5 },

  // ════════════════════════════════════════════
  // ACT III — Ship Section (tiles 56–80)
  // "Cube → Ship portal introduces thrust mechanics"
  // ════════════════════════════════════════════

  // Beat 19: mode portal — CUBE becomes SHIP
  { type: 'portal', x: 57, meta: { mode: 'ship' } },

  // Beat 20-24: ship corridor — brace walls alternate top/bottom
  { type: 'brace', x: 61, y: 7, w: 3, h: 1 },    // ceiling trap
  { type: 'brace', x: 65, y: 0, w: 2, h: 1 },    // floor trap
  { type: 'brace', x: 69, y: 6, w: 2, h: 1 },    // ceiling trap
  { type: 'brace', x: 73, y: 0, w: 3, h: 1 },    // floor trap

  // Beat 25: null pit during ship mode (falling kills)
  { type: 'null', x: 77, w: 2 },

  // Beat 26: mode portal — SHIP becomes CUBE
  { type: 'portal', x: 81, meta: { mode: 'cube' } },

  // ════════════════════════════════════════════
  // ACT IV — Logic Bomb Maze (tiles 82–110)
  // "Error 404 bombs + speed portal"
  // ════════════════════════════════════════════

  // Beat 27: logic bomb — side = death, top = safe platform
  { type: 'bomb', x: 86, y: 0, w: 2, h: 1 },

  // Beat 28: spike after bomb forces precise timing
  { type: 'spike', x: 89 },

  // Beat 29: speed portal — world accelerates
  { type: 'portal', x: 93, meta: { speed: 'fast' } },

  // Beat 30-32: at FAST_SPEED — spaced out spikes
  { type: 'spike', x: 96 },
  { type: 'spike', x: 99 },
  { type: 'spike', x: 102 },

  // Beat 33: elevated bomb + null combo
  { type: 'bomb', x: 106, y: 1, w: 2, h: 1 },
  { type: 'null', x: 109, w: 2 },

  // Beat 34: double spike (was triple)
  { type: 'spike', x: 112 },
  { type: 'spike', x: 114 },

  // ════════════════════════════════════════════
  // ACT V — Final Ascent (tiles 112–138)
  // "All mechanics combined — speed returns to normal"
  // ════════════════════════════════════════════

  // Beat 37: speed portal — back to normal
  { type: 'portal', x: 114, meta: { speed: 'normal' } },

  // Beat 38: jump pad launches into gravity ring above
  { type: 'pad', x: 117 },
  { type: 'ring', x: 121, y: 3 },

  // Beat 39: ceiling spike forest (navigate while gravity-flipped)
  // y=7 → worldY=40, base at y=40, tip at y=80 — hangs just off the ceiling
  { type: 'spike', x: 124, y: 7, meta: { flipped: true } },
  { type: 'spike', x: 127, y: 7, meta: { flipped: true } },

  // Beat 40: ring to flip back to normal
  { type: 'ring', x: 130, y: 4 },

  // Beat 41: final brace wall + spike — the last gate
  { type: 'brace', x: 133, y: 0, w: 1, h: 3 },
  { type: 'spike', x: 135 },

  // Beat 42: level end — crossing this tile triggers WIN
  { type: 'end', x: 139 },
];

const LEVEL_1        = parseLevel(LEVEL_1_RAW);
const LEVEL_1_END_X  = 139 * CONFIG.WORLD_TILE;   // 5560px
