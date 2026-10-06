// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — CPU AI
// States: IDLE, APPROACH, ATTACK, DEFEND, RETREAT, USE_SKILL,
//         USE_ULTIMATE, RECOVER, DODGE
// Difficulty tiers affect reaction speed, aggression, skill use
// Boss AI is more aggressive and uses combos
// ═══════════════════════════════════════════════════════════════

class CpuAI {
  constructor(enemy, player, difficultyNum, isBoss) {
    this.enemy       = enemy;       // Character instance (CPU)
    this.player      = player;      // Character instance (human)
    this.difficulty  = difficultyNum || 3;  // 1-10
    this.isBoss      = isBoss || false;

    // ─── Tunable AI parameters ───
    this.params = this._buildParams(this.difficulty, isBoss);

    // ─── State machine ───
    this.state        = 'APPROACH';
    this.stateTimer   = 0;
    this.decisionTimer = this.params.decisionInterval;

    // ─── Input simulation ───
    // These are set by AI and read by BattleEngine like real input
    this.inputLeft  = false;
    this.inputRight = false;
    this.inputJump  = false;
    this.inputBlock = false;
    this.inputAttack   = false;
    this.inputSkill1   = false;
    this.inputSkill2   = false;
    this.inputSkill3   = false;
    this.inputUltimate = false;

    // ─── Action queues / cooldown ───
    this.attackCooldown  = 0;
    this.jumpCooldown    = 0;
    this.retreatTimer    = 0;
    this.comboStep       = 0;
    this.comboTimer      = 0;

    // ─── Boss-specific state ───
    this.bossPhase       = 1;
    this.speedBoostTimer = 0;
    this.periodicTimer   = 0;
    this.healUsed        = false;
    this.phaseTransitioned = false;

    // ─── Level-specific mechanics ───
    this.levelMechanics = null;
  }

  _buildParams(diff, boss) {
    // Scale parameters from easy (1) to extreme (10)
    const t = Math.min(10, Math.max(1, diff)) / 10;
    return {
      // How often AI makes decisions (lower = faster/smarter)
      decisionInterval:   boss ? lerp(80, 180, 1-t)  : lerp(120, 300, 1-t),
      // Preferred engagement distance (pixels)
      engageDistance:     boss ? 90 : lerp(80, 120, 1-t),
      // Probability of blocking incoming attack
      blockChance:        boss ? lerp(0.45, 0.7, t)  : lerp(0.1, 0.45, t),
      // Probability of using a skill vs basic attack
      skillChance:        boss ? lerp(0.4, 0.75, t)  : lerp(0.1, 0.5, t),
      // Probability of using ultimate when ready
      ultimateChance:     boss ? lerp(0.6, 0.95, t)  : lerp(0.2, 0.8, t),
      // How long AI retreats after being hit
      retreatDuration:    boss ? lerp(100, 400, 1-t) : lerp(200, 600, 1-t),
      // How aggressively AI pursues player
      aggressionFactor:   boss ? lerp(0.7, 1.0, t)   : lerp(0.3, 0.8, t),
      // Attack cooldown between basic attacks
      attackInterval:     boss ? lerp(250, 500, 1-t) : lerp(350, 800, 1-t),
    };
  }

  setLevelMechanics(mechanics) {
    this.levelMechanics = mechanics;
  }

  // ─────────────────────────────────────────────
  // MAIN UPDATE — called every frame
  // ─────────────────────────────────────────────
  update(dt) {
    // Clear one-frame inputs
    this.inputAttack   = false;
    this.inputSkill1   = false;
    this.inputSkill2   = false;
    this.inputSkill3   = false;
    this.inputUltimate = false;
    this.inputJump     = false;
    this.inputBlock    = false;

    // Tick down timers
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.jumpCooldown   > 0) this.jumpCooldown   -= dt;
    if (this.retreatTimer   > 0) this.retreatTimer   -= dt;
    if (this.comboTimer     > 0) this.comboTimer     -= dt;
    if (this.speedBoostTimer > 0) this.speedBoostTimer -= dt;
    if (this.periodicTimer  > 0) this.periodicTimer  -= dt;

    // Don't decide while being knocked down
    if (this.enemy.state === 'knockdown' || this.enemy.state === 'hit') {
      this.inputLeft = false; this.inputRight = false;
      return;
    }

    // Apply boss phase mechanics
    if (this.isBoss) this._updateBossPhase(dt);

