/* ============================================
   Readable Quest - Ultra Edition
   WCAG Accessibility Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── State ──
  const state = {
    bg: { r: 255, g: 255, b: 0 },
    text: { r: 0, g: 0, b: 0 },
    fontSize: 16,
    vision: 'normal'
  };

  // ── Presets ──
  const PRESETS = {
    'high-contrast': { bg: { r: 0, g: 0, b: 0 }, text: { r: 255, g: 255, b: 255 } },
    'solarized':     { bg: { r: 0, g: 43, b: 54 }, text: { r: 131, g: 148, b: 150 } },
    'dracula':       { bg: { r: 40, g: 42, b: 54 }, text: { r: 248, g: 248, b: 242 } },
    'fail':          { bg: { r: 200, g: 200, b: 200 }, text: { r: 170, g: 170, b: 170 } }
  };

  // ── DOM References ──
  const els = {
    bgSwatches:  document.getElementById('bg-swatch'),
    bgHex:       document.getElementById('bg-hex'),
    textSwatch:  document.getElementById('text-swatch'),
    textHex:     document.getElementById('text-hex'),
    previewBox:  document.getElementById('preview-box'),
    contrastRatio: document.getElementById('contrast-ratio'),
    lumBg:       document.getElementById('lum-bg'),
    lumText:     document.getElementById('lum-text'),
    badgeAA:     document.getElementById('badge-aa-normal'),
    badgeAAA:    document.getElementById('badge-aaa-normal'),
    badgeAALg:   document.getElementById('badge-aa-large'),
    fontHint:    document.getElementById('font-hint'),
    simNote:     document.getElementById('sim-note'),
    previewContainer: document.getElementById('preview-container'),
    sidebar:     document.getElementById('sidebar')
  };

  // Slider/number pairs
  const channels = ['r', 'g', 'b'];
  const colorGroups = ['bg', 'text'];

  // ── sRGB to Linear ──
  function sRGBtoLinear(c) {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  // ── Relative Luminance (WCAG 2.1) ──
  function relativeLuminance(r, g, b) {
    return 0.2126 * sRGBtoLinear(r) +
           0.7152 * sRGBtoLinear(g) +
           0.0722 * sRGBtoLinear(b);
  }

  // ── Contrast Ratio ──
  function contrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker  = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // ── RGB to Hex ──
  function toHex(r, g, b) {
    return '#' + [r, g, b].map(c =>
      Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')
    ).join('').toUpperCase();
  }

  // ── Clamp helper ──
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, Math.round(v)));
  }

  // ── Sync slider ↔ number input ──
  function bindSliderPair(sliderId, numId, group, channel) {
    const slider = document.getElementById(sliderId);
    const num    = document.getElementById(numId);

    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      num.value = val;
      state[group][channel] = val;
      render();
    });

    num.addEventListener('input', () => {
      let val = parseInt(num.value, 10);
      if (isNaN(val)) return;
      val = clamp(val, 0, 255);
      slider.value = val;
      state[group][channel] = val;
      render();
    });

    num.addEventListener('blur', () => {
      let val = parseInt(num.value, 10);
      if (isNaN(val)) val = 0;
      val = clamp(val, 0, 255);
      num.value = val;
      slider.value = val;
      state[group][channel] = val;
      render();
    });
  }

  // ── Font size slider ↔ number ──
  function bindFontControls() {
    const slider = document.getElementById('font-slider');
    const num    = document.getElementById('font-num');

    slider.addEventListener('input', () => {
      state.fontSize = parseInt(slider.value, 10);
      num.value = state.fontSize;
      render();
    });

    num.addEventListener('input', () => {
      let val = parseInt(num.value, 10);
      if (isNaN(val)) return;
      val = clamp(val, 12, 72);
      state.fontSize = val;
      slider.value = val;
      render();
    });

    num.addEventListener('blur', () => {
      let val = parseInt(num.value, 10);
      if (isNaN(val)) val = 16;
      val = clamp(val, 12, 72);
      num.value = val;
      slider.value = val;
      state.fontSize = val;
      render();
    });
  }

  // ── Preset buttons ──
  function bindPresets() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = PRESETS[btn.dataset.preset];
        if (!preset) return;

        // Reset vision to normal when applying preset
        if (state.vision !== 'normal') {
          state.vision = 'normal';
          document.querySelector('input[name="vision"][value="normal"]').checked = true;
          applyVisionFilter('normal');
        }

        state.bg   = { ...preset.bg };
        state.text = { ...preset.text };
        syncInputsFromState();
        render();
      });
    });
  }

  // ── Vision simulation radio buttons ──
  function bindVisionRadios() {
    document.querySelectorAll('input[name="vision"]').forEach(radio => {
      radio.addEventListener('change', () => {
        state.vision = radio.value;
        applyVisionFilter(state.vision);
        render();
      });
    });
  }

  // ── Apply SVG filter to preview ──
  function applyVisionFilter(mode) {
    const container = els.previewContainer;
    const sidebar = els.sidebar;

    if (mode === 'normal') {
      container.style.filter = '';
      sidebar.classList.remove('inputs-locked');
      els.simNote.textContent = '';
    } else {
      container.style.filter = `url(#${mode})`;
      sidebar.classList.add('inputs-locked');
      els.simNote.textContent = 'Color inputs locked during simulation';
    }
  }

  // ── Push state values back to all sliders/inputs ──
  function syncInputsFromState() {
    colorGroups.forEach(group => {
      channels.forEach(ch => {
        const slider = document.getElementById(`${group}-${ch}-slider`);
        const num    = document.getElementById(`${group}-${ch}-num`);
        slider.value = state[group][ch];
        num.value    = state[group][ch];
      });
    });
  }

  // ── Main render ──
  function render() {
    const { bg, text, fontSize } = state;

    // Update swatches and hex displays
    const bgColor   = toHex(bg.r, bg.g, bg.b);
    const textColor = toHex(text.r, text.g, text.b);

    els.bgSwatches.style.backgroundColor = bgColor;
    els.bgHex.textContent = bgColor;
    els.textSwatch.style.backgroundColor = textColor;
    els.textHex.textContent = textColor;

    // Update preview
    els.previewBox.style.backgroundColor = bgColor;
    els.previewBox.style.color = textColor;
    els.previewBox.style.fontSize = (fontSize / 16) + 'rem';

    // Luminance calculations
    const lumBg   = relativeLuminance(bg.r, bg.g, bg.b);
    const lumText = relativeLuminance(text.r, text.g, text.b);
    const ratio   = contrastRatio(lumBg, lumText);

    // Display metrics
    els.contrastRatio.textContent = ratio.toFixed(2) + ':1';
    els.lumBg.textContent   = lumBg.toFixed(4);
    els.lumText.textContent = lumText.toFixed(4);

    // Color the ratio based on quality
    if (ratio >= 7) {
      els.contrastRatio.style.color = 'var(--pass)';
    } else if (ratio >= 4.5) {
      els.contrastRatio.style.color = '#ffd600';
    } else {
      els.contrastRatio.style.color = 'var(--fail)';
    }

    // WCAG badges
    updateBadge(els.badgeAA,    ratio >= 4.5);
    updateBadge(els.badgeAAA,   ratio >= 7.0);
    updateBadge(els.badgeAALg,  ratio >= 3.0);

    // Font hint
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && true); // 18.66px bold ≈ 14pt bold
    els.fontHint.innerHTML = `${fontSize}px &mdash; ${isLarge ? 'Large' : 'Normal'} Text`;
  }

  // ── Update badge pass/fail ──
  function updateBadge(el, passes) {
    el.classList.toggle('pass', passes);
    el.classList.toggle('fail', !passes);
  }

  // ── Initialize ──
  function init() {
    // Bind all slider/number pairs
    colorGroups.forEach(group => {
      channels.forEach(ch => {
        bindSliderPair(`${group}-${ch}-slider`, `${group}-${ch}-num`, group, ch);
      });
    });

    bindFontControls();
    bindPresets();
    bindVisionRadios();

    // Initial render
    render();
  }

  init();
});
