/* ============================================
   Bioluminescent Neural-Link Studio
   Core Engine: Particles, Color Math, Harmonies
   ============================================ */

// ─── State ───
const state = {
    r: 128,
    g: 64,
    b: 200,
    particles: [],
    ripples: [],
    time: 0,
    canvas: null,
    ctx: null,
    mapCanvas: null,
    mapCtx: null,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    coreRadius: 60
};

// ─── Color Math ───
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
}

function getHarmonyColors(h, s, l) {
    const wrap = angle => ((angle % 360) + 360) % 360;
    return {
        complementary: [{ h: wrap(h + 180), s, l }],
        analogous: [{ h: wrap(h - 30), s, l }, { h: wrap(h + 30), s, l }],
        triadic: [{ h: wrap(h + 120), s, l }, { h: wrap(h + 240), s, l }],
        split: [{ h: wrap(h + 150), s, l }, { h: wrap(h + 210), s, l }]
    };
}

function relativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(r1, g1, b1, r2, g2, b2) {
    const l1 = relativeLuminance(r1, g1, b1);
    const l2 = relativeLuminance(r2, g2, b2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(1);
}

// ─── Signal Analysis (Mental Model) ───
function analyzeSignal(r, g, b) {
    const channels = [
        { name: 'RED', value: r },
        { name: 'GREEN', value: g },
        { name: 'BLUE', value: b }
    ];
    channels.sort((a, b) => b.value - a.value);

    const top2 = channels.slice(0, 2).map(c => c.name).join(' + ');
    const booster = channels[2].name;
    const hsl = rgbToHsl(r, g, b);

    return {
        dominantHue: top2,
        lumBooster: `${booster} (${channels[2].value})`,
        saturation: `${hsl.s}%`
    };
}

// ─── Particle System ───
class Particle {
    constructor(emitterAngle, color, speed, coreRadius) {
        const dist = Math.max(state.width, state.height) * 0.35;
        const angleSpread = (Math.random() - 0.5) * 0.6;
        const angle = emitterAngle + angleSpread;

        this.x = state.centerX + Math.cos(angle) * dist;
        this.y = state.centerY + Math.sin(angle) * dist;
        this.color = color;
        this.size = 1.5 + Math.random() * 2.5;
        this.opacity = 0.4 + Math.random() * 0.6;
        this.life = 1.0;

        const baseSpeed = 1.5 + speed * 0.015;
        const dx = state.centerX - this.x;
        const dy = state.centerY - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / d) * baseSpeed + (Math.random() - 0.5) * 0.5;
        this.vy = (dy / d) * baseSpeed + (Math.random() - 0.5) * 0.5;

        this.coreRadius = coreRadius;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        const dx = state.centerX - this.x;
        const dy = state.centerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Accelerate toward core
        if (dist > 10) {
            this.vx += (dx / dist) * 0.08;
            this.vy += (dy / dist) * 0.08;
        }

        // Fade as approaching core
        if (dist < this.coreRadius * 2) {
            this.life -= 0.02;
            this.opacity *= 0.97;
        }

        // Hit core → spawn ripple
        if (dist < this.coreRadius * 0.5) {
            this.life = 0;
            state.ripples.push(new Ripple(this.x, this.y, this.color));
        }

        return this.life > 0 && this.opacity > 0.01;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('1)', `${this.opacity * this.life})`);
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('1)', `${this.opacity * this.life * 0.15})`);
        ctx.fill();
    }
}

