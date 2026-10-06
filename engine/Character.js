// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — CHARACTER CLASS
// Handles position, velocity, physics, states, HP/energy,
// hitboxes, animations (CSS/canvas), drawing
// ═══════════════════════════════════════════════════════════════

class Character {
  constructor(charData, id, isPlayer, canvasWidth, canvasHeight) {
    this.id          = id;       // 'player' or 'enemy'
    this.isPlayer    = isPlayer;
    this.charData    = charData;

    // ─── Stats (from spec, with optional level multipliers) ───
    this.maxHP       = charData.stats.hp;
    this.maxEnergy   = charData.stats.maxEnergy;
    this.baseAttack  = charData.stats.attack;
    this.baseDefense = charData.stats.defense;
    this.baseSpeed   = charData.stats.speed;

    // ─── Battle multipliers (applied by boss mechanics) ───
    this.hpMultiplier     = 1.0;
    this.attackMultiplier = 1.0;
    this.defenseMultiplier= 1.0;
    this.speedMultiplier  = 1.0;
    this._speedBoosts     = {};   // id → multiplier

    // ─── Canvas layout ───
    this.canvasW  = canvasWidth;
    this.canvasH  = canvasHeight;
    this.groundY  = canvasHeight * 0.85;  // lower ground = characters closer to bottom

    // ─── Physical dimensions ───
    // Bigger characters — 58% of canvas height for closer feel
    const baseH   = Math.round(canvasHeight * 0.58);
    const baseW   = Math.round(baseH * 0.65);
    this.width    = baseW;
    this.height   = baseH;

    // ─── Position ───
    // Closer together — reduce margin
    const margin  = Math.round(canvasWidth * 0.20);
    this.x = isPlayer
      ? margin
      : canvasWidth - margin - this.width;
    this.y        = this.groundY - this.height;

    // ─── Velocity ───
    this.vx       = 0;
    this.vy       = 0;

    // ─── Direction ───
    this.facingRight = isPlayer;

    // ─── Physics constants ───
    this.gravity     = 0.55;
    this.jumpPower   = -13;
    this.walkSpeed   = 3.0 + (this.baseSpeed / 100) * 2.5;
    this.onGround    = true;

    // ─── State machine ───
    // States: idle | walk | jump | fall | attack | skill | skill2 | ultimate | block | hit | knockdown | victory | defeat
    this.state         = 'idle';
    this.stateTimer    = 0;

    // ─── HP / Energy ───
    this.hp            = this.maxHP;
    this.energy        = 0;

    // ─── Combat ───
    this.isBlocking        = false;
    this.perfectBlockTimer = 0;
    this.attackTimer       = 0;   // ms remaining in current attack
    this.attackActiveAt    = 0;   // ms after attack start that hitbox is active
    this.attackActiveFor   = 0;   // ms hitbox is active
    this.attackElapsed     = 0;   // ms elapsed in current attack
    this.currentSkill      = null;
    this.hitboxActive      = false;
    this.invulnTimer       = 0;   // invulnerability frames ms
    this.hitStunTimer      = 0;

    // ─── Knockback ───
    this.knockbackVX  = 0;
    this.knockbackVY  = 0;

    // ─── Damage dealt tracking ───
    this.totalDamageDealt = 0;

    // ─── Slow / speed debuffs ───
    this.slowTimer    = 0;
    this.slowAmount   = 0;

    // ─── Skills system ───
    this.skillSystem  = new SkillSystem(this);

    // ─── Animation ───
    this.animFrame    = 0;
    this.animTimer    = 0;
    this.animSpeed    = 100;  // ms per frame — overridden per state below
    this.animDone     = false; // true when a play-once animation finishes

    // ─── Hitbox (relative to x,y) ───
    // Attack hitbox extends forward
    this.hitboxOffsetX = 0;
    this.hitboxWidth   = 0;
    this.hitboxHeight  = 80;

    // ─── Per-swing hit tracking (set by BattleEngine) ───
    // Prevents the same swing hitting multiple times
    this._hitThisSwing = false;
  }

