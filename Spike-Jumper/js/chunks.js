'use strict';

const CHUNK_W = 600;

// Each template is a function(startX, groundY) => { hazards: [] }
// Safe zones at start (first 150px) and end (last 100px) of every chunk.
const CHUNK_TEMPLATES = [
  // 0: Baseline — single ViralCluster, clearable by short hop
  (x, g) => ({
    hazards: [new ViralCluster(x + 300, g)],
  }),

  // 1: Binary Threat — two clusters, gap = one short-hop distance
  (x, g) => ({
    hazards: [
      new ViralCluster(x + 220, g),
      new ViralCluster(x + 380, g),
    ],
  }),

  // 2: Plaque Wall — tall vertical blockade requiring high jump
  (x, g) => ({
    hazards: [new CholesterolPlaque(x + 300, g)],
  }),

  // 3: Gap Leap — endothelial void requiring a timed hop
  (x, g) => ({
    hazards: [new EndothelialGap(x + 250)],
  }),

  // 4: Radical Intercept — vertically bouncing free radical
  (x, g) => ({
    hazards: [new FreeRadical(x + 300, g - 200, g - 30)],
  }),

  // 5: Cluster + Gap — cluster then pit
  (x, g) => ({
    hazards: [
      new ViralCluster(x + 200, g),
      new EndothelialGap(x + 360),
    ],
  }),

  // 6: Dual Radicals — two free radicals at different vertical ranges
  (x, g) => ({
    hazards: [
      new FreeRadical(x + 220, g - 190, g - 50),
      new FreeRadical(x + 390, g - 150, g - 40),
    ],
  }),

  // 7: Plaque + Cluster — wall then spike
  (x, g) => ({
    hazards: [
      new CholesterolPlaque(x + 210, g),
      new ViralCluster(x + 370, g),
    ],
  }),

  // 8: Wide Gap — extra-large endothelial void
  (x, g) => ({
    hazards: [new EndothelialGap(x + 230)],
  }),

  // 9: Clear (Breather) — no hazards
  (x, g) => ({ hazards: [] }),
];

// Easy pool: indices of templates safe for low-score players
const EASY_POOL  = [0, 1, 9, 9, 2, 3];
const FULL_POOL  = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

class ChunkManager {
  constructor(canvasW, groundY) {
    this._canvasW  = canvasW;
    this._groundY  = groundY;
    this._chunks   = [];
    this._nextX    = canvasW;

    // Seed with two safe chunks
    this._spawn(9);
    this._spawn(9);
  }

  _spawn(templateIdx) {
    const tmpl  = CHUNK_TEMPLATES[templateIdx];
    const chunk = {
      startX:  this._nextX,
      hazards: tmpl(this._nextX, this._groundY).hazards,
    };
    this._chunks.push(chunk);
    this._nextX += CHUNK_W;
  }

  _pickTemplate(score) {
    const pool = score < 500 ? EASY_POOL : FULL_POOL;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  update(scrollDelta, score) {
    // Scroll all hazards left
    for (const chunk of this._chunks) {
      chunk.startX -= scrollDelta;
      for (const h of chunk.hazards) {
        h.x -= scrollDelta;
        if (h instanceof FreeRadical) h.update();
      }
    }

    // Cull off-screen-left chunks
    while (this._chunks.length > 0 &&
           this._chunks[0].startX + CHUNK_W < 0) {
      this._chunks.shift();
    }

    // Maintain 4-chunk lookahead
    const LOOKAHEAD = 4;
    while (this._chunks.length < LOOKAHEAD) {
      this._spawn(this._pickTemplate(score));
    }
  }

  get allHazards() {
    return this._chunks.flatMap(c => c.hazards);
  }

  get allGaps() {
    return this._chunks.flatMap(c =>
      c.hazards.filter(h => h instanceof EndothelialGap)
    );
  }
}
