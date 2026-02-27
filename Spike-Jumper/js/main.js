'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');

  // Match canvas resolution to device pixels
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const game = new GameEngine(canvas);

  // ─── Keyboard input ───────────────────────────────────────────────────────
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      game.onKeyDown(' ');
    } else {
      game.onKeyDown(e.key);
    }
  });

  window.addEventListener('keyup', e => {
    if (e.code === 'Space') game.onKeyUp(' ');
  });

  // ─── Mobile touch ─────────────────────────────────────────────────────────
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    game.onKeyDown(' ');
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    game.onKeyUp(' ');
  }, { passive: false });

  // ─── Resize ───────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    game.onResize(canvas.width, canvas.height);
  });

  // ─── Game loop (fixed dt for deterministic physics) ───────────────────────
  function loop() {
    game.update(16.67);
    game.draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