  // ─────────────────────────────────────────────
  // APPLY LEVEL MULTIPLIERS (boss mechanics etc)
  // ─────────────────────────────────────────────
  applyMultipliers(hpMult, atkMult, spdMult) {
    this.hpMultiplier     = hpMult  || 1.0;
    this.attackMultiplier = atkMult || 1.0;
    this.speedMultiplier  = spdMult || 1.0;
    this.maxHP  = Math.round(this.charData.stats.hp * this.hpMultiplier);
    this.hp     = this.maxHP;
    this.walkSpeed = (3.0 + (this.baseSpeed / 100) * 2.5) * this.speedMultiplier;
  }

  // ─────────────────────────────────────────────
  // RESET for new round
  // ─────────────────────────────────────────────
  resetForRound() {
    this.hp          = this.maxHP;
    this.energy      = 0;
    this.vx          = 0;
    this.vy          = 0;
    this.isBlocking  = false;
    this.state       = 'idle';
    this.stateTimer  = 0;
    this.animFrame   = 0;
    this.animTimer   = 0;
    this.animDone    = false;
    this.invulnTimer = 0;
    this.hitStunTimer= 0;
    this.slowTimer   = 0;
    this.currentSkill = null;
    this.hitboxActive = false;

    // Reset position — closer together
    const margin = Math.round(this.canvasW * 0.20);
    this.x = this.isPlayer
      ? margin
      : this.canvasW - margin - this.width;
    this.y = this.groundY - this.height;

    this.facingRight = this.isPlayer;
    this.skillSystem.resetCooldowns();
  }

  // ─────────────────────────────────────────────
  // UPDATE (called every frame with delta time ms)
  // ─────────────────────────────────────────────
  update(dt, inputLeft, inputRight, inputJump, inputBlock) {
    const dtSec = dt / 1000;

    // Update timers
    if (this.invulnTimer  > 0) this.invulnTimer  -= dt;
    if (this.hitStunTimer > 0) this.hitStunTimer  -= dt;
    if (this.slowTimer    > 0) this.slowTimer     -= dt;
    if (this.perfectBlockTimer > 0) this.perfectBlockTimer -= dt;
    if (this.stateTimer   > 0) this.stateTimer    -= dt;

    // Update skill system
    this.skillSystem.update(dt);

    // Attack timer
    if (this.attackTimer > 0) {
      this.attackElapsed += dt;
      this.attackTimer   -= dt;

      // Check hitbox activation window
      this.hitboxActive = (
        this.attackElapsed >= this.attackActiveAt &&
        this.attackElapsed < (this.attackActiveAt + this.attackActiveFor)
      );

      if (this.attackTimer <= 0) {
        this.attackTimer   = 0;
        this.attackElapsed = 0;
        this.hitboxActive  = false;
        this.currentSkill  = null;
        // Only return to idle if not interrupted by a hit reaction
        if (this.state === 'attack' || this.state === 'skill' ||
            this.state === 'skill2' || this.state === 'ultimate') {
          if (this.state !== 'knockdown' && this.state !== 'hit' &&
              this.state !== 'defeat') {
            this.setState('idle');
          }
        }
      }
    }

    // Can't move during hit stun or knockdown
    if (this.hitStunTimer > 0) {
      this._applyGravity(dtSec);
      this._applyVelocity();
      this._clampToArena();
      return;
    }
    // hitStunTimer just expired — return to idle
    if (this.state === 'hit') {
      this.setState('idle');
    }
    if (this.state === 'knockdown') {
      this._applyGravity(dtSec);
      this._applyVelocity();
      this._clampToArena();
      // Recover when on ground AND the knockdown timer has expired
      if (this.onGround && this.stateTimer <= 0) {
        this.setState('idle');
        this.invulnTimer = 600;  // brief wake-up invulnerability
      }
      // Failsafe: if stateTimer expired but still airborne, force land
      if (this.stateTimer <= 0 && !this.onGround) {
        this.vy = 0;
        this.y  = this.groundY !== undefined ? this.groundY : this.y;
      }
      return;
    }

    // Block
    if (this.state !== 'attack' && this.state !== 'skill' &&
        this.state !== 'skill2' && this.state !== 'ultimate') {
      if (inputBlock) {
        this.isBlocking = true;
        this.setState('block');
        this.vx = 0;
      } else {
        if (this.isBlocking) {
          this.isBlocking = false;
          this.setState('idle');
        }
      }
    }

    // Movement (only when not attacking or blocking)
    if (this.state !== 'attack' && this.state !== 'skill' &&
        this.state !== 'skill2' && this.state !== 'ultimate' && !this.isBlocking) {
      const slowFactor = this.slowTimer > 0 ? (1 - this.slowAmount) : 1.0;
      const speedBoost = this._getTotalSpeedBoost();
      const speed = this.walkSpeed * slowFactor * speedBoost;

      if (inputLeft && !inputRight) {
        this.vx = -speed;
        if (this.onGround && this.state !== 'attack') this.setState('walk');
        this.facingRight = false;
      } else if (inputRight && !inputLeft) {
        this.vx = speed;
        if (this.onGround && this.state !== 'attack') this.setState('walk');
        this.facingRight = true;
      } else {
        // Decelerate
        this.vx *= 0.7;
        if (Math.abs(this.vx) < 0.5) this.vx = 0;
        if (this.onGround && this.state === 'walk') this.setState('idle');
      }

      // Jump
      if (inputJump && this.onGround) {
        this.vy = this.jumpPower;
        this.onGround = false;
        this.setState('jump');
        AudioManager.playSFX('navigate');
      }
    }

    // During attack/skill/ultimate — stop horizontal movement (no sliding)
    if (this.state === 'attack' || this.state === 'skill' ||
        this.state === 'skill2' || this.state === 'ultimate') {
      this.vx = 0;
    }

    // Apply knockback decay
    if (Math.abs(this.knockbackVX) > 0.1) {
      this.vx         += this.knockbackVX;
      this.knockbackVX *= 0.7;
    } else {
      this.knockbackVX = 0;
    }

    // Gravity & physics
    this._applyGravity(dtSec);
    this._applyVelocity();
    this._clampToArena();

    // Animation
    this._updateAnimation(dt);
  }

