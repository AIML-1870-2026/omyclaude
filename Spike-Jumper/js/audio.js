// js/audio.js — AudioEngine IIFE
// All sound is procedurally generated — no audio files required.
// Pattern mirrors Blackjack/js/audio.js (lazy AudioContext, IIFE module).

const AudioEngine = (() => {
  let _ctx         = null;
  let _enabled     = true;
  let _musicActive = false;
  let _beatIndex   = 0;
  let _startTime   = 0;     // AudioContext.currentTime when music began
  let _scheduleId  = null;

  const BPM       = CONFIG.BPM;                 // 140
  const BEAT_S    = 60 / BPM;                   // ~0.4286s per beat
  const LOOKAHEAD = 0.25;                        // schedule window in seconds

  // D-minor pentatonic: D3 F3 G3 A3 C4
  const BASS_NOTES = [147, 175, 196, 220, 262, 220, 196, 175];

  // ── AudioContext (lazy init, activated on first user gesture) ──
  function _actx() {
    if (!_ctx) {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  // ── Primitive: single oscillator tone ──
  function _tone(freq, dur, type = 'square', vol = 0.12, delayS = 0) {
    if (!_enabled) return;
    try {
      const c   = _actx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delayS);
      g.gain.setValueAtTime(vol, c.currentTime + delayS);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delayS + dur);
      osc.start(c.currentTime + delayS);
      osc.stop(c.currentTime + delayS + dur + 0.01);
    } catch (_) {}
  }

  // ── Primitive: white noise burst ──
  function _noise(dur, vol = 0.08, delayS = 0) {
    if (!_enabled) return;
    try {
      const c    = _actx();
      const n    = Math.floor(c.sampleRate * dur);
      const buf  = c.createBuffer(1, n, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const g = c.createGain();
      src.connect(g);
      g.connect(c.destination);
      g.gain.setValueAtTime(vol, c.currentTime + delayS);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delayS + dur);
      src.start(c.currentTime + delayS);
      src.stop(c.currentTime + delayS + dur + 0.01);
    } catch (_) {}
  }

  // ── Frequency sweep (portal / power-up sound) ──
  function _sweep(freqFrom, freqTo, dur, type = 'sine', vol = 0.12, delayS = 0) {
    if (!_enabled) return;
    try {
      const c   = _actx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freqFrom, c.currentTime + delayS);
      osc.frequency.exponentialRampToValueAtTime(freqTo, c.currentTime + delayS + dur);
      g.gain.setValueAtTime(vol, c.currentTime + delayS);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delayS + dur);
      osc.start(c.currentTime + delayS);
      osc.stop(c.currentTime + delayS + dur + 0.01);
    } catch (_) {}
  }

  // ── Music building blocks ──
  function _kick(at) {
    try {
      const c   = _actx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, at);
      osc.frequency.exponentialRampToValueAtTime(40, at + 0.12);
      g.gain.setValueAtTime(0.55, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
      osc.start(at);
      osc.stop(at + 0.25);
    } catch (_) {}
  }

  function _snare(at) {
    // Noise + pitched tone = snare character
    try {
      const c    = _actx();
      const n    = Math.floor(c.sampleRate * 0.18);
      const buf  = c.createBuffer(1, n, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const g = c.createGain();
      src.connect(g);
      g.connect(c.destination);
      g.gain.setValueAtTime(0.18, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
      src.start(at);
      src.stop(at + 0.2);
    } catch (_) {}
    _tone(200, 0.06, 'square', 0.04, at - _actx().currentTime);
  }

  function _hat(at) {
    try {
      const c    = _actx();
      const n    = Math.floor(c.sampleRate * 0.05);
      const buf  = c.createBuffer(1, n, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const hpf = c.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 5000;
      const g = c.createGain();
      src.connect(hpf);
      hpf.connect(g);
      g.connect(c.destination);
      g.gain.setValueAtTime(0.10, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
      src.start(at);
      src.stop(at + 0.06);
    } catch (_) {}
  }

  function _bass(freq, at) {
    try {
      const c   = _actx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, at);
      g.gain.setValueAtTime(0.22, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + BEAT_S * 0.85);
      osc.start(at);
      osc.stop(at + BEAT_S * 0.9);
    } catch (_) {}
  }

  function _arp(freq, at) {
    try {
      const c   = _actx();
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, at);
      g.gain.setValueAtTime(0.06, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + BEAT_S * 0.22);
      osc.start(at);
      osc.stop(at + BEAT_S * 0.25);
    } catch (_) {}
  }

  // ── Music scheduler ──
  function _schedule() {
    if (!_musicActive) return;
    const c   = _actx();
    const now = c.currentTime;

    while (true) {
      const beatTime = _startTime + _beatIndex * BEAT_S;
      if (beatTime > now + LOOKAHEAD) break;

      const beatInBar = _beatIndex % 4;

      // Kick on beats 0 and 2
      if (beatInBar === 0 || beatInBar === 2) _kick(beatTime);

      // Snare on beats 1 and 3
      if (beatInBar === 1 || beatInBar === 3) _snare(beatTime);

      // Hi-hat on every 8th note (halfway through each beat)
      _hat(beatTime + BEAT_S * 0.5);

      // Bass line follows BASS_NOTES array
      const bassFreq = BASS_NOTES[_beatIndex % BASS_NOTES.length];
      _bass(bassFreq, beatTime);

      // 16th-note arp at beat + 1/4 and + 3/4
      _arp(bassFreq * 2, beatTime + BEAT_S * 0.25);
      _arp(bassFreq * 3, beatTime + BEAT_S * 0.75);

      _beatIndex++;
    }

    _scheduleId = setTimeout(_schedule, 100);
  }

  // ── Beat window check ──
  // Returns true if audio clock is within ±BEAT_WINDOW_MS of a beat downbeat.
  function checkBeatWindow() {
    if (!_ctx || !_musicActive) return false;
    const elapsed = (_ctx.currentTime - _startTime) * 1000; // ms
    const beatMs  = BEAT_S * 1000;
    const phase   = ((elapsed % beatMs) + beatMs) % beatMs;
    return phase <= CONFIG.BEAT_WINDOW_MS || phase >= beatMs - CONFIG.BEAT_WINDOW_MS;
  }

  // Returns a 0-1 value representing how close we are to the beat peak
  // (1.0 exactly on beat, fading to 0 toward mid-beat).
  // Used by renderer to pulse the background.
  function getBeatIntensity() {
    if (!_ctx || !_musicActive) return 0;
    const elapsed = (_ctx.currentTime - _startTime) * 1000;
    const beatMs  = BEAT_S * 1000;
    const phase   = ((elapsed % beatMs) + beatMs) % beatMs;
    // Fast decay: full at 0ms, zero by 80ms
    const raw     = Math.max(0, 1 - phase / 80);
    return raw;
  }

  // ── Public API ──

  function startMusic() {
    if (!_enabled || _musicActive) return;
    const c      = _actx();
    _musicActive = true;
    _beatIndex   = 0;
    _startTime   = c.currentTime + 0.1; // small startup delay
    _schedule();
  }

  function stopMusic() {
    _musicActive = false;
    if (_scheduleId) { clearTimeout(_scheduleId); _scheduleId = null; }
  }

  function sfxJump() {
    _tone(440, 0.05, 'square', 0.10);
    _tone(660, 0.04, 'square', 0.07, 0.04);
  }

  function sfxDeath() {
    // Descending Windows-error style buzz
    _tone(440, 0.07, 'sawtooth', 0.22);
    _tone(330, 0.07, 'sawtooth', 0.18, 0.07);
    _tone(220, 0.07, 'sawtooth', 0.14, 0.14);
    _tone(110, 0.18, 'sawtooth', 0.20, 0.21);
    _noise(0.12, 0.14, 0.25);
  }

  function sfxPad() {
    _tone(880,  0.05, 'sine', 0.14);
    _tone(1320, 0.08, 'sine', 0.10, 0.04);
    _tone(1760, 0.06, 'sine', 0.07, 0.09);
  }

  function sfxPortal() {
    _sweep(200, 900, 0.28, 'sine', 0.14);
    _sweep(150, 600, 0.28, 'triangle', 0.08, 0.03);
  }

  function sfxRing() {
    // Gravity flip — dissonant whoosh
    _sweep(600, 200, 0.22, 'sawtooth', 0.12);
    _noise(0.08, 0.08);
  }

  function sfxPerfect() {
    // "Perfect Syntax" ascending chord
    [[523, 0], [659, 0.05], [784, 0.10], [1047, 0.15]]
      .forEach(([f, d]) => _tone(f, 0.20, 'sine', 0.12, d));
  }

  function setEnabled(val) {
    _enabled = val;
    if (!val) stopMusic();
  }

  function isEnabled() { return _enabled; }

  return {
    startMusic, stopMusic,
    checkBeatWindow, getBeatIntensity,
    sfxJump, sfxDeath, sfxPad, sfxPortal, sfxRing, sfxPerfect,
    setEnabled, isEnabled,
  };
})();
