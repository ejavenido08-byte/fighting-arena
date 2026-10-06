// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — SKILLS SYSTEM
// Handles skill execution, cooldowns, energy, projectiles,
// barriers, dashes, passives, and per-character effects
// ═══════════════════════════════════════════════════════════════

class SkillSystem {
  constructor(fighter) {
    this.fighter    = fighter;           // Reference to Character instance
    this.cooldowns  = {};                // skillId → remaining ms
    this.passiveState = this._initPassive();
  }

  // ─────────────────────────────────────────────
  // INIT PASSIVE STATE
  // ─────────────────────────────────────────────
  _initPassive() {
    const passive = this.fighter.charData.passive;
    if (!passive) return {};
    switch (passive.id) {
      case 'heat':         return { stacks: 0, stackTimer: 0, hitCount: 0 };
      case 'burning_rage': return {};
      case 'frozen_armor': return {};
      case 'overcharge':   return { skillCount: 0 };
      case 'moonlight':    return { regenTimer: 0 };
      case 'earth_armor':  return {};
      case 'backstab':     return {};
      case 'wind_step':    return { active: false, timer: 0 };
      case 'dark_critical': return {};
      case 'inferno_core': return { activated: false };
      default:             return {};
    }
  }

  // ─────────────────────────────────────────────
  // UPDATE (called each frame)
  // ─────────────────────────────────────────────
  update(dt) {
    // Tick down all cooldowns
    for (const id in this.cooldowns) {
      this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);
    }