  _applyGravity(dtSec) {
    if (!this.onGround) {
      this.vy += this.gravity;
      // Only auto-switch to 'fall' outside of knockdown (knockdown has its own anim)
      if (this.vy > 0 && this.state !== 'fall' &&
          this.state !== 'knockdown' && this.state !== 'jump') {
        this.setState('fall');
      }
    }
  }

  _applyVelocity() {
    this.x += this.vx;
    this.y += this.vy;

    // Land on ground
    if (this.y >= this.groundY - this.height) {
      this.y        = this.groundY - this.height;
      this.vy       = 0;
      this.onGround = true;
      if (this.state === 'fall' || this.state === 'jump') this.setState('idle');
      if (this.state === 'knockdown') {
        // Only set a floor on stateTimer when first landing (still airborne before)
        // Once on the ground let it count down naturally — recovery runs when it hits 0
        if (!this._knockdownLanded) {
          this._knockdownLanded = true;
          if (this.stateTimer <= 0) this.stateTimer = 600;
        }
      }
    } else {
      this.onGround = false;
    }
  }

  _clampToArena() {
    const minX = 10;
    const maxX = this.canvasW - this.width - 10;
    if (this.x < minX) { this.x = minX; this.vx = 0; }
    if (this.x > maxX) { this.x = maxX; this.vx = 0; }
  }

  _getTotalSpeedBoost() {
    let mult = 1.0;
    for (const id in this._speedBoosts) {
      mult *= (1 + this._speedBoosts[id]);
    }
    return mult;
  }

