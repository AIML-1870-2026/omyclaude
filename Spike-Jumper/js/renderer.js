// js/renderer.js — Canvas rendering pipeline for Syntax Error

class Renderer {

  constructor(canvas) {
    this.canvas       = canvas;
    this.ctx          = canvas.getContext('2d');
    canvas.width      = CONFIG.CANVAS_WIDTH;
    canvas.height     = CONFIG.CANVAS_HEIGHT;

    this._shakeFrames = 0;
    this._beatFlash   = 0;   // 0-1 intensity, decays per frame

    // Pre-computed parallax code strings (static, loop)
    this._terminalLines = [
      'npm install spaghetti-code@1.0.0',
      '> postinstall: node inject-bugs.js',
      '⚠  deprecated: logic@0.0.1 (see: void)',
      'added 1337 packages in 0.0ms',
      '> undefined is not a function',
      'npm WARN peer dep: react@∞ requires react',
      'npm ERR! code ELIFECYCLE',
      'npm ERR! errno 1',
      '> starting... ████████░░░░ 66%',
      'SyntaxError: Unexpected token \';\'',
    ];
    this._commentLines = [
      '// TODO: fix this later',
      '// FIXME: should never reach here',
      '/* @deprecated — do not use */',
      '// if it works don\'t touch it',
      '# This was working last week',
      '// God help anyone who reads this',
      '/* legacy code — here be dragons */',
    ];
    this._pyLines = [
      'def undefined(): pass',
      'x = x if x else x',
      'import * as chaos',
      'for i in range(∞):',
      'print("hello,", world)',
      'TypeError: NoneType',
      'except: pass',
    ];
  }

  // ── Main draw call — called every frame ────────────────────
  draw(game) {
    const ctx = this.ctx;
    ctx.save();

    // Camera shake
    if (this._shakeFrames > 0) {
      const sx = (Math.random() - 0.5) * CONFIG.SHAKE_INTENSITY;
      const sy = (Math.random() - 0.5) * CONFIG.SHAKE_INTENSITY;
      ctx.translate(sx, sy);
      this._shakeFrames--;
    }

    const scroll = game.world.scrollX;

    // ── Draw order (back → front) ──
    this._drawBG(ctx);
    this._drawTerminal(ctx, scroll);
    this._drawWireframeGrid(ctx, scroll);
    this._drawCommentedCode(ctx, scroll);
    this._drawGround(ctx);
    this._drawEntities(ctx, game.world);
    this._drawGhost(ctx, game.ghostPlayer);
    this._drawTrail(ctx, game.player);
    this._drawPlayer(ctx, game.player);
    this._drawFGCode(ctx, scroll);

    // Beat flash overlay
    if (this._beatFlash > 0.01) {
      ctx.fillStyle = `rgba(100,220,120,${this._beatFlash * 0.07})`;
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
      this._beatFlash *= 0.78;
    }

    ctx.restore();
  }

  // ── Layer 1: solid background ────────────────────────────
  _drawBG(ctx) {
    ctx.fillStyle = CONFIG.COLOR_BG;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  }

