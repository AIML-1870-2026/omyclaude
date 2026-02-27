'use strict';

class PhysicsEngine {
  constructor() {
    this._jumpHeld    = false;
    this._jumpHeldMs  = 0;
    this._jumpPressed = false;
  }

  // Called once on keydown SPACE (edge-detect)
  onJumpPress() {
    this._jumpPressed = true;
    this._jumpHeld    = true;
    this._jumpHeldMs  = 0;
  }

  // Called on keyup SPACE
  onJumpRelease() {
    this._jumpHeld = false;
  }

  update(player, groundY, dt) {
    // Apply jump on press (only when grounded)
    if (this._jumpPressed && player.onGround) {
      this._applyJump(player);
      this._jumpPressed = false;
    }

    // Hold boost: nudge upward while space held and still rising
    if (this._jumpHeld && !player.onGround && player.vy < 0) {
      this._jumpHeldMs += dt;
      if (this._jumpHeldMs < PHYSICS.HOLD_BOOST_MS) {
        player.vy += PHYSICS.HOLD_BOOST;
      }
    }

    // Gravity
    player.vy += PHYSICS.GRAVITY;
    if (player.vy > PHYSICS.MAX_FALL_SPEED) player.vy = PHYSICS.MAX_FALL_SPEED;
    player.y += player.vy;

    // Ground collision — player.y is the center, so bottom edge = y + radius
    const groundContact = groundY - PHYSICS.PLAYER_RADIUS;
    if (player.y >= groundContact) {
      const wasAirborne = !player.onGround;
      player.y = groundContact;
      player.onGround = true;
      if (wasAirborne && player.vy > 2) {
        player.scaleY = PHYSICS.SQUASH_SCALE_Y;
        player.scaleX = PHYSICS.SQUASH_SCALE_X;
        player._squashTimer = PHYSICS.SQUASH_FRAMES;
      }
      player.vy = 0;
    } else {
      player.onGround = false;
    }

    // Squash/stretch recovery — lerp back to 1
    if (player._squashTimer > 0) {
      player.scaleY += (1 - player.scaleY) * 0.18;
      player.scaleX += (1 - player.scaleX) * 0.18;
    } else if (!player.onGround) {
      // In-air stretch
      player.scaleY += (PHYSICS.STRETCH_SCALE_Y - player.scaleY) * 0.12;
      player.scaleX += (PHYSICS.STRETCH_SCALE_X - player.scaleX) * 0.12;
    }
  }

  _applyJump(player) {
    // Anticipation squash (3 frames handled by _squashTimer)
    player.scaleY = PHYSICS.SQUASH_SCALE_Y;
    player.scaleX = PHYSICS.SQUASH_SCALE_X;
    player._squashTimer = 3;
    player.vy = PHYSICS.JUMP_VY_TAP;
    player.onGround = false;
  }

  // AABB overlap
  overlaps(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  // Circle vs AABB
  circleRect(cx, cy, cr, rx, ry, rw, rh) {
    const nearX = Math.max(rx, Math.min(cx, rx + rw));
    const nearY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nearX;
    const dy = cy - nearY;
    return dx * dx + dy * dy < cr * cr;
  }
}
