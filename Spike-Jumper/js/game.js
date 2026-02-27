'use strict';

class GameEngine {
  constructor(canvas) {
    this._canvas   = canvas;
    this.state     = STATE.MENU;
    this.score     = 0;
    this.hiScore   = parseInt(localStorage.getItem('macrophage-hi') || '0', 10);

    this._scrollSpeed  = PHYSICS.SCROLL_BASE;
    this._elapsed      = 0;
    this._freezeTimer  = 0;
    this._lastOnGround = true;
    this._muteActive   = false;

    this._groundY  = canvas.height * PHYSICS.GROUND_Y_RATIO;

    this.player    = new Macrophage(this._groundY);
    this.chunks    = new ChunkManager(canvas.width, this._groundY);
    this.physics   = new PhysicsEngine();
    this.particles = new ParticleSystem();
    this.renderer  = new Renderer(canvas);
    this.renderer.resize(canvas.width, canvas.height);
  }

  // ─── Input ───────────────────────────────────────────────────────────────

  onKeyDown(key) {
    if (key === 'm' || key === 'M') {
      this._toggleMute();
      return;
    }

    if (key !== ' ') return;

    if (this.state === STATE.MENU || this.state === STATE.DEAD) {
      this._startGame();
      return;
    }

    if (this.state === STATE.PLAYING && this.player.onGround) {
      this.physics.onJumpPress();
      SoundFX.jump();
    }
  }

  onKeyUp(key) {
    if (key === ' ') this.physics.onJumpRelease();
  }

  onResize(w, h) {
    this._groundY = h * PHYSICS.GROUND_Y_RATIO;
    this.renderer.resize(w, h);
  }

  // ─── State transitions ────────────────────────────────────────────────────

  _startGame() {
    this._groundY     = this._canvas.height * PHYSICS.GROUND_Y_RATIO;
    this.state        = STATE.PLAYING;
    this.score        = 0;
    this._elapsed     = 0;
    this._scrollSpeed = PHYSICS.SCROLL_BASE;
    this._freezeTimer = 0;
    this._lastOnGround = true;

    this.player    = new Macrophage(this._groundY);
    this.chunks    = new ChunkManager(this._canvas.width, this._groundY);
    this.particles = new ParticleSystem();

    SoundFX.startBgTrack();
  }

  _die() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.DEAD;
    this.player.kill();

    this.particles.spawnDeath(this.player.x, this.player.y);
    this.renderer.triggerShake();
    this._freezeTimer = PHYSICS.FREEZE_FRAMES;

    SoundFX.death();
    SoundFX.stopBgTrack();

    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      localStorage.setItem('macrophage-hi', this.hiScore);
    }
  }

  _toggleMute() {
    this._muteActive = !this._muteActive;
    SoundFX.setEnabled(!this._muteActive);
    if (this._muteActive) {
      SoundFX.stopBgTrack();
    } else if (this.state === STATE.PLAYING) {
      SoundFX.startBgTrack();
    }
  }

  // ─── Main loop ────────────────────────────────────────────────────────────

  update(dt) {
    if (this.state !== STATE.PLAYING) return;

    // Freeze frame stall (logic pauses, draw still runs)
    if (this._freezeTimer > 0) {
      this._freezeTimer--;
      this.particles.update();
      return;
    }

    this._elapsed     += dt;
    this.score         = Math.floor(this._elapsed / 100);

    // Speed scaling: +5% per 30s, capped at SCROLL_MAX
    const intervals    = Math.floor(this._elapsed / PHYSICS.SCROLL_SCALE_INT);
    this._scrollSpeed  = Math.min(
      PHYSICS.SCROLL_MAX,
      PHYSICS.SCROLL_BASE * (1 + intervals * PHYSICS.SCROLL_SCALE_PCT)
    );

    // Physics update
    this.physics.update(this.player, this._groundY, dt);
    this.player.update();

    // Land event detection
    const nowOnGround = this.player.onGround;
    if (!this._lastOnGround && nowOnGround) {
      this.particles.spawnLand(this.player.x, this.player.y);
      SoundFX.land();
    }
    this._lastOnGround = nowOnGround;

    // Scroll world + update chunks
    this.renderer.updateParallax(this._scrollSpeed);
    this.chunks.update(this._scrollSpeed, this.score);

    // Particles
    this.particles.update();

    // Collision detection
    this._checkCollisions();
  }

  _checkCollisions() {
    const p  = this.player;
    const pr = p.radius - 4; // slightly shrunk player circle
    const pb = {
      x: p.x - pr,
      y: p.y - pr * 1.2,
      w: pr * 2,
      h: pr * 2.4,
    };

    for (const h of this.chunks.allHazards) {
      if (h instanceof EndothelialGap) {
        // Gap collision: player is on ground level AND inside gap x-range
        if (p.onGround &&
            p.x + pr * 0.6 > h.x &&
            p.x - pr * 0.6 < h.x + h.w) {
          this._die();
          return;
        }
        continue;
      }

      if (h instanceof FreeRadical) {
        const hb = h.bounds;
        if (this.physics.overlaps(pb, hb)) {
          this._die();
          return;
        }
        continue;
      }

      const hb = h.bounds;
      if (this.physics.overlaps(pb, hb)) {
        this._die();
        return;
      }
    }
  }

  draw() {
    this.renderer.draw(
      this.state,
      this.player,
      this.chunks,
      this.particles,
      this.score,
      this.hiScore,
      this._muteActive
    );
  }
}
