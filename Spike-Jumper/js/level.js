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

  // Beat 3: first spike — simple single hop
  { type: 'spike', x: 9 },

  // Beat 5: two-spike cluster — rhythm timing required
  { type: 'spike', x: 15 },
  { type: 'spike', x: 16 },

  // Beat 7: jump pad — auto-launches over the gap ahead
  { type: 'pad', x: 20 },

  // Beat 8: reward — open landing, then a brace wall (must jump)
  { type: 'brace', x: 24, y: 0, w: 1, h: 3 },

  // ════════════════════════════════════════════
  // ACT II — Rhythm Groove (tiles 26–55)
  // "Null pit + gravity ring introduced"
  // ════════════════════════════════════════════

  // Beat 10-12: three spikes in steady rhythm
  { type: 'spike', x: 29 },
  { type: 'spike', x: 32 },
  { type: 'spike', x: 35 },

  // Beat 13: first null pit — must be airborne
  { type: 'null', x: 39, w: 3 },

  // Beat 14: spike on far lip of null — punishes late landing
  { type: 'spike', x: 42 },

  // Beat 15: gravity ring (floating, press SPACE inside to flip)
  { type: 'ring', x: 46, y: 2 },

  // Beat 16: ceiling spikes — only dangerous after gravity flip
  { type: 'spike', x: 50, y: 8, meta: { flipped: true } },
  { type: 'spike', x: 51, y: 8, meta: { flipped: true } },

  // Beat 17: second ring to flip back to normal gravity
  { type: 'ring', x: 53, y: 5 },

  // Beat 18: ground spike after ring section
  { type: 'spike', x: 55 },

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

  // Beat 30-32: at FAST_SPEED — tighter spike rhythm
  { type: 'spike', x: 96 },
  { type: 'spike', x: 98 },
  { type: 'spike', x: 100 },

  // Beat 33: elevated bomb + null combo (must land on bomb, then leap null)
  { type: 'bomb', x: 103, y: 1, w: 2, h: 1 },
  { type: 'null', x: 106, w: 2 },

  // Beat 34: triple-spike gauntlet
  { type: 'spike', x: 109 },
  { type: 'spike', x: 110 },
  { type: 'spike', x: 111 },

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
  { type: 'spike', x: 126, y: 7, meta: { flipped: true } },
  { type: 'spike', x: 128, y: 7, meta: { flipped: true } },

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