    // Update passive
    this._updatePassive(dt);
  }

  _updatePassive(dt) {
    const passive = this.fighter.charData.passive;
    if (!passive) return;
    const ps = this.passiveState;

    switch (passive.id) {
      case 'heat':
        if (ps.stacks > 0 && ps.stackTimer > 0) {
          ps.stackTimer -= dt;
          if (ps.stackTimer <= 0) { ps.stacks = 0; ps.stackTimer = 0; }
        }
        break;

      case 'moonlight':
        ps.regenTimer += dt;
        if (ps.regenTimer >= passive.regenInterval) {
          ps.regenTimer = 0;
          this.fighter.gainEnergy(passive.regenAmount);
        }
        break;

      case 'wind_step':
        if (ps.active) {
          ps.timer -= dt;
          if (ps.timer <= 0) {
            ps.active = false;
            this.fighter.removeSpeedBoost('wind_step');
          }
        }
        break;
    }
  }

  // ─────────────────────────────────────────────
  // CAN USE SKILL?
  // ─────────────────────────────────────────────
  canUse(skillIndex) {
    const skill = this.fighter.charData.skills[skillIndex];
    if (!skill) return false;
    if ((this.cooldowns[skill.id] || 0) > 0) return false;
    if (this.fighter.energy < skill.energyCost) return false;
    if (this.fighter.state === 'knockdown') return false;
    if (this.fighter.state === 'hit' && !skill.isUltimate) return false;
    return true;
  }

  // ─────────────────────────────────────────────
  // EXECUTE SKILL
  // Returns: { success, projectile?, dash? }
  // ─────────────────────────────────────────────
  execute(skillIndex) {
    const skill = this.fighter.charData.skills[skillIndex];
    if (!skill) return { success: false };
    if (!this.canUse(skillIndex)) return { success: false };

    // Consume energy
    this.fighter.spendEnergy(skill.energyCost);
    // Energy gain on hit only — NOT here (see BattleEngine._applyHit)
    // Exception: skills with type !== 'basic' gain a small amount on use (commitment reward)
    if (skill.type !== 'basic') {
      this.fighter.gainEnergy(skill.energyGain);
    }
    // Set cooldown
    this.cooldowns[skill.id] = skill.cooldown;
    // Set fighter state — map skill type/index to correct sprite row
    // Row 3=attack(basic), Row 4=skill(skill1), Row 5=skill2, Row 6=ultimate
    let animState = 'attack';
    if (skill.type === 'ultimate') {
      animState = 'ultimate';
    } else if (skill.type === 'skill') {
      // skill index 0=basic, 1=skill1(row4), 2=skill2(row5), 3=skill3(row5), 4=ultimate
      // Map index 2 and 3 to 'skill2' row, index 1 to 'skill'
      animState = (skillIndex === 2 || skillIndex === 3) ? 'skill2' : 'skill';
    }
    this.fighter.setState(animState);
    this.fighter.attackTimer    = skill.startup + skill.active + skill.recovery;
    this.fighter.attackActiveAt = skill.startup;
    this.fighter.attackActiveFor = skill.active;
    this.fighter.currentSkill   = skill;

    AudioManager.playHitEffect(skill.hitEffect);
    AudioManager.playSFX(skill.isUltimate ? 'ultimate' : 'skill_fire');

    // Screen flash for ultimates
    if (skill.isUltimate && skill.screenFlash) {
      EffectManager.screenFlash(skill.screenFlash);
    }

    // Overcharge passive
    this._handleOvercharge(skill);

    const result = { success: true, skill };

    // Dash skills
    if (skill.isDash) {
      result.dash = {
        distance: skill.dashDistance * (this.fighter.facingRight ? 1 : -1),
        delay:    skill.startup,
      };
    }

    // Projectile skills
    if (skill.isProjectile) {
      result.projectile = {
        x:       this.fighter.x + (this.fighter.facingRight ? this.fighter.width : 0),
        y:       this.fighter.y + this.fighter.height * 0.35,
        vx:      skill.projectileSpeed * (this.fighter.facingRight ? 1 : -1),
        skill,
        ownerId: this.fighter.id,
        color:   ELEMENT_COLORS[this.fighter.charData.element] || '#ff6b2b',
        width:   20,
        height:  12,
        life:    1200,
      };
    }

    return result;
  }

  // ─────────────────────────────────────────────
  // ON HIT — passive triggers
  // ─────────────────────────────────────────────
  onLandHit(skill) {
    const passive = this.fighter.charData.passive;
    if (!passive) return;

    if (passive.id === 'heat') {
      this.passiveState.hitCount++;
      if (this.passiveState.hitCount >= 3) {
        this.passiveState.hitCount  = 0;
        this.passiveState.stacks    = Math.min(
          (this.passiveState.stacks || 0) + 1,
          passive.maxStacks
        );
        this.passiveState.stackTimer = passive.duration;
      }
    }

    if (passive.id === 'overcharge') {
      this.passiveState.skillCount++;
      if (this.passiveState.skillCount >= passive.triggerEvery) {
        this.passiveState.skillCount = 0;
        if (Math.random() < passive.chance) {
          // Reduce all skill cooldowns by 50%
          for (const id in this.cooldowns) {
            this.cooldowns[id] *= (1 - passive.cdReduction);
          }
        }
      }
    }
  }

  _handleOvercharge(skill) {
    if (this.fighter.charData.passive?.id === 'overcharge' && skill.type !== 'basic') {
      this.onLandHit(skill);
    }
  }

  // On dodge (wind step)
  onDodge() {
    const passive = this.fighter.charData.passive;
    if (passive?.id === 'wind_step') {
      this.passiveState.active = true;
      this.passiveState.timer  = passive.duration;
      this.fighter.applySpeedBoost('wind_step', passive.speedBonus);
    }
  }

  // On take damage (burning rage)
  onTakeDamage() {
    const passive = this.fighter.charData.passive;
    if (passive?.id === 'inferno_core' && !this.passiveState.activated) {
      if (this.fighter.hp / this.fighter.maxHP <= passive.threshold) {
        this.passiveState.activated = true;
        this.fighter.attackMultiplier = (this.fighter.attackMultiplier || 1) * (1 + passive.attackBonus);
      }
    }
  }

  // ─────────────────────────────────────────────
  // DAMAGE MULTIPLIER from passives
  // ─────────────────────────────────────────────
  getDamageMultiplier() {
    const passive = this.fighter.charData.passive;
    let mult = 1.0;
    if (!passive) return mult;

    switch (passive.id) {
      case 'heat': {
        const stacks = this.passiveState.stacks || 0;
        mult += stacks * passive.stackBonus;
        break;
      }
      case 'burning_rage': {
        const lostPct = 1 - (this.fighter.hp / this.fighter.maxHP);
        const stacks  = Math.floor(lostPct / 0.10);
        mult += stacks * passive.bonusPerTenPercent;
        break;
      }
    }

    return mult;
  }

  // ─────────────────────────────────────────────
  // CRIT CHANCE from passives
  // ─────────────────────────────────────────────
  getCritChance() {
    const passive = this.fighter.charData.passive;
    if (passive?.id === 'dark_critical') return passive.critChance;
    return 0.05;  // baseline 5%
  }

  getCritMultiplier() {
    const passive = this.fighter.charData.passive;
    if (passive?.id === 'dark_critical') return passive.critMulti;
    return 1.5;
  }

  // ─────────────────────────────────────────────
  // BLOCK REDUCTION from passives
  // ─────────────────────────────────────────────
  getBlockReduction() {
    const passive = this.fighter.charData.passive;
    if (passive?.id === 'frozen_armor') return passive.blockBonus;
    return 0;
  }

  // ─────────────────────────────────────────────
  // INCOMING DAMAGE REDUCTION (earth armor)
  // ─────────────────────────────────────────────
  getArmorReduction() {
    const passive = this.fighter.charData.passive;
    if (passive?.id === 'earth_armor') return passive.damageReduction;
    return 0;
  }

  // ─────────────────────────────────────────────
  // COOLDOWN PERCENT (for HUD overlay)
  // ─────────────────────────────────────────────
  getCooldownPct(skillIndex) {
    const skill = this.fighter.charData.skills[skillIndex];
    if (!skill) return 0;
    const remaining = this.cooldowns[skill.id] || 0;
    if (remaining <= 0) return 0;
    return remaining / skill.cooldown;
  }

  // ─────────────────────────────────────────────
  // RESET (new round)
  // ─────────────────────────────────────────────
  resetCooldowns() {
    this.cooldowns    = {};
    this.passiveState = this._initPassive();
  }
}
