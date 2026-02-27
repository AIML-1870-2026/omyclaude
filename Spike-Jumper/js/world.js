// js/world.js — World state: scrolling, entity management, coordinate conversion

class World {

  constructor(entities, levelEndX) {
    this.entities   = entities;     // parsed level data (world coords)
    this.levelEndX  = levelEndX;    // world x where WIN triggers
    this.scrollX    = 0;            // total pixels the camera has scrolled
    this.speed      = CONFIG.SCROLL_SPEED;
  }

  reset() {
    this.scrollX = 0;
    this.speed   = CONFIG.SCROLL_SPEED;
  }

  // Advance the camera. Called every tick while playing.
  scroll(dt, player) {
    if (player.dead) return;
    this.scrollX += this.speed * (dt / 1000);
  }

  // Convert world x to screen x
  screenX(worldX) {
    return worldX - this.scrollX;
  }

  // Convert screen x to world x
  worldXfromScreen(screenX) {
    return screenX + this.scrollX;
  }

  // Return only entities visible in current viewport (with a 300px buffer)
  getVisible() {
    const left  = this.scrollX - 300;
    const right = this.scrollX + CONFIG.CANVAS_WIDTH + 300;
    return this.entities.filter(e =>
      e.worldX + e.pixW > left && e.worldX < right
    );
  }

  // Completion ratio 0.0 – 1.0
  get progress() {
    return Math.min(1, this.scrollX / this.levelEndX);
  }

  // True once the player's screen position passes the end marker
  isLevelComplete() {
    const endEntity = this.entities.find(e => e.type === 'end');
    if (!endEntity) return false;
    return this.screenX(endEntity.worldX) <= CONFIG.PLAYER_X + CONFIG.HITBOX_SIZE;
  }
}
