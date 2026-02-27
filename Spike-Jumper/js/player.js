// js/player.js — The Semicolon player entity

class Player {

  constructor() {
    this.reset();
  }

  reset() {
    this.x          = CONFIG.PLAYER_X;
    this.y          = CONFIG.GROUND_Y - CONFIG.HITBOX_SIZE;
    this.vy         = 0;
    this.grounded   = true;
    this.mode       = 'cube';        // 'cube' | 'ship'
    this.gravityDir = 1;             // 1 = normal, -1 = flipped (ceiling walk)
    this.spaceHeld  = false;
    this.rotation   = 0;             // visual rotation in degrees (cube spin)
    this.trail      = [];            // [{ x, y, alpha }] fading trail positions
    this.dead       = false;
    this.shards     = [];            // binary 0/1 particles on death
    this._ringCooldown = 0;          // ms — prevents instant re-trigger of rings
  }

  // Called on SPACE keydown
  jump() {
    if (this.dead) return;
    if (this.mode === 'cube' && this.grounded) {
      this.vy       = CONFIG.JUMP_VELOCITY * this.gravityDir;
      this.grounded = false;
      return true; // signal: a jump fired
    }
    return false;
  }

  // Called each game tick while SPACE is held (ship thrust)
  applyThrust(dt) {
    if (this.dead || this.mode !== 'ship' || !this.spaceHeld) return;
    const dtS = dt / 1000;
    this.vy += CONFIG.SHIP_THRUST * dtS * this.gravityDir;
  }

  update(dt) {
    if (this.dead) {
      this._updateShards(dt);
      return;
    }

    // Ship continuous thrust
    this.applyThrust(dt);

    // Ring cooldown
    if (this._ringCooldown > 0) this._ringCooldown -= dt;

    // Physics integration
    Physics.integrate(this, dt, this.mode, this.gravityDir);

    // Ground / ceiling resolution
    this.grounded = Physics.resolveGround(this, this.gravityDir);
    Physics.resolveCeiling(this, this.gravityDir);

    // Cube rotation: spin in air, snap to nearest 90° when landed
    if (this.mode === 'cube') {
      if (!this.grounded) {
        this.rotation += 4.5 * this.gravityDir; // spin direction matches gravity
      } else {
        // Snap
        const snap = Math.round(this.rotation / 90) * 90;
        this.rotation += (snap - this.rotation) * 0.4;
        if (Math.abs(snap - this.rotation) < 1) this.rotation = snap;
      }
    } else {
      // Ship: always level (no rotation)
      this.rotation = 0;
    }

    // Record trail position (before this frame's draw)
    this.trail.unshift({ x: this.x, y: this.y, alpha: 1.0 });
    if (this.trail.length > CONFIG.TRAIL_COUNT + 1) this.trail.pop();
    this.trail.forEach((t, i) => {
      t.alpha = Math.max(0, 1 - (i / CONFIG.TRAIL_COUNT));
    });
  }

  // Trigger death — sets dead flag and spawns binary shards
  die() {
    if (this.dead) return;
    this.dead = true;
    this._spawnShards();
  }

  // Flip gravity — called when player presses SPACE inside a gravity ring
  flipGravity() {
    if (this._ringCooldown > 0) return;
    this.gravityDir  *= -1;
    this.vy           = 0;
    this.grounded     = false;
    this._ringCooldown = 600; // ms cooldown to prevent double-flip
  }

  // ── Private helpers ──────────────────────────────────────────

  _spawnShards() {
    const cx = this.x + CONFIG.HITBOX_SIZE / 2;
    const cy = this.y + CONFIG.HITBOX_SIZE / 2;
    this.shards = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 80 + Math.random() * 220;
      this.shards.push({
        char:  Math.random() > 0.5 ? '0' : '1',
        x:     cx,
        y:     cy,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 60,
        alpha: 1.0,
        life:  900 + Math.random() * 400,
        size:  10 + Math.random() * 6,
      });
    }
  }

  _updateShards(dt) {
    const dtS = dt / 1000;
    this.shards.forEach(s => {
      s.x    += s.vx * dtS;
      s.y    += s.vy * dtS;
      s.vy   += 500 * dtS;  // gravity on shards
      s.life -= dt;
      s.alpha = Math.max(0, s.life / 1000);
    });
    this.shards = this.shards.filter(s => s.alpha > 0);
  }
}