  _updateAnimation(dt) {
    const ANIM_SPEED = {
      idle:      140,
      walk:      100,
      run:       80,
      jump:      110,
      fall:      110,
      attack:    70,
      skill:     80,
      skill2:    85,
      ultimate:  110,
      hit:       80,
      knockdown: 120,
      block:     100,
      victory:   130,
      defeat:    150,
    };

    const LOOP_STATES = new Set(['idle', 'walk', 'run', 'block']);

    const speed = ANIM_SPEED[this.state] || 100;

    // Get frame count — use a safe minimum of 2 so animation always moves
    let maxFrame = 2;
    try {
      const fc = AssetManager.getFrameCount(this.charData.id, this.state);
      if (fc && fc > 0) maxFrame = fc;
    } catch(e) {}

    this.animTimer += dt;
    if (this.animTimer < speed) return;
    this.animTimer = 0;

    // Loop states always advance and wrap
    if (LOOP_STATES.has(this.state)) {
      this.animFrame = (this.animFrame + 1) % maxFrame;
      return;
    }

    // Play-once states: advance until last frame, then hold
    if (this.animFrame < maxFrame - 1) {
      this.animFrame++;
    }
    // at last frame — stay there, animDone flag optional
  }

  // ─────────────────────────────────────────────
  // STATE MACHINE
  // ─────────────────────────────────────────────
  setState(newState) {
    if (this.state === newState) return;
    this.state      = newState;
    this.stateTimer = this._stateDefaultDuration(newState);
    this.animFrame  = 0;
    this.animTimer  = 0;
    this.animDone   = false;
    this._knockdownLanded = false;  // reset on every state change

    // DO NOT resize on state change — keep fixed 42% height always
  }

  _stateDefaultDuration(state) {
    const durations = {
      hit:       350,
      knockdown: 1200,
      victory:   0,
      defeat:    0,
    };
    return durations[state] || 0;
  }

  // ─────────────────────────────────────────────
  // HP / ENERGY
  // ─────────────────────────────────────────────
  takeDamage(amount) {
    if (this.invulnTimer > 0) return 0;  // invulnerable

    let finalDmg = amount;

    // Armor reduction (earth armor passive)
    const armorReduction = this.skillSystem.getArmorReduction();
    finalDmg *= (1 - armorReduction);

    // NOTE: Block reduction is applied in calcDamage() (called by BattleEngine._applyHit)
    // so we do NOT apply it again here. We only play the block SFX.
    // The Frozen Armor passive bonus is already factored into calcDamage via options.
    if (this.isBlocking) {
      AudioManager.playSFX('block');
    }

    finalDmg = Math.max(1, Math.round(finalDmg));

    this.hp = Math.max(0, this.hp - finalDmg);

    // Energy gain on taking damage
    this.gainEnergy(3);

    // Hit reaction (only if not blocking heavily)
    if (!this.isBlocking || finalDmg > 30) {
      if (finalDmg > 100) {
        this.setState('knockdown');
        // Invuln covers entire knockdown so enemy can't juggle infinitely
        this.invulnTimer  = 1400;
        this.hitStunTimer = 0;   // clear hitstun so knockdown recovery code runs
      } else {
        // Don't interrupt a knockdown with a lighter hit reaction
        if (this.state !== 'knockdown') {
          this.setState('hit');
          this.hitStunTimer = 200;
        }
      }
    }

    // Passive trigger
    this.skillSystem.onTakeDamage();

    // HP bar update
    EffectManager.updateHPBarState(
      document.getElementById(this.isPlayer ? 'hudPlayerHPFill' : 'hudEnemyHPFill'),
      this.hp / this.maxHP
    );

    return finalDmg;
  }

  gainEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  spendEnergy(amount) {
    this.energy = Math.max(0, this.energy - amount);
  }

  applyKnockback(direction, power) {
    const forces = { light: 4, medium: 7, heavy: 12 };
    const f = forces[power] || 4;
    this.knockbackVX = f * (direction === 'right' ? 1 : -1);
    this.knockbackVY = -f * 0.4;
  }

  applySlow(duration, amount) {
    this.slowTimer  = duration;
    this.slowAmount = amount;
  }

  applySpeedBoost(id, amount) {
    this._speedBoosts[id] = amount;
  }
  removeSpeedBoost(id) {
    delete this._speedBoosts[id];
  }

  triggerPerfectBlock() {
    this.perfectBlockTimer = 200;  // 0.2 second window (spec)
  }

  // Heal (Luna boss mechanic)
  heal(amount) {
    this.hp = Math.min(this.maxHP, this.hp + amount);
  }

