// ===== main.js =====
// Bootstrap entry point

document.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  const ui   = new UI(game);
  ui.init();
});
