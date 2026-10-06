// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — BATTLE ENGINE
// Core game loop: update + render, separated via requestAnimationFrame
// Physics, hit detection, round system (best of 3),
// projectiles, burning ground, damage numbers, HUD updates
// ═══════════════════════════════════════════════════════════════

const BattleEngine = (() => {

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  let _canvas, _ctx;
  let _player, _enemy;
  let _ai;
  let _level;
  let _running     = false;
  let _paused      = false;
  let _rafId       = null;
  let _lastTime    = 0;
  let _isBoss      = false;  // stored at module level so _doStart can access it

  // Round system
  let _currentRound    = 1;
  const _totalRounds   = 3;
  let _roundsWonPlayer = 0;
  let _roundsWonEnemy  = 0;
  let _roundTimer      = 99000;  // ms
  let _roundPhase      = 'countdown';  // countdown | fighting | roundEnd | matchEnd
  let _countdownVal    = 3;
  let _countdownTimer  = 0;
  let _roundEndTimer   = 0;

  // Projectiles
  let _projectiles = [];

  // Burning ground mechanic (Level 9 / 10)
  let _burningGround     = false;
  let _burningDmgPerSec  = 0;
  let _burningTimer      = 0;

  // Battle stats for Victory screen
  let _damageDealt       = 0;
  let _battleStartTime   = 0;

  // Message overlay
  let _messageTimer = 0;

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  function init(canvas, playerCharId, levelData) {
    _canvas = canvas;
    _ctx    = canvas.getContext('2d');
    _level  = levelData;

    _resizeCanvas();
    window.addEventListener('resize', _resizeCanvas);

    const playerCharData = getCharacter(playerCharId);
    const enemyCharData  = getCharacter(levelData ? levelData.enemy.characterId : playerCharId);

    _player = new Character(playerCharData, 'player', true,  _canvas.width, _canvas.height);
    _enemy  = new Character(enemyCharData,  'enemy',  false, _canvas.width, _canvas.height);

    // Apply level multipliers to enemy
    if (levelData && levelData.enemy) {
      const e = levelData.enemy;
      _enemy.applyMultipliers(
        e.hpMultiplier     || 1.0,
        e.attackMultiplier || 1.0,
        e.speedMultiplier  || 1.0
      );
    }

    // Init AI
    const diffNum = levelData ? levelData.difficultyNum : 3;
    _isBoss       = levelData ? (levelData.isBossLevel || levelData.isFinalBoss || false) : false;
    _ai = new CpuAI(_enemy, _player, diffNum, _isBoss);
    if (levelData && levelData.bossMechanics) {
      _ai.setLevelMechanics(levelData.bossMechanics);
    }

    // Init effect manager with canvas
    EffectManager.init(canvas);

    // Init AssetManager sprites (generates placeholders + tries loading real files)
    AssetManager.init(() => {
      // Sprites ready — start battle
      _doStart();
    });
  }

  function _doStart() {
    _currentRound     = 1;
    _roundsWonPlayer  = 0;
    _roundsWonEnemy   = 0;
    _projectiles      = [];
    _burningGround    = false;
    _damageDealt      = 0;
    _battleStartTime  = Date.now();

    // Update HUD labels
    _updateHUDLabels();

    // Show boss HP bar if boss level
    const bossBar = document.getElementById('bossHPBarWrap');
    if (bossBar) {
      bossBar.classList.toggle('hidden', !_isBoss);
    }

    _startRound();

    // Start the render loop now that everything is initialized
    start();
  }

  function _resizeCanvas() {
    if (!_canvas) return;
    const topH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hud-top-h')) || 90;
    const botH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hud-bot-h')) || 110;
    _canvas.width  = Math.max(320, window.innerWidth);
    _canvas.height = Math.max(200, window.innerHeight - topH - botH);
    // groundY: 0.72 when PNG background is loaded (PNG ground is higher up),
    // 0.78 for procedural canvas backgrounds
    const hasBg = (typeof AssetManager !== 'undefined') && AssetManager.getBackground && AssetManager.getBackground(_level ? _level.id : 'level1');
    const groundFrac = hasBg ? 0.72 : 0.78;
    if (_player) { _player.groundY = _canvas.height * groundFrac; _player.canvasW = _canvas.width; _player.canvasH = _canvas.height; }
    if (_enemy)  { _enemy.groundY  = _canvas.height * groundFrac; _enemy.canvasW  = _canvas.width; _enemy.canvasH  = _canvas.height; }
  }

  // ─────────────────────────────────────────────
  // ROUND MANAGEMENT
  // ─────────────────────────────────────────────
  function _startRound() {
    _player.resetForRound();
    _enemy.resetForRound();
    _projectiles      = [];
    _burningGround    = false;
    _roundTimer       = 99000;
    _roundPhase       = 'countdown';
    _countdownVal     = 3;
    _countdownTimer   = 0;
    EffectManager.resetCombo();
    EffectManager.clearParticles();
    _updateRoundLabel();
    _updateRoundDots();
    _showCountdown();
  }

  function _showCountdown() {
    const overlay = document.getElementById('battleOverlay');
    const text    = document.getElementById('battleOverlayText');
    if (!overlay || !text) return;

    overlay.style.opacity = '1';
    _countdownVal   = 3;
    _countdownTimer = 800;

    AudioManager.playSFX('round_start');

    let step = 0;
    const nums = ['3', '2', '1', 'FIGHT!'];
    function tick() {
      if (step < nums.length) {
        text.textContent  = nums[step];
        text.style.opacity   = '1';
        text.style.transform = 'scale(1)';
        text.style.animation = 'none';
        void text.offsetWidth;
        text.style.animation = 'countdownPop 0.5s ease';
        if (nums[step] !== 'FIGHT!') AudioManager.playSFX('countdown');
        step++;
        setTimeout(tick, step < nums.length ? 700 : 900);
      } else {
        overlay.style.opacity = '0';
        _roundPhase = 'fighting';
      }
    }
    setTimeout(tick, 200);
  }

  function _endRound(winner) {
    // winner: 'player' | 'enemy' | 'draw'
    _roundPhase = 'roundEnd';
    InputManager.setActive(false);

    let msg = '';
    if (winner === 'player') {
      _roundsWonPlayer++;
      msg = `${_player.charData.name} WINS ROUND ${_currentRound}!`;
      AudioManager.playSFX('ko');
    } else if (winner === 'enemy') {
      _roundsWonEnemy++;
      msg = `${_enemy.charData.name} WINS ROUND ${_currentRound}!`;
      AudioManager.playSFX('ko');
    } else {
      msg = `DRAW — ROUND ${_currentRound}`;
    }

    _updateRoundDots();
    showBattleMessage(msg, 1800);

    AudioManager.playSFX('round_start');

    _roundEndTimer = 2200;
  }

  function _checkRoundEnd() {
    if (_player.isDead) { _endRound('enemy'); return; }
    if (_enemy.isDead)  { _endRound('player'); return; }
    if (_roundTimer <= 0) {
      // Timeout: higher HP wins
      if (_player.hp > _enemy.hp)       _endRound('player');
      else if (_enemy.hp > _player.hp)  _endRound('enemy');
      else                              _endRound('draw');
    }
  }

  function _checkMatchEnd() {
    const winsNeeded = Math.ceil(_totalRounds / 2);  // 2
    if (_roundsWonPlayer >= winsNeeded) {
      _endMatch('player');
    } else if (_roundsWonEnemy >= winsNeeded) {
      _endMatch('enemy');
    } else if (_currentRound >= _totalRounds) {
      // Tiebreaker: whoever won more rounds
      if (_roundsWonPlayer > _roundsWonEnemy) _endMatch('player');
      else _endMatch('enemy');
    } else {
      _currentRound++;
      setTimeout(() => {
        InputManager.setActive(true);
        _startRound();
      }, 1000);
    }
  }

  function _endMatch(winner) {
    _roundPhase = 'matchEnd';
    _running    = false;
    InputManager.setActive(false);
    cancelAnimationFrame(_rafId);
    window.removeEventListener('resize', _resizeCanvas);

    const playerHPPct = _player.hp / _player.maxHP;
    const result = {
      winner,
      roundsWon:      winner === 'player' ? _roundsWonPlayer : _roundsWonEnemy,
      playerHPPercent: playerHPPct,
      damageDealt:    _damageDealt,
      timeUsed:       Date.now() - _battleStartTime,
    };

    GameManager.setBattleResult(result);

    setTimeout(() => {
      if (winner === 'player') {
        GameManager.navigate('VICTORY');
      } else {
        GameManager.navigate('DEFEAT');
      }
    }, 1500);
  }

  // ─────────────────────────────────────────────
  // GAME LOOP
  // ─────────────────────────────────────────────
  function start() {
    // AssetManager.init() already calls _doStart via callback.
    // start() just kicks off the render loop once _doStart has run.
    _running  = true;
    _paused   = false;
    _lastTime = performance.now();
    InputManager.setActive(true);
    _rafId = requestAnimationFrame(_loop);
  }

  function _loop(timestamp) {
    if (!_running) return;
    const dt = Math.min(timestamp - _lastTime, 50);  // cap at 50ms (20fps min)
    _lastTime = timestamp;

    if (!_paused) {
      _update(dt);
    }
    _render();

    _rafId = requestAnimationFrame(_loop);
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────
  function _update(dt) {
    if (_roundPhase === 'countdown') return;

    if (_roundPhase === 'roundEnd') {
      _roundEndTimer -= dt;
      if (_roundEndTimer <= 0) {
        _roundPhase = 'checkingMatch'; // prevent re-entry
        _checkMatchEnd();
      }
      return;
    }

    if (_roundPhase === 'checkingMatch') return;

    if (_roundPhase === 'matchEnd') return;

    // ── Round timer ──
    _roundTimer -= dt;
    _updateTimerDisplay();

    // ── Get player inputs ──
    const pLeft   = InputManager.isHeld('left');
    const pRight  = InputManager.isHeld('right');
    const pJump   = InputManager.wasJustPressed('jump');
    const pBlock  = InputManager.isHeld('block');

    // ── Process player skill inputs ──
    if (InputManager.wasJustPressed('attack'))   _executePlayerSkill(0);
    if (InputManager.wasJustPressed('skill1'))   _executePlayerSkill(1);
    if (InputManager.wasJustPressed('skill2'))   _executePlayerSkill(2);
    if (InputManager.wasJustPressed('skill3'))   _executePlayerSkill(3);
    if (InputManager.wasJustPressed('ultimate')) _executePlayerSkill(4);

    // Perfect block trigger
    if (InputManager.wasJustPressed('block')) {
      _player.triggerPerfectBlock();
    }

    // ── Update AI ──
    _ai.update(dt);

    // ── Execute AI skill inputs ──
    if (_ai.inputAttack)   _executeEnemySkill(0);
    if (_ai.inputSkill1)   _executeEnemySkill(1);
    if (_ai.inputSkill2)   _executeEnemySkill(2);
    if (_ai.inputSkill3)   _executeEnemySkill(3);
    if (_ai.inputUltimate) _executeEnemySkill(4);

    // ── Auto-face opponent ──
    _player.faceOpponent(_enemy.x + _enemy.width / 2);
    _enemy.faceOpponent(_player.x + _player.width / 2);

    // ── Sync groundY every frame (PNG bg may load after init) ──
    const hasBgNow = AssetManager.getBackground(_level ? _level.id : 'level1');
    const gFrac    = hasBgNow ? 0.85 : 0.78;
    const gY       = _canvas.height * gFrac;
    if (_player) _player.groundY = gY;
    if (_enemy)  _enemy.groundY  = gY;

    // ── Update characters ──
    _player.update(dt, pLeft,    pRight,    pJump,    pBlock);
    _enemy.update( dt, _ai.inputLeft, _ai.inputRight, _ai.inputJump, _ai.inputBlock);

    // ── Hit detection ──
    _checkHits();

    // ── Projectiles ──
    _updateProjectiles(dt);

    // ── Burning ground damage ──
    if (_burningGround) _applyBurningGround(dt);

    // ── Effects ──
    EffectManager.update(dt);

    // ── HUD update ──
    _updateHUD();

    // ── Check round end ──
    _checkRoundEnd();

    // ── Clear input frame ──
    InputManager.clearFrame();
  }

  // ─────────────────────────────────────────────
  // SKILL EXECUTION
  // ─────────────────────────────────────────────
  function _executePlayerSkill(idx) {
    const result = _player.skillSystem.execute(idx);
    if (!result.success) return;

    // Ultimate portrait overlay
    if (result.skill && result.skill.isUltimate) {
      EffectManager.showUltimatePortrait(_player.charData, true, result.skill.name);
    }

    if (result.projectile) _projectiles.push({ ...result.projectile, isPlayerOwned: true });
    if (result.dash && result.skill) {
      setTimeout(() => {
        if (_player) _player.x = Math.max(10, Math.min(_canvas.width - _player.width - 10, _player.x + result.dash.distance));
      }, result.dash.delay);
    }
    _updateSkillButtons();
  }

  function _executeEnemySkill(idx) {
    const result = _enemy.skillSystem.execute(idx);
    if (!result.success) return;

    // Ultimate portrait overlay
    if (result.skill && result.skill.isUltimate) {
      EffectManager.showUltimatePortrait(_enemy.charData, false, result.skill.name);
    }

    if (result.projectile) _projectiles.push({ ...result.projectile, isPlayerOwned: false });
    if (result.dash && result.skill) {
      setTimeout(() => {
        if (_enemy) _enemy.x = Math.max(10, Math.min(_canvas.width - _enemy.width - 10, _enemy.x + result.dash.distance));
      }, result.dash.delay);
    }
  }

  // ─────────────────────────────────────────────
  // HIT DETECTION
  // ─────────────────────────────────────────────
  function _checkHits() {
    // Player attacks enemy
    const playerHB = _player.getHitbox();
    if (playerHB) {
      const enemyHB = _enemy.getHurtbox();
      if (_rectsOverlap(playerHB, enemyHB) && !_player._hitThisSwing) {
        _player._hitThisSwing = true;
        _applyHit(_player, _enemy, _player.currentSkill);
        _player.skillSystem.onLandHit(_player.currentSkill);
      }
    } else {
      _player._hitThisSwing = false;
    }

    // Enemy attacks player
    const enemyHB = _enemy.getHitbox();
    if (enemyHB) {
      const playerHB2 = _player.getHurtbox();
      if (_rectsOverlap(enemyHB, playerHB2) && !_enemy._hitThisSwing) {
        _enemy._hitThisSwing = true;
        _applyHit(_enemy, _player, _enemy.currentSkill);
        _enemy.skillSystem.onLandHit(_enemy.currentSkill);
      }
    } else {
      _enemy._hitThisSwing = false;
    }
  }

  function _applyHit(attacker, defender, skill) {
    if (!skill) return;

    const passMult  = attacker.skillSystem.getDamageMultiplier();
    const critChance= attacker.skillSystem.getCritChance();
    const isCrit    = Math.random() < critChance;
    const critMult  = attacker.skillSystem.getCritMultiplier();

    const dmg = calcDamage(
      skill.damage,
      attacker.effectiveAttack,
      defender.effectiveDefense,
      {
        isCritical:        isCrit,
        critMultiplier:    critMult,
        passiveMultiplier: passMult,
        isBlocking:        defender.isBlocking,
        isPerfectBlock:    defender.perfectBlockTimer > 0,
        // Frozen Armor passive adds extra block reduction — pass it to calcDamage
        extraBlockReduction: defender.skillSystem.getBlockReduction(),
      }
    );

    const actualDmg = defender.takeDamage(dmg);

    // Track for stats
    if (attacker.isPlayer) _damageDealt += actualDmg;

    // Knockback
    const direction = attacker.x < defender.x ? 'right' : 'left';
    defender.applyKnockback(direction, skill.knockback || 'light');

    // Spawn hit effects
    const hitX = defender.x + defender.width / 2;
    const hitY = defender.y + defender.height * 0.4;
    EffectManager.spawnHitEffect(hitX, hitY, skill.hitEffect, skill.isUltimate, attacker.charData.id);

    // Damage number
    EffectManager.showDamage(actualDmg, hitX, hitY, { critical: isCrit });
    if (isCrit) AudioManager.playSFX('critical');

    // Energy gain for attacker on successful hit (use skill's defined energyGain)
    attacker.gainEnergy(skill.energyGain || 5);

    // Combo counter (player hits only)
    if (attacker.isPlayer) {
      EffectManager.addComboHit();
    }

    // Screen shake for heavy hits
    if (skill.screenShake || skill.knockback === 'heavy') {
      EffectManager.screenShake(skill.isUltimate ? 12 : 6, 300);
    }

    // Slow debuff
    if (skill.slowDuration) {
      defender.applySlow(skill.slowDuration, skill.slowAmount || 0.5);
    }
  }

  function _rectsOverlap(a, b) {
    return a.x < b.x + b.width  &&
           a.x + a.width  > b.x  &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  // ─────────────────────────────────────────────
  // PROJECTILES
  // ─────────────────────────────────────────────
  function _updateProjectiles(dt) {
    const dtFrames = dt / 16.67;  // normalize to ~60fps frames
    _projectiles = _projectiles.filter(proj => {
      proj.x    += proj.vx * dtFrames;
      proj.life -= dt;

      // Check hit
      const target = proj.isPlayerOwned ? _enemy : _player;
      const targetHB = target.getHurtbox();
      const projRect = { x: proj.x, y: proj.y, width: proj.width, height: proj.height };

      if (_rectsOverlap(projRect, targetHB)) {
        const attacker = proj.isPlayerOwned ? _player : _enemy;
        _applyHit(attacker, target, proj.skill);
        // Trigger passive on-land-hit for projectile skills too
        attacker.skillSystem.onLandHit(proj.skill);
        EffectManager.spawnHitEffect(proj.x, proj.y, proj.skill.hitEffect, false, attacker.charData.id);
        return false;  // remove projectile
      }

      // Out of arena
      if (proj.x < -50 || proj.x > _canvas.width + 50) return false;
      if (proj.life <= 0) return false;

      return true;
    });
  }

  // ─────────────────────────────────────────────
  // BURNING GROUND
  // ─────────────────────────────────────────────
  function activateBurningGround(dmgPerSec) {
    _burningGround    = true;
    _burningDmgPerSec = dmgPerSec || 15;
    _burningTimer     = 0;
  }

  function _applyBurningGround(dt) {
    _burningTimer += dt;
    if (_burningTimer >= 1000) {
      _burningTimer -= 1000;
      const dmg = Math.round(_burningDmgPerSec);
      _player.takeDamage(dmg);
      EffectManager.showDamage(dmg, _player.x + _player.width / 2, _player.y, {});
      EffectManager.spawnParticles(
        _player.x + _player.width / 2,
        _player.y + _player.height,
        '#ef4444', 5, { speed: 2, life: 0.5, gravity: -0.1 }
      );
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  function _render() {
    if (!_ctx) return;
    const w = _canvas.width;
    const h = _canvas.height;

    _ctx.clearRect(0, 0, w, h);

    // Calculate camera offset based on midpoint between players
    // Background pans slightly as characters move (parallax)
    let cameraOffsetX = 0;
    if (_player && _enemy) {
      const midX      = (_player.x + _player.width / 2 + _enemy.x + _enemy.width / 2) / 2;
      const centerX   = w / 2;
      // Offset = how far midpoint is from center, scaled down (0.15 = subtle parallax)
      cameraOffsetX   = (midX - centerX) * 0.2;
      // Clamp so background doesn't go too far
      const maxOffset = w * 0.12;
      cameraOffsetX   = Math.max(-maxOffset, Math.min(maxOffset, cameraOffsetX));
    }

    // Background with parallax offset
    EffectManager.drawArenaBackground(_ctx, w, h, _level ? _level.id : 'level1', cameraOffsetX);

    // Burning ground effect
    if (_burningGround) {
      const hasBg2 = (typeof AssetManager !== 'undefined') && AssetManager.getBackground && AssetManager.getBackground(_level ? _level.id : 'level1');
      const gy = _canvas.height * (hasBg2 ? 0.72 : 0.78);
      const grad = _ctx.createLinearGradient(0, gy - 20, 0, gy + 10);
      grad.addColorStop(0, 'rgba(239,68,68,0)');
      grad.addColorStop(0.5, `rgba(239,68,68,${0.15 + 0.1 * Math.sin(Date.now() / 200)})`);
      grad.addColorStop(1, 'rgba(239,68,68,0)');
      _ctx.fillStyle = grad;
      _ctx.fillRect(0, gy - 20, w, 30);
    }

    // Projectiles
    _renderProjectiles();

    // Characters
    if (_player) _player.draw(_ctx);
    if (_enemy)  _enemy.draw(_ctx);

    // Particles
    EffectManager.drawParticles(_ctx);
  }

  function _renderProjectiles() {
    _projectiles.forEach(proj => {
      const color = proj.color || '#ff6b2b';
      _ctx.save();
      _ctx.fillStyle   = color;
      _ctx.shadowColor = color;
      _ctx.shadowBlur  = 10;
      _ctx.beginPath();
      _ctx.ellipse(proj.x + proj.width/2, proj.y + proj.height/2, proj.width/2, proj.height/2, 0, 0, Math.PI*2);
      _ctx.fill();
      _ctx.shadowBlur  = 0;
      _ctx.restore();
    });
  }

  // ─────────────────────────────────────────────
  // HUD UPDATES
  // ─────────────────────────────────────────────
  function _updateHUDLabels() {
    if (!_player || !_enemy) return;
    const pn = document.getElementById('hudPlayerName');
    const en = document.getElementById('hudEnemyName');
    if (pn) pn.textContent = _player.charData.name;
    if (en) en.textContent = _enemy.charData.name;

    // Portrait thumbnails
    _setHUDPortrait('hudPlayerPortrait', _player.charData);
    _setHUDPortrait('hudEnemyPortrait',  _enemy.charData);

    // Skill button icons
    if (_player) {
      const skills   = _player.charData.skills;
      const btnIds   = ['btnAttack','btnSkill1','btnSkill2','btnSkill3','btnUltimate'];
      btnIds.forEach((id, i) => {
        const btn  = document.getElementById(id);
        const skill = skills[i];
        if (btn && skill) {
          const icon = btn.querySelector('.skill-icon');
          if (icon) {
            // skill0 = attack, skill1-3 = skills, skill4 = ultimate
            const imgSrc = `assets/skills/${_player.charData.id}_skill${i}.png`;
            const img = new Image();
            img.onload = () => {
              icon.innerHTML = `<img src="${imgSrc}" alt="${skill.name}" class="skill-icon-img" />`;
            };
            img.onerror = () => {
              icon.textContent = skill.emoji;
            };
            img.src = imgSrc;
          }
        }
      });
    }
  }

  function _setHUDPortrait(elId, charData) {
    const el = document.getElementById(elId);
    if (!el || !charData) return;

    // Try portrait → select → cutscene (in order of preference for small thumbnail)
    const src = AssetManager.getPortraitSrc(charData.id, 'portrait')
             || AssetManager.getPortraitSrc(charData.id, 'select')
             || AssetManager.getPortraitSrc(charData.id, 'cutscene');

    if (src) {
      el.innerHTML = `<img src="${src}" alt="${charData.name}" />`;
    } else {
      // Show emoji while waiting for portrait to load
      el.innerHTML = `<div class="hud-portrait-emoji" style="color:${charData.color}">${charData.emoji}</div>`;
      // Auto-upgrade when real portrait loads
      AssetManager.onPortraitLoaded((id) => {
        if (id === charData.id) _setHUDPortrait(elId, charData);
      });
    }
  }

  function _updateHUD() {
    if (!_player || !_enemy) return;

    // HP bars
    const pHPFill = document.getElementById('hudPlayerHPFill');
    const eHPFill = document.getElementById('hudEnemyHPFill');
    const pHPTxt  = document.getElementById('hudPlayerHPText');
    const eHPTxt  = document.getElementById('hudEnemyHPText');

    if (pHPFill) pHPFill.style.width = `${_player.hpPercent * 100}%`;
    if (eHPFill) eHPFill.style.width = `${_enemy.hpPercent  * 100}%`;
    if (pHPTxt)  pHPTxt.textContent  = `${_player.hp}/${_player.maxHP}`;
    if (eHPTxt)  eHPTxt.textContent  = `${_enemy.hp}/${_enemy.maxHP}`;

    // Energy bars
    const pEnFill = document.getElementById('hudPlayerEnergyFill');
    const eEnFill = document.getElementById('hudEnemyEnergyFill');
    const pEnTxt  = document.getElementById('hudPlayerEnergyText');
    const eEnTxt  = document.getElementById('hudEnemyEnergyText');

    if (pEnFill) {
      const pct = _player.energyPercent * 100;
      pEnFill.style.width = `${pct}%`;
      pEnFill.classList.toggle('full', pct >= 100);
    }
    if (eEnFill) eEnFill.style.width = `${_enemy.energyPercent * 100}%`;
    if (pEnTxt)  pEnTxt.textContent  = `${Math.floor(_player.energy)}/${_player.maxEnergy}`;
    if (eEnTxt)  eEnTxt.textContent  = `${Math.floor(_enemy.energy)}/${_enemy.maxEnergy}`;

    // Boss HP bar
    const bossHPFill = document.getElementById('bossHPFill');
    const bossPhase  = document.getElementById('bossPhaseIndicator');
    if (bossHPFill && _level && (_level.isBossLevel || _level.isFinalBoss)) {
      bossHPFill.style.width = `${_enemy.hpPercent * 100}%`;
      if (bossPhase && _ai) {
        const phase = _ai.phase3Active ? 'Phase 3' : _ai.phase2Active ? 'Phase 2' : 'Phase 1';
        bossPhase.textContent = phase;
      }
    }

    // Ultimate button state
    const ultBtn = document.getElementById('btnUltimate');
    if (ultBtn) {
      const isCharged = _player.energy >= _player.maxEnergy;
      ultBtn.disabled = !isCharged;
      ultBtn.classList.toggle('charged', isCharged);
    }

    _updateSkillButtons();
  }

  function _updateTimerDisplay() {
    const timerEl = document.getElementById('hudTimer');
    if (!timerEl) return;
    const secs = Math.ceil(_roundTimer / 1000);
    timerEl.textContent = Math.max(0, secs);
    timerEl.classList.toggle('low', secs <= 10);
  }

  function _updateRoundLabel() {
    const el = document.getElementById('hudRoundLabel');
    if (el) el.textContent = `ROUND ${_currentRound}/${_totalRounds}`;
  }

  function _updateRoundDots() {
    for (let i = 0; i < 3; i++) {
      const dot = document.getElementById(`rdot-${i}`);
      if (!dot) continue;
      dot.className = 'round-dot';
      if (i < _roundsWonPlayer) dot.classList.add('player-win');
      else if (i < _roundsWonEnemy) dot.classList.add('enemy-win');
    }
  }

  function _updateSkillButtons() {
    if (!_player) return;
    const btnIds = ['btnAttack','btnSkill1','btnSkill2','btnSkill3','btnUltimate'];
    btnIds.forEach((id, idx) => {
      const btn = document.getElementById(id);
      const cdEl = document.getElementById(['cdAttack','cdSkill1','cdSkill2','cdSkill3','cdUltimate'][idx]);
      if (!btn) return;

      const canUse  = _player.skillSystem.canUse(idx);
      const cdPct   = _player.skillSystem.getCooldownPct(idx);

      btn.classList.toggle('on-cooldown', cdPct > 0);
      btn.classList.toggle('ready',       canUse && cdPct === 0);
      btn.disabled = (idx === 4 && _player.energy < _player.maxEnergy);

      // Cooldown sweep overlay
      if (cdEl) {
        const clipPct = cdPct * 100;
        cdEl.style.clipPath = clipPct > 0
          ? `inset(0 0 ${100 - clipPct}% 0)`
          : 'inset(0 0 100% 0)';
      }
    });
  }

  // ─────────────────────────────────────────────
  // MESSAGE OVERLAY
  // ─────────────────────────────────────────────
  function showBattleMessage(text, duration) {
    const overlay = document.getElementById('battleOverlay');
    const textEl  = document.getElementById('battleOverlayText');
    if (!overlay || !textEl) return;

    textEl.textContent    = text;
    textEl.style.opacity  = '1';
    textEl.style.transform = 'scale(1)';
    textEl.style.animation = 'none';
    void textEl.offsetWidth;
    textEl.style.animation = 'overlayPop 0.3s ease';
    overlay.style.opacity  = '1';

    setTimeout(() => {
      textEl.style.opacity  = '0';
      overlay.style.opacity = '0';
    }, duration || 1500);
  }

  // ─────────────────────────────────────────────
  // PAUSE
  // ─────────────────────────────────────────────
  function pause() {
    if (!_running || _paused) return;
    _paused = true;
    InputManager.setActive(false);
    const panel = document.getElementById('pausePanel');
    if (panel) panel.classList.remove('hidden');
    AudioManager.stopMusic(0.5);
    _wirePauseButtons();
  }

  function resume() {
    _paused = false;
    InputManager.setActive(true);
    const panel = document.getElementById('pausePanel');
    if (panel) panel.classList.add('hidden');
    AudioManager.playMusic(_level && (_level.isBossLevel || _level.isFinalBoss) ? 'boss' : 'battle', true, true);
  }

  function _wirePauseButtons() {
    // Update quit button label based on game mode
    const quitBtn = document.querySelector('[data-pause-action="quit"]');
    if (quitBtn) {
      quitBtn.textContent = GameManager.isQuickBattle() ? 'QUIT TO VS MODE' : 'QUIT TO STORY MAP';
    }

    document.querySelectorAll('[data-pause-action]').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        const action = clone.dataset.pauseAction;
        switch (action) {
          case 'resume':    resume(); break;
          case 'restart':   stop(); GameManager.navigate('BATTLE'); break;
          case 'howToPlay': GameManager.navigate('HOW_TO_PLAY'); break;
          case 'settings':  GameManager.navigate('SETTINGS'); break;
          case 'quit': {
            const isQB = GameManager.isQuickBattle();
            const msg  = isQB
              ? 'Quit to VS Mode?'
              : 'Quit to Story Map? Progress will not be saved.';
            if (confirm(msg)) {
              stop();
              GameManager.navigate(isQB ? 'QUICK_BATTLE' : 'STORY_MAP');
            }
            break;
          }
        }
      });
    });
  }

  function stop() {
    _running = false;
    InputManager.setActive(false);
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    window.removeEventListener('resize', _resizeCanvas);
    EffectManager.clearParticles();
    EffectManager.resetCombo();
    // Hide pause panel
    const panel = document.getElementById('pausePanel');
    if (panel) panel.classList.add('hidden');
  }

  // Listen for pause input
  InputManager.on('pause', () => {
    if (!_running) return;
    if (_paused) resume();
    else pause();
  });

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    init,
    start,
    stop,
    pause,
    resume,
    showBattleMessage,
    activateBurningGround,
    getPlayer: () => _player,
    getEnemy:  () => _enemy,
    isRunning: () => _running,
    isPaused:  () => _paused,
  };

})();
