'use strict';

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    // Camera shake
    this._shakeTimer = 0;
    this._shakeX     = 0;
    this._shakeY     = 0;

    // Parallax layer offsets
    this._offsets = [0, 0, 0, 0];

    // Pre-build plasma protein positions (randomized once)
    this._plasma = Array.from({ length: PARALLAX.PLASMA_COUNT }, (_, i) => ({
      x: (i / PARALLAX.PLASMA_COUNT) * 2000,
      y: 0.15 + Math.random() * 0.55,
      rx: 28 + Math.random() * 40,
      ry: 14 + Math.random() * 22,
      alpha: 0.06 + Math.random() * 0.10,
    }));

    // RBC positions
    this._rbcs = Array.from({ length: PARALLAX.RBC_COUNT }, (_, i) => ({
      x: (i / PARALLAX.RBC_COUNT) * 1200,
      y: 0.06 + Math.random() * 0.08,
      size: 16 + Math.random() * 12,
    }));
  }

  resize(w, h) {
    this.canvas.width  = w;
    this.canvas.height = h;
  }

  triggerShake() {
    this._shakeTimer = PHYSICS.SHAKE_FRAMES;
  }

  updateParallax(scrollSpeed) {
    for (let i = 0; i < 4; i++) {
      this._offsets[i] = (this._offsets[i] + scrollSpeed * PARALLAX.SPEEDS[i]);
    }
  }

  draw(state, player, chunks, particles, score, hiScore, muteActive) {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const groundY = H * PHYSICS.GROUND_Y_RATIO;

    // Camera shake update
    if (this._shakeTimer > 0) {
      this._shakeTimer--;
      const amp = PHYSICS.SHAKE_AMPLITUDE * (this._shakeTimer / PHYSICS.SHAKE_FRAMES);
      this._shakeX = (Math.random() - 0.5) * 2 * amp;
      this._shakeY = (Math.random() - 0.5) * 2 * amp;
    } else {
      this._shakeX = 0;
      this._shakeY = 0;
    }

    ctx.save();
    ctx.translate(this._shakeX, this._shakeY);

    // 1. Background fill
    ctx.fillStyle = PALETTE.BG;
    ctx.fillRect(0, 0, W, H);

    // 2. Layer 0 — Arterial wall bands (pulsing at top/bottom)
    this._drawArterialWalls(W, H);

    // 3. Layer 1 — Plasma proteins (drifting ellipses)
    this._drawPlasmaLayer(W, H);

    // 4. Layer 2 — Ground stripe
    this._drawGround(W, H, groundY);

    // 5. Hazards (drawn below player)
    this._drawHazards(chunks, W, H, groundY);

    // 6. Player (Macrophage)
    if (player.alive || state === STATE.DEAD) {
      this._drawPlayer(player);
    }

    // 7. Particles
    particles.draw(ctx);

    // 8. Layer 3 — Foreground RBCs
    this._drawRBCLayer(W, H);

    // 9. HUD
    this._drawHUD(ctx, W, H, state, score, hiScore, muteActive);

    ctx.restore();
  }

  // ─── Private draw helpers ───────────────────────────────────────────────

  _drawArterialWalls(W, H) {
    const ctx    = this.ctx;
    const off    = this._offsets[0] % W;
    const bandH  = H * PARALLAX.ARTERIAL_BAND;
    const pulse  = Math.sin(Date.now() * 0.0012) * 0.3 + 0.7;

    // Top band
    const topGrad = ctx.createLinearGradient(0, 0, 0, bandH);
    topGrad.addColorStop(0, PALETTE.ARTERIAL_BRIGHT);
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.globalAlpha = pulse * 0.9;
    ctx.fillRect(0, 0, W, bandH);

    // Bottom band
    const btY = H * (1 - PARALLAX.ARTERIAL_BAND);
    const btGrad = ctx.createLinearGradient(0, H, 0, btY);
    btGrad.addColorStop(0, PALETTE.ARTERIAL_BRIGHT);
    btGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = btGrad;
    ctx.fillRect(0, btY, W, H - btY);
    ctx.globalAlpha = 1;

    // Scrolling vessel wall texture lines
    ctx.strokeStyle = PALETTE.ARTERIAL;
    ctx.lineWidth   = 1;
    ctx.globalAlpha = 0.35;
    for (let x = -off % 80; x < W + 80; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 20, bandH * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(x + 20, H - bandH * 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  _drawPlasmaLayer(W, H) {
    const ctx = this.ctx;
    const off = this._offsets[1];
    for (const p of this._plasma) {
      const px = ((p.x - off % 2000) + 2000) % 2000 * (W / 1000) - W * 0.2;
      const py = p.y * H;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.ellipse(px, py, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.PLASMA;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawGround(W, H, groundY) {
    const ctx = this.ctx;

    // Ground gradient stripe
    const grad = ctx.createLinearGradient(0, groundY - 4, 0, groundY + 16);
    grad.addColorStop(0, PALETTE.GROUND_TOP);
    grad.addColorStop(1, PALETTE.GROUND_MID);
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY - 4, W, H - groundY + 4);

    // Top glow line
    ctx.strokeStyle = PALETTE.GROUND_LINE;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY - 4);
    ctx.lineTo(W, groundY - 4);
    ctx.stroke();

    // Scrolling tick marks (vascular texture)
    const off = this._offsets[2] % 40;
    ctx.strokeStyle = 'rgba(180,60,80,0.20)';
    ctx.lineWidth   = 1;
    for (let x = -off; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + 6, groundY + 8);
      ctx.stroke();
    }
  }

  _drawHazards(chunks, W, H, groundY) {
    const ctx = this.ctx;

    for (const h of chunks.allHazards) {
      if (h instanceof ViralCluster) {
        this._drawViral(h, groundY);
      } else if (h instanceof CholesterolPlaque) {
        this._drawPlaque(h);
      } else if (h instanceof FreeRadical) {
        this._drawFreeRadical(h);
      }
    }

    // Gaps: punch hole in ground by overdrawing with bg color
    for (const g of chunks.allGaps) {
      ctx.fillStyle = PALETTE.GAP;
      ctx.fillRect(g.x, groundY - 4, g.w, H - groundY + 4);
    }
  }

  _drawViral(h, groundY) {
    const ctx = this.ctx;
    const cx  = h.x + h.w / 2;
    const cy  = h.y + h.h / 2;
    const r   = h.w * 0.38;
    const n   = HAZARDS.VIRAL_SPIKE_COUNT;
    const spikeLen = h.h * 0.44;
    const phase = h._phase;

    // Glow behind — larger translucent circle (no shadowBlur)
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.VIRAL_GLOW;
    ctx.fill();

    // Spikes
    ctx.strokeStyle = PALETTE.VIRAL;
    ctx.lineWidth   = 2;
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + phase;
      const tipX  = cx + Math.cos(angle) * (r + spikeLen);
      const tipY  = cy + Math.sin(angle) * (r + spikeLen);
      const baseAngle1 = angle + 0.2;
      const baseAngle2 = angle - 0.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(baseAngle1) * r, cy + Math.sin(baseAngle1) * r);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(cx + Math.cos(baseAngle2) * r, cy + Math.sin(baseAngle2) * r);
      ctx.stroke();
    }

    // Core
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.VIRAL;
    ctx.globalAlpha = 0.80;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Advance phase (mutating via spikePhase getter to animate)
    h._phase += 0.03;
  }

  _drawPlaque(h) {
    const ctx = this.ctx;

    // Glow
    ctx.fillStyle = PALETTE.PLAQUE_GLOW;
    ctx.fillRect(h.x - 6, h.y - 6, h.w + 12, h.h + 12);

    // Body gradient
    const grad = ctx.createLinearGradient(h.x, h.y, h.x + h.w, h.y);
    grad.addColorStop(0, '#8a6e00');
    grad.addColorStop(0.5, PALETTE.PLAQUE);
    grad.addColorStop(1, '#8a6e00');
    ctx.fillStyle = grad;
    ctx.fillRect(h.x, h.y, h.w, h.h);

    // Crystalline texture lines
    ctx.strokeStyle = 'rgba(255,230,80,0.30)';
    ctx.lineWidth   = 1;
    for (let y = h.y + 8; y < h.y + h.h; y += 14) {
      ctx.beginPath();
      ctx.moveTo(h.x, y);
      ctx.lineTo(h.x + h.w, y + 6);
      ctx.stroke();
    }
  }

  _drawFreeRadical(h) {
    const ctx  = this.ctx;
    const cx   = h.x;
    const cy   = h.y;
    const r    = h.r;
    const arms = 6;
    const phase = h._phase;

    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, r + 7, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.FREE_RAD_GLOW;
    ctx.fill();

    // Jagged arms
    ctx.strokeStyle = PALETTE.FREE_RAD;
    ctx.lineWidth   = 1.5;
    for (let i = 0; i < arms; i++) {
      const a   = (i / arms) * Math.PI * 2 + phase;
      const mid = a + (Math.PI / arms) * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(mid) * r * 0.5,
        cy + Math.sin(mid) * r * 0.5
      );
      ctx.lineTo(
        cx + Math.cos(a) * r * 1.3,
        cy + Math.sin(a) * r * 1.3
      );
      ctx.stroke();
    }

    // Core
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.FREE_RAD;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  _drawPlayer(player) {
    const ctx = this.ctx;
    const cx  = player.x;
    const cy  = player.y;
    const r   = player.radius;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(player.scaleX, player.scaleY);

    // Outer glow ring (no shadowBlur — shape-behind technique)
    ctx.beginPath();
    ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.PLAYER_GLOW;
    ctx.fill();

    // Main cell body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.PLAYER;

    // Single shadowBlur on the player only (acceptable perf cost)
    ctx.shadowColor = PALETTE.PLAYER_GLOW;
    ctx.shadowBlur  = 16;
    ctx.fill();
    ctx.shadowBlur  = 0;

    // Nucleus (inner darker circle)
    ctx.beginPath();
    ctx.arc(-3, -4, r * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.PLAYER_NUCLEUS;
    ctx.fill();

    // Pseudopod "arms" (3 small bumps suggesting movement)
    ctx.fillStyle = 'rgba(200,240,255,0.35)';
    const arms = [
      { a: -0.5, scale: 0.32 },
      { a:  0.8, scale: 0.26 },
      { a: -1.8, scale: 0.28 },
    ];
    for (const arm of arms) {
      ctx.beginPath();
      ctx.arc(
        Math.cos(arm.a) * r * 0.75,
        Math.sin(arm.a) * r * 0.75,
        r * arm.scale,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  _drawHUD(ctx, W, H, state, score, hiScore, muteActive) {
    // ATP score
    ctx.font      = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.ATP_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText(`ATP  ${score}`, 16, 30);

    ctx.font      = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.HUD_DIM;
    ctx.fillText(`BEST ${hiScore}`, 16, 50);

    // Mute toggle (top-right)
    ctx.font      = '13px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = muteActive ? 'rgba(255,100,80,0.7)' : PALETTE.HUD_DIM;
    ctx.fillText(muteActive ? '[MUTE] M' : '[SFX]  M', W - 16, 30);
    ctx.textAlign = 'left';

    if (state === STATE.MENU) {
      this._drawMenuOverlay(ctx, W, H);
    } else if (state === STATE.DEAD) {
      this._drawDeathOverlay(ctx, W, H, score, hiScore);
    }
  }

  _drawMenuOverlay(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    // Title
    ctx.font      = 'bold 32px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.MENU_TEXT;
    ctx.fillText('SPIKE JUMPER', W / 2, H / 2 - 60);

    ctx.font      = '13px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.MENU_DIM;
    ctx.fillText('Macrophage Mayhem — Defend the circulatory system', W / 2, H / 2 - 28);

    // Prompt
    ctx.font      = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.ATP_TEXT;
    const blink   = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) ctx.fillText('[ SPACE ] to begin', W / 2, H / 2 + 20);

    // Controls hint
    ctx.font      = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.MENU_DIM;
    ctx.fillText('Tap SPACE = short hop   |   Hold SPACE = high jump', W / 2, H / 2 + 55);

    ctx.textAlign = 'left';
  }

  _drawDeathOverlay(ctx, W, H, score, hiScore) {
    ctx.fillStyle = PALETTE.DEATH_OVERLAY;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    ctx.font      = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.DEATH_TEXT;
    ctx.fillText('Membrane Compromised.', W / 2, H / 2 - 44);

    ctx.font      = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.MENU_TEXT;
    ctx.fillText(`ATP Collected: ${score}`, W / 2, H / 2 - 8);

    ctx.fillStyle = PALETTE.HUD_DIM;
    ctx.fillText(`Best ATP: ${hiScore}`, W / 2, H / 2 + 16);

    ctx.font      = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.ATP_TEXT;
    const blink   = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) ctx.fillText('[ SPACE ] to restart', W / 2, H / 2 + 52);

    ctx.textAlign = 'left';
  }
}
