// ===== audio.js =====
// Web Audio API synthesized soundscape. No asset files required.
// Exposes global: SoundFX

const SoundFX = (() => {
  let _actx    = null;
  let _enabled = true;

  function _ctx() {
    if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
    if (_actx.state === 'suspended') _actx.resume();
    return _actx;
  }

  // Single oscillator tone
  function _tone(freq, dur, type = 'sine', vol = 0.22, delay = 0) {
    if (!_enabled) return;
    try {
      const c   = _ctx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.connect(g); g.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delay);
      g.gain.setValueAtTime(vol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + dur + 0.01);
    } catch (_) {}
  }

  // White noise burst
  function _noise(dur, vol = 0.08, delay = 0) {
    if (!_enabled) return;
    try {
      const c   = _ctx();
      const n   = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, n, c.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const g = c.createGain();
      src.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(vol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      src.start(c.currentTime + delay);
    } catch (_) {}
  }

  // Frequency sweep (used for flip)
  function _sweep(f0, f1, dur, type = 'sine', vol = 0.18, delay = 0) {
    if (!_enabled) return;
    try {
      const c   = _ctx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.connect(g); g.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(f0, c.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(f1, c.currentTime + delay + dur);
      g.gain.setValueAtTime(vol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + dur + 0.01);
    } catch (_) {}
  }

  // ── Public API ──────────────────────────────────────────

  // Card placed on table
  function deal() {
    _tone(820, 0.05, 'square', 0.12);
    _noise(0.035, 0.09);
  }

  // Hole card flip
  function flip() {
    _sweep(160, 520, 0.16, 'sine', 0.17);
    _noise(0.04, 0.05, 0.1);
  }

  // Deck/shoe shuffle at start of new shoe
  function shuffle() {
    for (let i = 0; i < 7; i++) _noise(0.055, 0.13, i * 0.048);
  }

  // Chip placed or button click
  function click() {
    _noise(0.022, 0.11);
  }

  // Player wins (C4 → E4 → G4 → C5)
  function win() {
    [[261, 0], [329, 0.09], [392, 0.18], [523, 0.27]]
      .forEach(([f, d]) => _tone(f, 0.2, 'sine', 0.22, d));
  }

  // Natural blackjack — brighter + longer (C5 → E5 → G5 → C6 → C6)
  function blackjack() {
    [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24], [1047, 0.38]]
      .forEach(([f, d]) => _tone(f, 0.26, 'sine', 0.26, d));
    _tone(1047, 0.5, 'sine', 0.12, 0.5);
  }

  // Bust / lose — descending sawtooth
  function bust() {
    _sweep(400, 95, 0.55, 'sawtooth', 0.18);
  }

  // Push — neutral double beep
  function push() {
    _tone(440, 0.1, 'sine', 0.18);
    _tone(440, 0.1, 'sine', 0.18, 0.14);
  }

  function setEnabled(val) { _enabled = val; }
  function isEnabled()     { return _enabled; }

  return { deal, flip, shuffle, click, win, blackjack, bust, push, setEnabled, isEnabled };
})();