    // Decision-making interval
    this.decisionTimer -= dt;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = this.params.decisionInterval;
      this._decide();
    }

    // Execute current state
    this._executeState(dt);
  }

  // ─────────────────────────────────────────────
  // DECISION LOGIC
  // ─────────────────────────────────────────────
  _decide() {
    const dist    = Math.abs(this.enemy.x - this.player.x);
    const engDist = this.params.engageDistance;
    const enemyHP = this.enemy.hpPercent;
    const playerHP= this.player.hpPercent;

    // Ultimate if ready and chance passes
    if (this.enemy.energy >= this.enemy.maxEnergy) {
      if (Math.random() < this.params.ultimateChance) {
        this.state = 'USE_ULTIMATE';
        return;
      }
    }

    // Block if player is attacking and within range
    if (this.player.hitboxActive && dist < engDist + 60) {
      if (Math.random() < this.params.blockChance) {
        this.state = 'DEFEND';
        this.stateTimer = 400;
        return;
      }
    }

    // Retreat if low HP and player close
    if (enemyHP < 0.25 && dist < engDist * 1.5 && Math.random() < 0.5) {
      this.state      = 'RETREAT';
      this.retreatTimer = this.params.retreatDuration;
      return;
    }

    // Use skill when close enough and skill available
    if (dist < engDist + 80 && Math.random() < this.params.skillChance) {
      this.state = 'USE_SKILL';
      return;
    }

    // Approach if far
    if (dist > engDist) {
      this.state = 'APPROACH';
      return;
    }

    // Attack if in range
    if (dist <= engDist && this.attackCooldown <= 0) {
      this.state = 'ATTACK';
      return;
    }

    // Jump occasionally (unpredictable movement)
    if (Math.random() < 0.03 && this.jumpCooldown <= 0) {
      this.state = 'APPROACH';
      this.inputJump = true;
      this.jumpCooldown = 2000;
      return;
    }
  }

  // ─────────────────────────────────────────────
  // STATE EXECUTION
  // ─────────────────────────────────────────────
  _executeState(dt) {
    const dist   = this.enemy.x - this.player.x;
    const absDist = Math.abs(dist);

    this.inputLeft  = false;
    this.inputRight = false;

    switch (this.state) {
      case 'IDLE':
        break;

      case 'APPROACH':
        // Move toward player
        if (dist > 5)       this.inputLeft  = true;
        else if (dist < -5) this.inputRight = true;
        // Jump over player if very close and same height
        if (absDist < 40 && this.enemy.onGround && Math.random() < 0.02) {
          this.inputJump = true;
        }
        break;

      case 'ATTACK':
        // Face player, then attack
        if (this.attackCooldown <= 0) {
          this.inputAttack    = true;
          this.attackCooldown = this.params.attackInterval;
        }
        // Combo follow-up
        if (this.isBoss && this.comboTimer <= 0 && this.comboStep > 0) {
          this.inputAttack = true;
          this.comboStep--;
          this.comboTimer = 300;
        }
        break;

      case 'DEFEND':
        this.inputBlock = true;
        this.enemy.triggerPerfectBlock();
        if (this.stateTimer <= 0) {
          this.state      = 'APPROACH';
          this.inputBlock = false;
        } else {
          this.stateTimer -= dt;
        }
        break;

      case 'RETREAT':
        // Move away from player
        if (dist > 0) this.inputRight = true;
        else          this.inputLeft  = true;
        if (this.retreatTimer <= 0) this.state = 'APPROACH';
        break;

      case 'USE_SKILL':
        this._chooseAndUseSkill();
        this.state = 'APPROACH';
        break;

      case 'USE_ULTIMATE':
        this.inputUltimate = true;
        this.state         = 'ATTACK';
        // Boss start combo after ultimate
        if (this.isBoss) { this.comboStep = 2; this.comboTimer = 500; }
        break;

      case 'RECOVER':
        // Just idle for a moment
        if (this.stateTimer > 0) this.stateTimer -= dt;
        else this.state = 'APPROACH';
        break;

      case 'DODGE':
        // Jump away
        this.inputJump = true;
        if (dist > 0) this.inputRight = true;
        else          this.inputLeft  = true;
        this.state = 'APPROACH';
        break;
    }
  }

  // ─────────────────────────────────────────────
  // SKILL SELECTION
  // ─────────────────────────────────────────────
  _chooseAndUseSkill() {
    const skills = this.enemy.charData.skills;
    // Filter to usable non-ultimate skills
    const usable = skills
      .map((s, i) => ({ skill: s, idx: i }))
      .filter(({ skill, idx }) =>
        skill.type !== 'ultimate' &&
        (this.enemy.skillSystem.cooldowns[skill.id] || 0) === 0 &&
        this.enemy.energy >= skill.energyCost
      );

    if (!usable.length) {
      this.inputAttack = true;
      return;
    }

    // Pick highest-damage usable skill (boss prefers heaviest)
    usable.sort((a, b) => b.skill.damage - a.skill.damage);
    const pick = this.isBoss ? usable[0] : usable[Math.floor(Math.random() * Math.min(usable.length, 3))];

    // Map index to input
    switch (pick.idx) {
      case 0: this.inputAttack = true; break;
      case 1: this.inputSkill1 = true; break;
      case 2: this.inputSkill2 = true; break;
      case 3: this.inputSkill3 = true; break;
    }
  }

  // ─────────────────────────────────────────────
  // BOSS PHASE MECHANICS
  // ─────────────────────────────────────────────
  _updateBossPhase(dt) {
    if (!this.levelMechanics) return;

    const enemyHP = this.enemy.hpPercent;
    const mech    = this.levelMechanics;

    // Single-phase bosses (levels 2-9)
    if (mech.phaseThreshold && !this.phaseTransitioned) {
      if (enemyHP <= mech.phaseThreshold) {
        this.phaseTransitioned = true;
        if (mech.phase2) this._applyPhase2(mech.phase2);
      }
    }

    // Two-threshold bosses (level 9 Inferno)
    if (mech.phaseThreshold1 && !this.phase2Active) {
      if (enemyHP <= mech.phaseThreshold1) {
        this.phase2Active = true;
        if (mech.phase2) this._applyPhase2(mech.phase2);
      }
    }
    if (mech.phaseThreshold2 && !this.phase3Active) {
      if (enemyHP <= mech.phaseThreshold2) {
        this.phase3Active = true;
        if (mech.phase3) this._applyPhase3(mech.phase3);
      }
    }

    // Level 10 final boss — 3 phases
    // Phase 1 (threshold 1.0) is the default state — skip it to avoid
    // immediately flashing "Phase 1!" on round start
    if (mech.phases) {
      mech.phases.forEach(phase => {
        if (phase.phase === 1) return;  // Phase 1 is baseline — no announcement needed
        if (!this[`phase${phase.phase}Active`] && enemyHP <= phase.threshold && (phase.endAt === 0 || enemyHP > phase.endAt)) {
          this[`phase${phase.phase}Active`] = true;
          this._applyFinalBossPhase(phase);
        }
      });
    }

    // Luna heal mechanic
    if (mech.healThreshold && !this.healUsed && enemyHP <= mech.healThreshold) {
      this.healUsed = true;
      const healAmt = Math.round(this.enemy.maxHP * mech.healAmount);
      this.enemy.heal(healAmt);
      EffectManager.screenFlash('white');
    }

    // Periodic skill use (Volt, Terra, Kira)
    if (mech.periodicSkill && this.periodicTimer <= 0) {
      this.periodicTimer = mech.periodicInterval || 10000;
      this._usePeriodicSkill(mech.periodicSkill);
    }

    // Periodic speed boost (Kira)
    if (mech.periodicSpeedBoost && this.periodicTimer <= 0) {
      this.periodicTimer = mech.speedBoostInterval || 10000;
      this.enemy.applySpeedBoost('boss_speed', mech.periodicSpeedBoost);
      this.speedBoostTimer = mech.speedBoostDuration || 5000;
    }
    if (this.speedBoostTimer <= 0) {
      this.enemy.removeSpeedBoost('boss_speed');
    }
  }

  _applyPhase2(phase2) {
    this.enemy.attackMultiplier *= (phase2.attackMultiplier || 1);
    if (phase2.newBehavior === 'aggressive') {
      this.params.aggressionFactor = 1.0;
      this.params.decisionInterval *= 0.6;
      this.params.skillChance = 0.7;
    }
    // Show phase label
    BattleEngine.showBattleMessage(phase2.effectLabel || 'POWER UP!', 1500);
    EffectManager.screenFlash('red');
    EffectManager.screenShake(10, 600);
  }

  _applyPhase3(phase3) {
    this.enemy.attackMultiplier *= 1.15;
    if (phase3.burningGround) {
      BattleEngine.activateBurningGround(phase3.burningDamagePerSec);
    }
    BattleEngine.showBattleMessage(phase3.effectLabel || 'FINAL PHASE!', 1500);
    EffectManager.screenFlash('red');
    EffectManager.screenShake(15, 800);
  }

  _applyFinalBossPhase(phase) {
    // Apply attack multiplier directly (don't chain-multiply via wrong charData.enemy reference)
    if (phase.attackMultiplier) this.enemy.attackMultiplier = phase.attackMultiplier;
    if (phase.speedMultiplier)  this.enemy.speedMultiplier  = phase.speedMultiplier;
    if (phase.burningGround)    BattleEngine.activateBurningGround(phase.burningDamagePerSec);
    BattleEngine.showBattleMessage(phase.phaseLabel || `PHASE ${phase.phase}!`, 2000);
    EffectManager.screenFlash('red');
    EffectManager.screenShake(12, 700);
  }

  _usePeriodicSkill(skillId) {
    const skills = this.enemy.charData.skills;
    const idx    = skills.findIndex(s => s.id === skillId);
    if (idx < 0) return;
    switch (idx) {
      case 1: this.inputSkill1 = true; break;
      case 2: this.inputSkill2 = true; break;
      case 3: this.inputSkill3 = true; break;
    }
  }
}

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────
function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
