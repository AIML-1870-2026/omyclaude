// js/game.js — GameEngine state machine

// ── State enum ──────────────────────────────────────────────
const STATE = Object.freeze({
  MENU:    'MENU',
  PLAYING: 'PLAYING',
  DEAD:    'DEAD',
  WIN:     'WIN',
  PAUSED:  'PAUSED',
});

class GameEngine {

  constructor() {
    // Persistent stats from localStorage
    this.bestPct      = parseFloat(localStorage.getItem('sj_bestPct'))  || 0;
    this.totalAttempts = parseInt(localStorage.getItem('sj_attempts'))   || 0;

    // Game state
    this.state   = STATE.MENU;
    this.attempt = 1;

    // Core systems
    this.player      = new Player();
    this.world       = new World(LEVEL_1, LEVEL_1_END_X);
    this.renderer    = new Renderer(document.getElementById('game-canvas'));
    this.recorder    = new GhostRecorder();
    this.ghostPlayer = new GhostPlayer();
    this.ui          = new UI(this);

    // Timing
    this._lastTimestamp = 0;
    this._rafId         = null;
    this._deadTimer     = 0;     // ms elapsed in DEAD state
    this._deadDuration  = 1200; // ms before auto-restart

    // Beat pulse polling
    this._beatWasHigh = false;
  }

  // ── Lifecycle ───────────────────────────────────────────
  init() {
    this.ui.init();
    this.ui.showMenu();
    this._startLoop();
  }

  // Called when player presses SPACE on the menu
  start() {
    this._resetRun();
    this.state = STATE.PLAYING;
    this.ui.hideMenu();
    AudioEngine.startMusic();
    this.ghostPlayer.load();
    this.ghostPlayer.reset();
  }

  // Reset for a new attempt (also called after death)
  _resetRun() {
    this.player.reset();
    this.world.reset();
    this.recorder.reset();
    this.ghostPlayer.reset();
    this._deadTimer = 0;
  }

  // Called when player collides with a hazard
  die() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.DEAD;
    this.player.die();
    this.renderer.triggerShake();

    // Save ghost if best run
    const progress = this.world.progress;
    if (progress > this.bestPct) {
      this.bestPct = progress;
      localStorage.setItem('sj_bestPct', progress.toFixed(4));
    }
    this.recorder.save(progress);

    // Increment attempt counter
    this.totalAttempts++;
    this.attempt++;
    localStorage.setItem('sj_attempts', this.totalAttempts);

