'use strict';

const SoundFX = (() => {
  let _actx    = null;
  let _enabled = true;
  let _bgTimer = null;
  let _beat    = 0;

  function _ctx() {
    if (!_actx) {
      _actx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_actx.state === 'suspended') _actx.resume();
    return _actx;
  }

  function _tone(freq, dur, type, vol) {
    const c   = _ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type      = type || 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  }

  function _sweep(f0, f1, dur, type, vol) {
    const c   = _ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(f0, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  }

  function _noise(dur, vol) {
    const c      = _ctx();
    const size   = Math.ceil(c.sampleRate * dur);
    const buffer = c.createBuffer(1, size, c.sampleRate);
    const data   = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const src  = c.createBufferSource();
    const gain = c.createGain();
    src.buffer = buffer;
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(gain);
    gain.connect(c.destination);
    src.start(c.currentTime);
  }

  function jump() {
    if (!_enabled) return;
    _sweep(AUDIO_CFG.JUMP_F0, AUDIO_CFG.JUMP_F1, AUDIO_CFG.JUMP_DUR, 'sine', AUDIO_CFG.VOL_JUMP);
    _noise(0.04, 0.03);
  }

  function land() {
    if (!_enabled) return;
    _tone(AUDIO_CFG.LAND_FREQ, AUDIO_CFG.LAND_DUR, 'triangle', AUDIO_CFG.VOL_LAND);
    _noise(0.05, 0.08);
  }

  function death() {
    if (!_enabled) return;
    _sweep(AUDIO_CFG.DEATH_F0, AUDIO_CFG.DEATH_F1, AUDIO_CFG.DEATH_DUR, 'sawtooth', AUDIO_CFG.VOL_DEATH);
    _noise(0.3, 0.16);
  }

  function _scheduleBeat() {
    if (!_enabled) return;
    // Kick on beats 0 and 2 of a 4-beat bar
    if (_beat % 2 === 0) {
      _sweep(AUDIO_CFG.BG_KICK_F, 35, 0.20, 'sine', AUDIO_CFG.VOL_KICK);
      _noise(0.04, 0.06);
    }
    // Hi-hat every beat
    _noise(0.03, AUDIO_CFG.VOL_HIHAT);
    // Bass on beat 0 of every bar
    if (_beat % 4 === 0) {
      _tone(AUDIO_CFG.BG_BASS_F, 0.42, 'sine', AUDIO_CFG.VOL_BASS);
    }
    _beat++;
  }

  function startBgTrack() {
    if (!_enabled || _bgTimer) return;
    _beat    = 0;
    _bgTimer = setInterval(_scheduleBeat, AUDIO_CFG.BEAT_MS);
    _scheduleBeat(); // fire immediately on start
  }

  function stopBgTrack() {
    if (_bgTimer) {
      clearInterval(_bgTimer);
      _bgTimer = null;
    }
  }

  function setEnabled(val) {
    _enabled = val;
    if (!val) stopBgTrack();
  }

  function isEnabled() { return _enabled; }

  return { jump, land, death, startBgTrack, stopBgTrack, setEnabled, isEnabled };
})();
