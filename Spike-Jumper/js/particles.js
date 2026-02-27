'use strict';

class ParticleSystem {
  constructor() {
    this._pool = [];
  }

  // Cytoplasm splash on landing
  spawnLand(x, y) {
    for (let i = 0; i < 8; i++) {
      this._pool.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4.5,
        vy: -Math.random() * 3.5 - 0.5,
        life: 1,
        decay: 0.055 + Math.random() * 0.04,
        r: 2.5 + Math.random() * 3,
        color: PALETTE.PARTICLE_LAND,
      });
    }
  }

  // Radial burst on lethal collision
  spawnDeath(x, y) {
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      this._pool.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.020 + Math.random() * 0.018,
        r: 3 + Math.random() * 5,
        color: PALETTE.PARTICLE_DEATH,
      });
    }
  }

  update() {
    for (let i = this._pool.length - 1; i >= 0; i--) {
      const p = this._pool[i];
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.18;
      p.life -= p.decay;
      if (p.life <= 0) this._pool.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this._pool) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  get count() { return this._pool.length; }
}