class Ripple {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 5;
        this.maxRadius = 30 + Math.random() * 20;
        this.opacity = 0.5;
    }

    update() {
        this.radius += 1.2;
        this.opacity *= 0.94;
        return this.opacity > 0.01 && this.radius < this.maxRadius;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color.replace('1)', `${this.opacity})`);
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function spawnParticles() {
    const emitters = [
        { angle: -Math.PI / 2 - 0.3, color: `rgba(255, 51, 85, 1)`, value: state.r },   // Red: top-left
        { angle: -Math.PI / 2 + 0.3, color: `rgba(51, 255, 136, 1)`, value: state.g },  // Green: top-right
        { angle: Math.PI / 2, color: `rgba(51, 136, 255, 1)`, value: state.b }           // Blue: bottom
    ];

    for (const em of emitters) {
        const rate = em.value / 255;
        const count = Math.floor(rate * 3);
        for (let i = 0; i < count; i++) {
            if (state.particles.length < 500) {
                state.particles.push(new Particle(em.angle, em.color, em.value, state.coreRadius));
            }
        }
    }
}

// ─── Synapse Core Renderer ───
function drawCore(ctx) {
    const { centerX: cx, centerY: cy, r, g, b, time, coreRadius } = state;
    const breathe = Math.sin(time * 0.02) * 0.15 + 1;
    const radius = coreRadius * breathe;

    // Outer glow layers
    for (let i = 4; i >= 0; i--) {
        const glowR = radius + i * 25;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        const alpha = 0.04 * (5 - i);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    // Core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    coreGrad.addColorStop(0, `rgba(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)}, 0.95)`);
    coreGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.8)`);
    coreGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Inner bright spot
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.3);
    innerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.3 + Math.sin(time * 0.03) * 0.1})`);
    innerGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();
}

// ─── Background Grid ───
function drawBackground(ctx) {
    const { width, height, time } = state;

    // Subtle neural grid
    ctx.strokeStyle = `rgba(0, 212, 255, 0.02)`;
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Floating ambient particles
    for (let i = 0; i < 20; i++) {
        const px = ((i * 137.5 + time * 0.1) % width);
        const py = ((i * 213.7 + time * 0.07) % height);
        const alpha = 0.03 + Math.sin(time * 0.01 + i) * 0.02;
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.fill();
    }
}

// ─── Neural Map (Color Wheel) ───
function drawNeuralMap() {
    const { mapCtx: ctx, mapCanvas: canvas, r, g, b } = state;
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 12;

    ctx.clearRect(0, 0, w, h);

    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
        const startAngle = (angle - 1) * Math.PI / 180;
        const endAngle = (angle + 1) * Math.PI / 180;
        const rgb = hslToRgb(angle, 80, 50);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fill();
    }

    // Center dark circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 12, 20, 0.95)';
    ctx.fill();

    // Current color dot at center
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw harmony markers
    const hsl = rgbToHsl(r, g, b);
    const harmonies = getHarmonyColors(hsl.h, hsl.s, hsl.l);
    const markerRadius = radius * 0.77;

    // Base color marker
    drawMarker(ctx, cx, cy, hsl.h, markerRadius, `rgb(${r}, ${g}, ${b})`, 6);

    // Harmony markers
    const colors = {
        complementary: '#ff3355',
        analogous: '#33ff88',
        triadic: '#3388ff',
        split: '#ffaa33'
    };

    for (const [type, hslColors] of Object.entries(harmonies)) {
        for (const c of hslColors) {
            const rgb = hslToRgb(c.h, c.s, c.l);
            drawMarker(ctx, cx, cy, c.h, markerRadius, colors[type], 4);

            // Line from center to marker
            const rad = (c.h - 90) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(rad) * markerRadius, cy + Math.sin(rad) * markerRadius);
            ctx.strokeStyle = `${colors[type]}44`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

function drawMarker(ctx, cx, cy, hue, radius, color, size) {
    const rad = (hue - 90) * Math.PI / 180;
    const x = cx + Math.cos(rad) * radius;
    const y = cy + Math.sin(rad) * radius;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ─── Harmony Swatches ───
function updateHarmonies() {
    const hsl = rgbToHsl(state.r, state.g, state.b);
    const harmonies = getHarmonyColors(hsl.h, hsl.s, hsl.l);

    renderHarmonyRow('harmony-complementary', [
        { h: hsl.h, s: hsl.s, l: hsl.l },
        ...harmonies.complementary
    ]);
    renderHarmonyRow('harmony-analogous', [
        { h: hsl.h, s: hsl.s, l: hsl.l },
        ...harmonies.analogous
    ]);
    renderHarmonyRow('harmony-triadic', [
        { h: hsl.h, s: hsl.s, l: hsl.l },
        ...harmonies.triadic
    ]);
    renderHarmonyRow('harmony-split', [
        { h: hsl.h, s: hsl.s, l: hsl.l },
        ...harmonies.split
    ]);
}

function renderHarmonyRow(containerId, hslColors) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (const c of hslColors) {
        const rgb = hslToRgb(c.h, c.s, c.l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const ratio = contrastRatio(rgb.r, rgb.g, rgb.b, 5, 5, 5);

        const swatch = document.createElement('div');
        swatch.className = 'harmony-swatch';
        swatch.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        swatch.style.setProperty('--swatch-r', rgb.r);
        swatch.style.setProperty('--swatch-g', rgb.g);
        swatch.style.setProperty('--swatch-b', rgb.b);

        swatch.innerHTML = `
            <span class="contrast-tooltip">${ratio}:1</span>
            <span class="swatch-hex">${hex}</span>
        `;

        // Click to copy
        swatch.addEventListener('click', () => {
            copyToClipboard(hex);
        });

        // Right-click to inject into sliders
        swatch.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            injectColor(rgb.r, rgb.g, rgb.b);
        });

        container.appendChild(swatch);
    }
}

