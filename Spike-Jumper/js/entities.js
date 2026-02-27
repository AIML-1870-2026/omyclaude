'use strict';

class Macrophage {
  constructor(groundY) {
    this.x        = PHYSICS.PLAYER_X;
    this.y        = groundY;
    this.vy       = 0;
    this.onGround = true;
    this.scaleX   = 1;
    this.scaleY   = 1;
    this._alive   = true;
    this._idleT   = 0;
    this._squashTimer  = 0;
  }

  get alive() { return this._alive; }

  get radius() { return PHYSICS.PLAYER_RADIUS; }

  update() {
    this._idleT += PHYSICS.IDLE_PULSE_FREQ;
    if (this.onGround && this._squashTimer <= 0) {
      this.scaleY = 1 + Math.sin(this._idleT) * PHYSICS.IDLE_PULSE_AMP;
      this.scaleX = 1 - Math.sin(this._idleT) * PHYSICS.IDLE_PULSE_AMP * 0.5;
    }
    if (this._squashTimer > 0) this._squashTimer--;
  }

  kill() { this._alive = false; }
}

class ViralCluster {
  constructor(x, groundY) {
    this.x     = x;
    this.y     = groundY - HAZARDS.VIRAL_H;
    this.w     = HAZARDS.VIRAL_W;
    this.h     = HAZARDS.VIRAL_H;
    this._phase = Math.random() * Math.PI * 2;
  }

  get spikePhase() {
    this._phase += 0.04;
    return this._phase;
  }

  get bounds() {
    const s = HAZARDS.HITBOX_SHRINK;
    return { x: this.x + s, y: this.y + s, w: this.w - s * 2, h: this.h - s * 2 };
  }
}

class CholesterolPlaque {
  constructor(x, groundY) {
    const h = HAZARDS.PLAQUE_H_MIN +
              Math.random() * (HAZARDS.PLAQUE_H_MAX - HAZARDS.PLAQUE_H_MIN);
    this.x = x;
    this.y = groundY - h;
    this.w = HAZARDS.PLAQUE_W;
    this.h = h;
  }

  get bounds() {
    const s = HAZARDS.HITBOX_SHRINK * 0.5;
    return { x: this.x + s, y: this.y, w: this.w - s * 2, h: this.h };
  }
}

class FreeRadical {
  constructor(x, minY, maxY) {
    this.x    = x;
    this.y    = minY + Math.random() * (maxY - minY);
    this.r    = HAZARDS.FREE_RADICAL_R;
    this.vy   = HAZARDS.FREE_RADICAL_VY_MIN +
                Math.random() * (HAZARDS.FREE_RADICAL_VY_MAX - HAZARDS.FREE_RADICAL_VY_MIN);
    if (Math.abs(this.vy) < 0.5) this.vy = 1.2;
    this._minY = minY;
    this._maxY = maxY;
    this._phase = Math.random() * Math.PI * 2;
  }

  update() {
    this.y += this.vy;
    this._phase += 0.06;
    if (this.y <= this._minY || this.y >= this._maxY) this.vy *= -1;
  }

  get bounds() {
    const s = HAZARDS.HITBOX_SHRINK * 0.5;
    return {
      x: this.x - this.r + s,
      y: this.y - this.r + s,
      w: (this.r - s) * 2,
      h: (this.r - s) * 2,
    };
  }
}

class EndothelialGap {
  constructor(x) {
    this.x = x;
    this.w = HAZARDS.GAP_W_MIN +
             Math.random() * (HAZARDS.GAP_W_MAX - HAZARDS.GAP_W_MIN);
  }
}
