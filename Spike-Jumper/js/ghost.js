// js/ghost.js — Git Blame Mode: record best run, replay as ghost

// ─────────────────────────────────────────────────────────────
// GhostRecorder: captures one frame per game tick
// ─────────────────────────────────────────────────────────────
class GhostRecorder {

  constructor() {
    this.frames = [];
  }

  reset() {
    this.frames = [];
  }

  // Call once per game tick during STATE.PLAYING
  record(player) {
    this.frames.push({
      x:        player.x,
      y:        player.y,
      mode:     player.mode,
      rotation: Math.round(player.rotation),
      vy:       Math.round(player.vy),
    });
  }

  // Persist this run to localStorage if it's the best completion so far.
  // progress: float 0.0 – 1.0
  save(progress) {
    const stored = parseFloat(localStorage.getItem('sj_bestPct')) || 0;
    if (progress > stored) {
      localStorage.setItem('sj_bestPct',  progress.toFixed(4));
      try {
        localStorage.setItem('sj_ghost', JSON.stringify(this.frames));
      } catch (_) {
        // Quota exceeded — ghost data is optional, fail silently
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// GhostPlayer: replays a previously recorded run
// ─────────────────────────────────────────────────────────────
class GhostPlayer {

  constructor() {
    this.frames       = [];
    this._frameIndex  = 0;
    this.active       = false;
    this.currentFrame = null;
  }

  // Load best ghost from localStorage
  load() {
    const raw = localStorage.getItem('sj_ghost');
    if (!raw) { this.active = false; return; }
    try {
      this.frames = JSON.parse(raw);
      this.active = this.frames.length > 0;
    } catch (_) {
      this.active = false;
    }
  }

  // Reset playback to frame 0 (call on every new attempt)
  reset() {
    this._frameIndex  = 0;
    this.currentFrame = this.frames[0] || null;
  }

  // Advance one frame. Call once per game tick during STATE.PLAYING.
  tick() {
    if (!this.active || this._frameIndex >= this.frames.length) {
      this.active = false;
      return;
    }
    this.currentFrame = this.frames[this._frameIndex++];
  }
}