// ─── Inject Color (from swatch into sliders) ───
function injectColor(r, g, b) {
    state.r = r;
    state.g = g;
    state.b = b;
    document.getElementById('slider-r').value = r;
    document.getElementById('slider-g').value = g;
    document.getElementById('slider-b').value = b;
    updateUI();
}

// ─── Clipboard ───
function copyToClipboard(hex) {
    navigator.clipboard.writeText(hex).then(() => {
        showToast();
    });
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
}

// ─── UI Updates ───
function updateUI() {
    const { r, g, b } = state;

    // Slider values
    document.getElementById('r-value').textContent = r;
    document.getElementById('g-value').textContent = g;
    document.getElementById('b-value').textContent = b;

    // Fill bars
    document.getElementById('bar-r').style.width = `${(r / 255) * 100}%`;
    document.getElementById('bar-g').style.width = `${(g / 255) * 100}%`;
    document.getElementById('bar-b').style.width = `${(b / 255) * 100}%`;

    // HUD readouts
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    document.getElementById('hex-value').textContent = hex;
    document.getElementById('rgb-value').textContent = `${r}, ${g}, ${b}`;
    document.getElementById('hsl-value').textContent = `${hsl.h}\u00B0, ${hsl.s}%, ${hsl.l}%`;

    // Signal analysis
    const signal = analyzeSignal(r, g, b);
    document.getElementById('dominant-hue').textContent = signal.dominantHue;
    document.getElementById('lum-booster').textContent = signal.lumBooster;
    document.getElementById('sat-level').textContent = signal.saturation;

    // Preview swatch
    document.getElementById('main-swatch').style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    // Harmonies + Map
    updateHarmonies();
    drawNeuralMap();
}

// ─── Main Animation Loop ───
function animate() {
    const { ctx, width, height } = state;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Background
    drawBackground(ctx);

    // Spawn new particles
    spawnParticles();

    // Update & draw particles
    state.particles = state.particles.filter(p => p.update());
    for (const p of state.particles) p.draw(ctx);

    // Update & draw ripples
    state.ripples = state.ripples.filter(r => r.update());
    for (const r of state.ripples) r.draw(ctx);

    // Draw synapse core
    drawCore(ctx);

    state.time++;
    requestAnimationFrame(animate);
}

// ─── Resize ───
function resize() {
    const canvas = state.canvas;
    const dpr = window.devicePixelRatio || 1;
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = state.width * dpr;
    canvas.height = state.height * dpr;
    canvas.style.width = state.width + 'px';
    canvas.style.height = state.height + 'px';
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.centerX = state.width / 2;
    state.centerY = state.height / 2;
    state.coreRadius = Math.min(state.width, state.height) * 0.08;
}

// ─── Init ───
function init() {
    state.canvas = document.getElementById('synapse-canvas');
    state.ctx = state.canvas.getContext('2d');
    state.mapCanvas = document.getElementById('neural-map');
    state.mapCtx = state.mapCanvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Slider events
    const sliders = {
        'slider-r': 'r',
        'slider-g': 'g',
        'slider-b': 'b'
    };

    for (const [id, key] of Object.entries(sliders)) {
        document.getElementById(id).addEventListener('input', (e) => {
            state[key] = parseInt(e.target.value);
            updateUI();
        });
    }

    // Copy main hex
    document.getElementById('copy-main').addEventListener('click', () => {
        copyToClipboard(rgbToHex(state.r, state.g, state.b));
    });

    // Initial UI
    updateUI();
    animate();
}

document.addEventListener('DOMContentLoaded', init);
