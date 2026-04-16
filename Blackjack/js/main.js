// ===== main.js =====
// Bootstrap entry point

document.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  const ui   = new UI(game);
  ui.init();

  // Global .env upload handler (called from onchange in HTML)
  window._bjEnvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target.result;
      console.log('[ENV] File loaded, length:', content.length);
      const ok = ui.agent.loadEnvContent(content);
      console.log('[ENV] Key found:', ok);
      if (ok) {
        ui._setKeyStatus(true, file.name);
        ui._log('sys', `AI_KEY_LOADED: ${file.name}`);
      } else {
        ui._setKeyStatus(false, 'KEY NOT FOUND');
        ui._log('warn', 'No OPENAI_API_KEY found in file');
      }
    };
    reader.readAsText(file);
  };
});