  // ─────────────────────────────────────────────
  // HITBOX (for hit detection)
  // Returns absolute hitbox rect during active frames
  // ─────────────────────────────────────────────
  getHitbox() {
    if (!this.hitboxActive || !this.currentSkill) return null;

    const skill   = this.currentSkill;
    const rangeMap = { close: 80, medium: 160, long: 999 };
    const hbWidth  = rangeMap[skill.range] || 80;

    // Offset forward in facing direction
    const hbX = this.facingRight
      ? this.x + this.width
      : this.x - hbWidth;

    return {
      x:      hbX,
      y:      this.y + this.height * 0.15,
      width:  hbWidth,
      height: this.height * 0.7,
    };
  }

  // Hurtbox (the body that can be hit)
  getHurtbox() {
    return {
      x:      this.x + 4,
      y:      this.y + 4,
      width:  this.width - 8,
      height: this.height - 4,
    };
  }

  // ─────────────────────────────────────────────
  // FACING — auto-face opponent
  // ─────────────────────────────────────────────
  faceOpponent(opponentX) {
    // Only auto-face when idle or walking — not during attacks
    if (this.state !== 'attack' && this.state !== 'skill' &&
        this.state !== 'skill2' && this.state !== 'ultimate') {
      this.facingRight = opponentX > this.x;
    }
  }

  // ─────────────────────────────────────────────
  // DRAW (canvas)
  // ─────────────────────────────────────────────
  draw(ctx) {
    ctx.save();

    // Invulnerability flash — blink every 80ms
    const isFlashFrame = this.invulnTimer > 0 && Math.floor(this.invulnTimer / 80) % 2 === 0;
    if (isFlashFrame) ctx.globalAlpha = 0.25;

    // Hit flash — briefly white
    if (this.state === 'hit' && this.hitStunTimer > 160) {
      ctx.filter = 'brightness(4) saturate(0)';
    }

    // Shadow under feet
    ctx.save();
    ctx.globalAlpha *= 0.25;
    ctx.fillStyle    = '#000';
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height + 2,
      this.width * 0.5, 5, 0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Try sprite sheet first (AssetManager handles per-state/sheet/placeholder)
    // If per-state file missing for this state, fall back to idle state sprite
    let drawn = this._drawSprite(ctx);
    if (!drawn) {
      drawn = AssetManager.hasPerStateSprite(this.charData.id, 'idle')
        ? this._drawSpriteState(ctx, 'idle')
        : false;
    }

    // Solid geometric fallback — only if truly no sprite available at all
    if (!drawn) {
      this._drawFallback(ctx);
    }

    ctx.filter      = 'none';
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ─────────────────────────────────────────────
  // GEOMETRIC FALLBACK — guaranteed visible
  // ─────────────────────────────────────────────
  _drawFallback(ctx) {
    const x     = this.x;
    const y     = this.y;
    const w     = this.width;
    const h     = this.height;
    const color = this.charData.color || '#ff6b2b';
    const dark  = this._darken(color, 0.4);

    ctx.save();
    if (!this.facingRight) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      this._drawGeometric(ctx, 0, 0, w, h, color, dark);
    } else {
      this._drawGeometric(ctx, x, y, w, h, color, dark);
    }
    ctx.restore();
  }