    AudioEngine.sfxDeath();
    AudioEngine.stopMusic();
    this.ui.showBSOD();
  }

  // Called when player reaches the end marker
  win() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.WIN;
    AudioEngine.stopMusic();

    const pct = this.world.progress;
    if (pct > this.bestPct) {
      this.bestPct = pct;
      localStorage.setItem('sj_bestPct', pct.toFixed(4));
    }
    this.recorder.save(pct);
    this.totalAttempts++;
    localStorage.setItem('sj_attempts', this.totalAttempts);

    this.ui.showWin(pct, this.attempt);
  }

  // Called from UI on ESC during play
  pause() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.PAUSED;
    AudioEngine.stopMusic();
    this.ui.showPause();
  }

  // Called from UI on ESC during pause, or click on pause overlay
  resume() {
    if (this.state !== STATE.PAUSED) return;
    this.state = STATE.PLAYING;
    AudioEngine.startMusic();
    this.ui.hidePause();
  }

  // Called from UI when player presses SPACE on WIN screen
  returnToMenu() {
    this.state   = STATE.MENU;
    this.attempt = 1;
    this.ui.hideWin();
    this.ui.showMenu();
    this._resetRun();
  }

  // Called from UI on every SPACE press during PLAYING
  onSpacePress() {
    if (AudioEngine.checkBeatWindow()) {
      AudioEngine.sfxPerfect();
      this.renderer.triggerBeatFlash();
      this.ui.showPerfectToast();
    }
  }

  // ── Main loop ───────────────────────────────────────────
  _startLoop() {
    const loop = timestamp => {
      const dt = this._lastTimestamp === 0
        ? 16
        : Math.min(timestamp - this._lastTimestamp, 50); // cap delta at 50ms
      this._lastTimestamp = timestamp;

      this._tick(dt);
      this.renderer.draw(this);
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  _tick(dt) {
    switch (this.state) {
      case STATE.PLAYING: this._tickPlaying(dt); break;
      case STATE.DEAD:    this._tickDead(dt);    break;
      case STATE.PAUSED:  /* freeze */           break;
    }
  }

  _tickPlaying(dt) {
    // Update player physics
    this.player.update(dt);

    // Scroll world
    this.world.scroll(dt, this.player);

    // Record ghost frame
    this.recorder.record(this.player);

    // Advance ghost playback
    this.ghostPlayer.tick();

    // HUD refresh
    this.ui.updateHUD(this);

    // Beat pulse → renderer flash
    const intensity = AudioEngine.getBeatIntensity();
    if (intensity > 0.5 && !this._beatWasHigh) {
      this.renderer.triggerBeatFlash();
      this._beatWasHigh = true;
    } else if (intensity < 0.3) {
      this._beatWasHigh = false;
    }

    // Collision detection
    this._checkCollisions();

    // Win check
    if (this.world.isLevelComplete()) this.win();
  }

  _tickDead(dt) {
    this.player.update(dt); // continue shard animation
    this._deadTimer += dt;
    if (this._deadTimer >= this._deadDuration) {
      this._resetRun();
      this.state = STATE.PLAYING;
      AudioEngine.startMusic();
    }
  }

  // ── Collision detection ─────────────────────────────────
  _checkCollisions() {
    const p      = this.player;
    const pAABB  = Physics.getAABB(p);
    const visible = this.world.getVisible();

    for (const e of visible) {
      const sx = this.world.screenX(e.worldX);
      const eAABB = {
        x: sx + CONFIG.HITBOX_MARGIN,
        y: e.worldY + CONFIG.HITBOX_MARGIN,
        w: e.pixW - CONFIG.HITBOX_MARGIN * 2,
        h: e.pixH - CONFIG.HITBOX_MARGIN * 2,
      };

      switch (e.type) {

        case 'spike': {
          // Triangle hitbox approximation: use center of base as death zone
          // Simple triangle collision: use AABB shrunk by 25%
          const triAABB = {
            x: sx + e.pixW * 0.15,
            y: e.worldY,
            w: e.pixW * 0.7,
            h: e.pixH * 0.85,
          };
          if (Physics.overlaps(pAABB, triAABB)) { this.die(); return; }
          break;
        }

        case 'brace':
          if (Physics.overlaps(pAABB, eAABB)) { this.die(); return; }
          break;

        case 'null': {
          // Pit: kill if player's feet reach ground level over the pit range
          const pRight  = p.x + CONFIG.HITBOX_SIZE;
          const pBottom = p.y + CONFIG.HITBOX_SIZE;
          const eLeft   = sx;
          const eRight  = sx + e.pixW;
          if (pRight > eLeft && p.x < eRight && pBottom >= CONFIG.GROUND_Y) {
            this.die(); return;
          }
          break;
        }

        case 'bomb': {
          const edge = Physics.collideEdge(pAABB, eAABB);
          if (edge === 'side') { this.die(); return; }
          if (edge === 'top') {
            // Land on bomb safely: push player up, zero vy
            p.y       = e.worldY - CONFIG.HITBOX_SIZE;
            p.vy      = 0;
            p.grounded = true;
          }
          break;
        }

        case 'pad': {
          const padAABB = {
            x: sx,
            y: e.worldY + CONFIG.WORLD_TILE - 8,
            w: e.pixW,
            h: 8,
          };
          if (Physics.overlaps(pAABB, padAABB) && p.vy >= 0) {
            p.vy      = -680 * (p.gravityDir === 1 ? 1 : -1);
            p.grounded = false;
            AudioEngine.sfxPad();
          }
          break;
        }

        case 'ring': {
          if (Physics.overlaps(pAABB, eAABB) && p.spaceHeld) {
            p.flipGravity();
            AudioEngine.sfxRing();
          }
          break;
        }

        case 'portal': {
          if (Physics.overlaps(pAABB, eAABB)) {
            if (e.meta.mode && p.mode !== e.meta.mode) {
              p.mode = e.meta.mode;
              if (e.meta.mode === 'ship') {
                // Center player vertically for smoother ship entry
                if (p.y < 50) p.y = 50;
              }
              AudioEngine.sfxPortal();
            }
            if (e.meta.speed === 'fast')   this.world.speed = CONFIG.FAST_SPEED;
            if (e.meta.speed === 'normal') this.world.speed = CONFIG.SCROLL_SPEED;
          }
          break;
        }
      }
    }
  }
}
