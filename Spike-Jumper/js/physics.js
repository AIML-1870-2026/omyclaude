// js/physics.js — Pure physics utilities (no DOM, no state)

class Physics {

  // Returns a shrunk AABB for collision (forgiveness margin applied)
  static getAABB(entity) {
    return {
      x: entity.x + CONFIG.HITBOX_MARGIN,
      y: entity.y + CONFIG.HITBOX_MARGIN,
      w: CONFIG.HITBOX_SIZE - CONFIG.HITBOX_MARGIN * 2,
      h: CONFIG.HITBOX_SIZE - CONFIG.HITBOX_MARGIN * 2,
    };
  }

  // AABB overlap test — returns true if two boxes intersect
  static overlaps(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // Returns which edge the player is colliding with an obstacle from.
  // 'top'  = player landed on top (safe for Logic Bombs)
  // 'side' = player hit the side (lethal for Logic Bombs)
  // null   = no collision
  static collideEdge(playerAABB, obstacleAABB) {
    if (!this.overlaps(playerAABB, obstacleAABB)) return null;

    const overlapX = Math.min(
      playerAABB.x + playerAABB.w - obstacleAABB.x,
      obstacleAABB.x + obstacleAABB.w - playerAABB.x
    );
    const overlapY = Math.min(
      playerAABB.y + playerAABB.h - obstacleAABB.y,
      obstacleAABB.y + obstacleAABB.h - playerAABB.y
    );

    return overlapY <= overlapX ? 'top' : 'side';
  }

  // Integrate velocity: apply gravity then move entity by vy.
  // dt in milliseconds.
  static integrate(entity, dt, mode, gravityDir) {
    const dtS = dt / 1000;
    const dir = gravityDir !== undefined ? gravityDir : 1;

    if (mode === 'ship') {
      // Gravity is gentler in ship mode; thrust applied in player.js
      entity.vy += CONFIG.SHIP_GRAVITY * dtS * dir;
      entity.vy = Math.max(-CONFIG.SHIP_MAX_SPEED,
                  Math.min(CONFIG.SHIP_MAX_SPEED, entity.vy));
    } else {
      // Cube: strong gravity
      entity.vy += CONFIG.GRAVITY * dtS * dir;
    }

    entity.y += entity.vy * dtS;
  }

  // Clamp to ground. Returns true if entity is on the ground.
  // Handles both normal and flipped gravity.
  static resolveGround(entity, gravityDir) {
    const dir = gravityDir !== undefined ? gravityDir : 1;
    if (dir === 1) {
      // Normal: ground is at GROUND_Y (bottom of hitbox touches)
      if (entity.y + CONFIG.HITBOX_SIZE >= CONFIG.GROUND_Y) {
        entity.y  = CONFIG.GROUND_Y - CONFIG.HITBOX_SIZE;
        entity.vy = 0;
        return true;
      }
    } else {
      // Flipped: ceiling is at y=0 (top of hitbox touches ceiling)
      if (entity.y <= 0) {
        entity.y  = 0;
        entity.vy = 0;
        return true;
      }
    }
    return false;
  }

  // Prevent flying past the opposite wall in flipped mode
  static resolveCeiling(entity, gravityDir) {
    const dir = gravityDir !== undefined ? gravityDir : 1;
    if (dir === 1) {
      // Normal: prevent going above y=0
      if (entity.y < 0) {
        entity.y  = 0;
        entity.vy = 0;
      }
    } else {
      // Flipped: prevent going below GROUND_Y
      if (entity.y + CONFIG.HITBOX_SIZE > CONFIG.GROUND_Y) {
        entity.y  = CONFIG.GROUND_Y - CONFIG.HITBOX_SIZE;
        entity.vy = 0;
      }
    }
  }
}