  _drawGeometric(ctx, x, y, w, h, color, dark) {
    const bob = Math.sin(this.animFrame * 0.4) * 2;
    const isAttacking = this.state === 'attack' || this.state === 'skill' ||
                        this.state === 'skill2' || this.state === 'ultimate';

    // Legs
    ctx.fillStyle = dark;
    ctx.fillRect(x + w * 0.22, y + h * 0.58, w * 0.20, h * 0.42);
    ctx.fillRect(x + w * 0.58, y + h * 0.58, w * 0.20, h * 0.42);

    // Torso
    const tg = ctx.createLinearGradient(x, y + h * 0.22, x, y + h * 0.60);
    tg.addColorStop(0, color);
    tg.addColorStop(1, dark);
    ctx.fillStyle = tg;
    ctx.fillRect(x + w * 0.15, y + h * 0.22 + bob, w * 0.70, h * 0.38);

    // Arms
    ctx.fillStyle = color;
    if (isAttacking) {
      // Attack — right arm extended forward
      ctx.fillRect(x + w * 0.72, y + h * 0.24 + bob, w * 0.38, h * 0.12);
      ctx.fillRect(x + w * 0.02, y + h * 0.28 + bob, w * 0.14, h * 0.26);
    } else if (this.state === 'block') {
      ctx.fillRect(x + w * 0.62, y + h * 0.22, w * 0.14, h * 0.30);
      ctx.fillRect(x + w * 0.60, y + h * 0.22, w * 0.30, h * 0.12);
      ctx.fillRect(x + w * 0.02, y + h * 0.28, w * 0.14, h * 0.26);
    } else if (this.state === 'jump' || this.state === 'fall') {
      ctx.fillRect(x + w * 0.02, y + h * 0.16 + bob, w * 0.14, h * 0.26);
      ctx.fillRect(x + w * 0.84, y + h * 0.16 + bob, w * 0.14, h * 0.26);
    } else {
      ctx.fillRect(x + w * 0.02, y + h * 0.28 + bob, w * 0.14, h * 0.28);
      ctx.fillRect(x + w * 0.84, y + h * 0.28 - bob, w * 0.14, h * 0.28);
    }

    // Head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + w * 0.50, y + h * 0.13 + bob, w * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Hair highlight
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(x + w * 0.50, y + h * 0.07 + bob, w * 0.16, Math.PI, 0);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + w * 0.62, y + h * 0.12 + bob, w * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x + w * 0.635, y + h * 0.12 + bob, w * 0.030, 0, Math.PI * 2);
    ctx.fill();

    // Attack glow
    if (isAttacking) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 20;
      ctx.fillStyle   = color;
      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h * 0.45, w * 0.5, h * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Element emoji above head (small, subtle)
    ctx.globalAlpha = 0.7;
    ctx.font        = `${Math.round(w * 0.4)}px serif`;
    ctx.textAlign   = 'center';
    ctx.fillText(this.charData.emoji, x + w * 0.5, y - 2 + bob);
    ctx.textAlign   = 'left';
    ctx.globalAlpha = 1;
  }

  _darken(hexColor, factor) {
    try {
      const r = Math.round(parseInt(hexColor.slice(1,3), 16) * (1-factor));
      const g = Math.round(parseInt(hexColor.slice(3,5), 16) * (1-factor));
      const b = Math.round(parseInt(hexColor.slice(5,7), 16) * (1-factor));
      return '#' +
        r.toString(16).padStart(2,'0') +
        g.toString(16).padStart(2,'0') +
        b.toString(16).padStart(2,'0');
    } catch(e) { return hexColor; }
  }

  _drawSprite(ctx) {
    return this._drawSpriteState(ctx, this.state);
  }

  _drawSpriteState(ctx, state) {
    const ch  = this.charData;
    const x   = this.x;
    const y   = this.y;
    const w   = this.width;
    const h   = this.height;

    ctx.save();

    let ok = false;
    if (!this.facingRight) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ok = AssetManager.drawSprite(ctx, ch.id, state, this.animFrame, 0, 0, w, h);
    } else {
      ok = AssetManager.drawSprite(ctx, ch.id, state, this.animFrame, x, y, w, h);
    }

    ctx.restore();

    if (ok) {
      this._drawAttackGlow(ctx, x, y, w, h, ch.color);
    }
    return ok;
  }
  // Glow aura drawn on top of sprite during active combat states
  _drawAttackGlow(ctx, x, y, w, h, color) {
    // Removed circle glow — kept intentionally minimal
  }

  // ─────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────
  get hpPercent()     { return this.hp / this.maxHP; }
  get energyPercent() { return this.energy / this.maxEnergy; }
  get isAlive()       { return this.hp > 0; }
  get isDead()        { return this.hp <= 0; }
  get effectiveAttack()  { return this.baseAttack  * this.attackMultiplier; }
  get effectiveDefense() { return this.baseDefense * this.defenseMultiplier; }
}
