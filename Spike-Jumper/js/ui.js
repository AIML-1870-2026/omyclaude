// js/ui.js — DOM coordination: HUD, overlays, key events

class UI {

  constructor(game) {
    this.game = game;
    this._els = {};
    this._toastTimer = null;
  }

  // Call once after DOM is ready
  init() {
    this._query();
    this._bindEvents();
    this._renderMenuStats();
  }

  // ── DOM element cache ──────────────────────────────────
  _query() {
    const $ = id => document.getElementById(id);
    this._els = {
      progressFill:   $('progress-fill'),
      attemptCounter: $('attempt-counter'),
      muteBtn:        $('mute-btn'),
      menuOverlay:    $('menu-overlay'),
      bsodOverlay:    $('bsod-overlay'),
      winOverlay:     $('win-overlay'),
      pauseOverlay:   $('pause-overlay'),
      startBtn:       $('start-btn'),
      bestPctDisplay: $('best-pct-display'),
      attemptDisplay: $('attempt-display'),
      winPct:         $('win-pct'),
      winAttempts:    $('win-attempts'),
      perfectToast:   $('perfect-toast'),
      gameShell:      $('game-shell'),
    };
  }

  // ── Event binding ──────────────────────────────────────
  _bindEvents() {
    // Start button click
    this._els.startBtn.addEventListener('click', () => this._handleStart());

    // Mute toggle
    this._els.muteBtn.addEventListener('click', () => this._toggleMute());

    // Pause overlay click to resume
    this._els.pauseOverlay.addEventListener('click', () => {
      if (this.game.state === STATE.PAUSED) this.game.resume();
    });

    // Keyboard
    document.addEventListener('keydown', e => this._onKeyDown(e));
    document.addEventListener('keyup',   e => this._onKeyUp(e));

    // Touch support (mobile)
    document.addEventListener('touchstart', e => {
      e.preventDefault();
      this._handleSpaceDown();
    }, { passive: false });

    document.addEventListener('touchend', e => {
      e.preventDefault();
      this._handleSpaceUp();
    }, { passive: false });
  }

  _onKeyDown(e) {
    const g = this.game;
    if (e.code === 'Space') {
      e.preventDefault();
      if (g.state === STATE.MENU)   { this._handleStart(); return; }
      if (g.state === STATE.WIN)    { g.returnToMenu();    return; }
      if (g.state === STATE.PLAYING) this._handleSpaceDown();
    }
    if (e.code === 'Escape') {
      if (g.state === STATE.PLAYING) g.pause();
      else if (g.state === STATE.PAUSED) g.resume();
      else if (g.state === STATE.WIN) g.returnToMenu();
    }
    if (e.code === 'KeyM') this._toggleMute();
  }

  _onKeyUp(e) {
    if (e.code === 'Space') this._handleSpaceUp();
  }

  _handleSpaceDown() {
    const g = this.game;
    if (g.state !== STATE.PLAYING) return;
    g.player.spaceHeld = true;
    const jumped = g.player.jump();
    if (jumped) AudioEngine.sfxJump();
    g.onSpacePress(); // beat window check
  }

  _handleSpaceUp() {
    this.game.player.spaceHeld = false;
  }

  _handleStart() {
    if (this.game.state === STATE.MENU) this.game.start();
  }

  // ── HUD updates ────────────────────────────────────────
  updateHUD(game) {
    const pct = game.world.progress;
    this._els.progressFill.style.width = (Math.min(1, pct) * 100).toFixed(2) + '%';
    this._els.attemptCounter.textContent =
      `Attempt #${game.attempt}  |  Best: ${(game.bestPct * 100).toFixed(0)}%`;
  }

  // ── Overlay management ─────────────────────────────────
  showMenu() {
    this._renderMenuStats();
    this._show('menuOverlay');
    this._hide('bsodOverlay');
    this._hide('winOverlay');
    this._hide('pauseOverlay');
  }

  hideMenu() {
    this._hide('menuOverlay');
  }

  showBSOD() {
    this._show('bsodOverlay');
    this._els.gameShell.classList.add('shake');
    setTimeout(() => {
      this._els.gameShell.classList.remove('shake');
    }, 320);
    setTimeout(() => this._hide('bsodOverlay'), 1100);
  }

  showWin(pct, attempts) {
    this._els.winPct.textContent      = (pct * 100).toFixed(1) + '%';
    this._els.winAttempts.textContent = attempts;
    this._show('winOverlay');
  }

  hideWin() {
    this._hide('winOverlay');
  }

  showPause() {
    this._show('pauseOverlay');
  }

  hidePause() {
    this._hide('pauseOverlay');
  }

  // ── Perfect Syntax toast ──────────────────────────────
  showPerfectToast() {
    const el = this._els.perfectToast;
    el.classList.remove('show');
    // Force reflow for re-trigger
    void el.offsetWidth;
    el.classList.add('show');

    // Pulse the progress bar
    const fill = this._els.progressFill;
    fill.classList.remove('perfect-flash');
    void fill.offsetWidth;
    fill.classList.add('perfect-flash');

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 800);
  }

  // ── Helpers ────────────────────────────────────────────
  _show(key) { this._els[key].classList.remove('hidden'); }
  _hide(key) { this._els[key].classList.add('hidden'); }

  _renderMenuStats() {
    const g = this.game;
    this._els.bestPctDisplay.textContent =
      `Best: ${(g.bestPct * 100).toFixed(0)}%`;
    this._els.attemptDisplay.textContent =
      `Total attempts: ${g.totalAttempts}`;
  }

  _toggleMute() {
    const enabled = !AudioEngine.isEnabled();
    AudioEngine.setEnabled(enabled);
    this._els.muteBtn.classList.toggle('muted', !enabled);
    this._els.muteBtn.textContent = enabled ? '♪' : '♪̶';
    if (enabled && this.game.state === STATE.PLAYING) {
      AudioEngine.startMusic();
    }
  }
}