  // ── Layer 2: slow-scrolling terminal (0.2x parallax) ────
  _drawTerminal(ctx, scroll) {
    ctx.save();
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = CONFIG.TERMINAL_COLOR;

    const speed = 0.2;
    const linesPerColumn = this._terminalLines.length;
    const lineH = 48;

    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < linesPerColumn; row++) {
        const baseX = col * 280 - (scroll * speed % 280) - 140;
        const baseY = 40 + row * lineH;
        if (baseY > CONFIG.CANVAS_HEIGHT + lineH) continue;
        ctx.fillText(
          this._terminalLines[(row + col * 3) % linesPerColumn],
          baseX, baseY
        );
      }
    }
    ctx.restore();
  }

  // ── Layer 3: CSS wireframe grid (0.5x parallax) ─────────
  _drawWireframeGrid(ctx, scroll) {
    ctx.save();
    ctx.strokeStyle = CONFIG.GRID_COLOR;
    ctx.lineWidth   = 1;

    const gx  = CONFIG.WORLD_TILE;
    const off = (scroll * 0.5) % gx;

    // Vertical lines
    for (let x = -off; x < CONFIG.CANVAS_WIDTH; x += gx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CONFIG.GROUND_Y);
      ctx.stroke();
    }
    // Horizontal lines
    const lineCount = Math.ceil(CONFIG.GROUND_Y / gx);
    for (let i = 0; i <= lineCount; i++) {
      const y = i * gx;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Layer 4: commented-out code blocks (0.7x parallax) ──
  _drawCommentedCode(ctx, scroll) {
    ctx.save();
    ctx.font      = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = CONFIG.COLOR_COMMENT;

    const speed = 0.7;
    const count = this._commentLines.length;
    const gap   = 160;

    for (let i = 0; i < count; i++) {
      const rawX = i * gap * 1.7 - scroll * speed;
      const x    = ((rawX % (count * gap * 1.7)) + count * gap * 1.7) % (count * gap * 1.7);
      const y    = 30 + (i % 4) * 60;
      if (x > CONFIG.CANVAS_WIDTH + 200 || x < -300) continue;
      ctx.globalAlpha = 0.25;
      ctx.fillText(this._commentLines[i % count], x, y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── Ground ───────────────────────────────────────────────
  _drawGround(ctx) {
    // Main floor
    ctx.fillStyle = CONFIG.COLOR_GROUND;
    ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_Y);

    // Floor top edge glow
    const grad = ctx.createLinearGradient(0, CONFIG.GROUND_Y - 3, 0, CONFIG.GROUND_Y + 6);
    grad.addColorStop(0, 'rgba(150,200,255,0.15)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, CONFIG.GROUND_Y - 3, CONFIG.CANVAS_WIDTH, 9);
  }

  // ── Entities ─────────────────────────────────────────────
  _drawEntities(ctx, world) {
    const visible = world.getVisible();
    for (const e of visible) {
      const sx = world.screenX(e.worldX);
      const sy = e.worldY;
      switch (e.type) {
        case 'spike':    this._drawSpike(ctx, sx, sy, e.pixW, e.pixH, e.meta); break;
        case 'brace':    this._drawBrace(ctx, sx, sy, e.pixW, e.pixH); break;
        case 'null':     this._drawNull(ctx, sx, sy, e.pixW); break;
        case 'bomb':     this._drawBomb(ctx, sx, sy, e.pixW, e.pixH); break;
        case 'pad':      this._drawPad(ctx, sx, sy); break;
        case 'ring':     this._drawRing(ctx, sx, sy); break;
        case 'portal':   this._drawPortal(ctx, sx, sy, e.meta); break;
      }
    }
  }

  // ── Spike: angled bracket triangle ──────────────────────
  _drawSpike(ctx, sx, sy, pw, ph, meta) {
    const flipped = meta && meta.flipped;
    ctx.save();
    ctx.fillStyle   = CONFIG.COLOR_SPIKE;
    ctx.strokeStyle = 'rgba(244,71,71,0.5)';
    ctx.lineWidth   = 1;
    ctx.shadowColor = CONFIG.COLOR_SPIKE;
    ctx.shadowBlur  = 6;

    ctx.beginPath();
    if (!flipped) {
      // Points up (ground spike)
      ctx.moveTo(sx + pw / 2, sy);          // tip top-center
      ctx.lineTo(sx,          sy + ph);     // base-left
      ctx.lineTo(sx + pw,     sy + ph);     // base-right
    } else {
      // Points down (ceiling spike — worldY already offset from ceiling)
      ctx.moveTo(sx + pw / 2, sy + ph);     // tip bottom-center
      ctx.lineTo(sx,          sy);          // base-left (at ceiling)
      ctx.lineTo(sx + pw,     sy);          // base-right
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ── Brace wall: curly brace character ────────────────────
  _drawBrace(ctx, sx, sy, pw, ph) {
    ctx.save();
    ctx.fillStyle   = 'rgba(45,45,50,0.9)';
    ctx.strokeStyle = CONFIG.COLOR_BRACE;
    ctx.lineWidth   = 2;
    ctx.shadowColor = CONFIG.COLOR_BRACE;
    ctx.shadowBlur  = 6;

    ctx.fillRect(sx, sy, pw, ph);
    ctx.strokeRect(sx, sy, pw, ph);

    // Draw { or } characters filling the block
    ctx.fillStyle  = CONFIG.COLOR_BRACE;
    ctx.font       = `bold ${Math.min(pw, ph) * 0.7}px "JetBrains Mono", monospace`;
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur   = 0;
    const char = pw >= ph ? '{ }' : (pw > 30 ? '{' : '|');
    ctx.fillText(char, sx + pw / 2, sy + ph / 2);
    ctx.restore();
  }

  // ── Null pointer pit ─────────────────────────────────────
  // Drawn AFTER the ground strip so it overwrites it, creating a visual gap.
  // sy should always be CONFIG.GROUND_Y (set by level.js tileToWorld).
  _drawNull(ctx, sx, sy, pw) {
    const depth = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_Y;
    ctx.save();

    // Dark void
    const grad = ctx.createLinearGradient(0, sy, 0, sy + depth);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(1, '#010108');
    ctx.fillStyle = grad;
    ctx.fillRect(sx, sy, pw, depth + 10);

    // Dashed edge lines
    ctx.strokeStyle  = CONFIG.COLOR_NULL;
    ctx.lineWidth    = 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha  = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + depth);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + pw, sy); ctx.lineTo(sx + pw, sy + depth);
    ctx.stroke();
    ctx.setLineDash([]);

    // "undefined" label
    ctx.globalAlpha  = 1;
    ctx.fillStyle    = CONFIG.COLOR_NULL_TEXT;
    ctx.font         = '11px "JetBrains Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor  = CONFIG.COLOR_NULL;
    ctx.shadowBlur   = 8;
    ctx.fillText('undefined', sx + pw / 2, sy + 8);

    ctx.restore();
  }

  // ── Logic bomb: Error 404 block ───────────────────────────
  _drawBomb(ctx, sx, sy, pw, ph) {
    ctx.save();
    // Fill
    ctx.fillStyle   = 'rgba(30,20,5,0.95)';
    ctx.fillRect(sx, sy, pw, ph);

    // Border — yellow with glow
    ctx.strokeStyle = CONFIG.COLOR_BOMB;
    ctx.lineWidth   = 2;
    ctx.shadowColor = CONFIG.COLOR_BOMB;
    ctx.shadowBlur  = 10;
    ctx.strokeRect(sx, sy, pw, ph);

    // Label
    ctx.fillStyle    = CONFIG.COLOR_BOMB;
    ctx.font         = `bold ${Math.min(14, ph * 0.35)}px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur   = 0;
    ctx.fillText('Error', sx + pw / 2, sy + ph * 0.35);
    ctx.fillText('404',   sx + pw / 2, sy + ph * 0.68);

    // Safe-to-land indicator: subtle green tint on top edge
    const topGrad = ctx.createLinearGradient(sx, sy, sx, sy + 8);
    topGrad.addColorStop(0, 'rgba(78,201,176,0.3)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(sx, sy, pw, 8);

    ctx.restore();
  }

  // ── Jump pad: "return true;" strip ────────────────────────
  _drawPad(ctx, sx, sy) {
    const T = CONFIG.WORLD_TILE;
    ctx.save();

    // Base strip (sits at ground level)
    const padH = 8;
    ctx.fillStyle   = CONFIG.COLOR_PAD;
    ctx.shadowColor = CONFIG.COLOR_PAD;
    ctx.shadowBlur  = 12;
    ctx.fillRect(sx, sy + T - padH, T, padH);

    // Label above pad
    ctx.font         = '10px "JetBrains Mono", monospace';
    ctx.fillStyle    = CONFIG.COLOR_PAD;
    ctx.shadowBlur   = 4;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('return true;', sx + T / 2, sy + T - padH - 2);

    // Arrow up
    ctx.fillStyle = CONFIG.COLOR_PAD;
    ctx.shadowBlur = 0;
    ctx.font = '16px sans-serif';
    ctx.fillText('↑', sx + T / 2, sy + T - padH - 14);

    ctx.restore();
  }

  // ── Gravity ring: !==  circle ─────────────────────────────
  _drawRing(ctx, sx, sy) {
    const cx = sx + CONFIG.WORLD_TILE / 2;
    const cy = sy + CONFIG.WORLD_TILE / 2;
    const r  = 18;

    ctx.save();
    ctx.strokeStyle = CONFIG.COLOR_RING;
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = CONFIG.COLOR_RING;
    ctx.shadowBlur  = 14;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle    = CONFIG.COLOR_RING;
    ctx.font         = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur   = 6;
    ctx.fillText('!==', cx, cy);

    ctx.restore();
  }

  // ── Portal: glowing parentheses ───────────────────────────
  _drawPortal(ctx, sx, sy, meta) {
    const T = CONFIG.WORLD_TILE;
    ctx.save();
    ctx.strokeStyle = CONFIG.COLOR_PORTAL;
    ctx.lineWidth   = 3;
    ctx.shadowColor = CONFIG.COLOR_PORTAL;
    ctx.shadowBlur  = 18;

    const cx  = sx + T / 2;
    const cy  = sy + T / 2;
    const arc = 28;

    // Left paren arc
    ctx.beginPath();
    ctx.arc(cx - 10, cy, arc, Math.PI * 0.55, Math.PI * 1.45);
    ctx.stroke();

    // Right paren arc
    ctx.beginPath();
    ctx.arc(cx + 10, cy, arc, Math.PI * 1.55, Math.PI * 0.45);
    ctx.stroke();

    // Mode label
    const label = meta.mode === 'ship' ? 'SHIP' :
                  meta.mode === 'cube' ? 'CUBE' :
                  meta.speed === 'fast'   ? '>>>' :
                  meta.speed === 'normal' ? '===' : '()';
    ctx.fillStyle    = CONFIG.COLOR_PORTAL;
    ctx.font         = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowBlur   = 8;
    ctx.fillText(label, cx, sy - 2);

    ctx.restore();
  }

  // ── Ghost player (Git Blame mode) ─────────────────────────
  _drawGhost(ctx, ghostPlayer) {
    if (!ghostPlayer || !ghostPlayer.active || !ghostPlayer.currentFrame) return;
    const f  = ghostPlayer.currentFrame;
    const sx = CONFIG.PLAYER_X; // ghost always at same screen x as player
    const sy = f.y;

    ctx.save();
    ctx.globalAlpha = 0.3;

    if (f.mode === 'ship') {
      ctx.fillStyle = CONFIG.COLOR_GHOST;
      ctx.translate(sx + CONFIG.HITBOX_SIZE / 2, sy + CONFIG.HITBOX_SIZE / 2);
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-14, -12);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = CONFIG.COLOR_GHOST;
      ctx.translate(sx + CONFIG.HITBOX_SIZE / 2, sy + CONFIG.HITBOX_SIZE / 2);
      ctx.rotate((f.rotation * Math.PI) / 180);
      ctx.fillRect(
        -CONFIG.HITBOX_SIZE / 2, -CONFIG.HITBOX_SIZE / 2,
        CONFIG.HITBOX_SIZE, CONFIG.HITBOX_SIZE
      );
    }

    ctx.restore();
  }

  // ── Jump trail: fading semicolons ─────────────────────────
  _drawTrail(ctx, player) {
    if (player.dead) return;
    ctx.save();
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    player.trail.forEach((t, i) => {
      if (i === 0) return; // skip current position (drawn as player)
      const size  = Math.max(8, 16 * (1 - i / CONFIG.TRAIL_COUNT));
      const alpha = t.alpha * 0.55;
      ctx.globalAlpha  = alpha;
      ctx.fillStyle    = CONFIG.COLOR_PLAYER;
      ctx.font         = `${size}px "JetBrains Mono", monospace`;
      ctx.shadowColor  = CONFIG.COLOR_PLAYER;
      ctx.shadowBlur   = 4;
      ctx.fillText(';', t.x + CONFIG.HITBOX_SIZE / 2, t.y + CONFIG.HITBOX_SIZE / 2);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── Player (Semicolon) ─────────────────────────────────────
  _drawPlayer(ctx, player) {
    if (player.dead) {
      this._drawShards(ctx, player.shards);
      return;
    }

    const sx = player.x;
    const sy = player.y;
    const hs = CONFIG.HITBOX_SIZE;

    ctx.save();
    ctx.shadowColor = CONFIG.COLOR_PLAYER;
    ctx.shadowBlur  = 14;

    if (player.mode === 'cube') {
      // Rotate around center
      ctx.translate(sx + hs / 2, sy + hs / 2);
      ctx.rotate((player.rotation * Math.PI) / 180);

      // Orange square
      ctx.fillStyle = CONFIG.COLOR_PLAYER;
      ctx.fillRect(-hs / 2, -hs / 2, hs, hs);

      // Semicolon character inside
      ctx.fillStyle    = '#1e1e1e';
      ctx.font         = `bold ${hs * 0.65}px "JetBrains Mono", monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur   = 0;
      ctx.fillText(';', 0, 2);

    } else {
      // Ship mode: right-pointing triangle
      ctx.translate(sx + hs / 2, sy + hs / 2);

      // Rotate slightly based on vy for feel
      const tilt = Math.max(-0.4, Math.min(0.4, player.vy / 800));
      ctx.rotate(tilt);

      ctx.fillStyle = CONFIG.COLOR_PLAYER;
      ctx.beginPath();
      ctx.moveTo(hs * 0.6,   0);
      ctx.lineTo(-hs * 0.4, -hs * 0.38);
      ctx.lineTo(-hs * 0.4,  hs * 0.38);
      ctx.closePath();
      ctx.fill();

      // Thrust flame when SPACE held
      if (player.spaceHeld) {
        const flicker = 6 + Math.random() * 10;
        ctx.fillStyle  = '#ff6600';
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.moveTo(-hs * 0.4, -hs * 0.22);
        ctx.lineTo(-hs * 0.4 - flicker, 0);
        ctx.lineTo(-hs * 0.4,  hs * 0.22);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ── Binary shards on death ─────────────────────────────────
  _drawShards(ctx, shards) {
    ctx.save();
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    shards.forEach(s => {
      ctx.globalAlpha  = s.alpha;
      ctx.fillStyle    = CONFIG.COLOR_PLAYER;
      ctx.shadowColor  = CONFIG.COLOR_PLAYER;
      ctx.shadowBlur   = 4;
      ctx.font         = `${Math.round(s.size)}px "JetBrains Mono", monospace`;
      ctx.fillText(s.char, s.x, s.y);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── Foreground: fast blurry Python code (1.3x parallax) ──
  _drawFGCode(ctx, scroll) {
    ctx.save();
    ctx.font      = '13px "JetBrains Mono", monospace';
    ctx.fillStyle = CONFIG.FG_CODE_COLOR;

    const speed = 1.3;
    const count = this._pyLines.length;
    const span  = CONFIG.CANVAS_WIDTH + 600;

    for (let i = 0; i < count; i++) {
      const rawX = i * (span / count) - (scroll * speed % span);
      const x    = ((rawX % span) + span) % span - 200;
      const y    = 60 + (i % 5) * 70;
      ctx.globalAlpha = 0.3;
      ctx.fillText(this._pyLines[i % count], x, y);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── FX triggers ───────────────────────────────────────────
  triggerShake() {
    this._shakeFrames = CONFIG.SHAKE_FRAMES;
  }

  triggerBeatFlash() {
    this._beatFlash = 1.0;
  }
}
