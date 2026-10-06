// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — EFFECT MANAGER
// Manages: floating damage numbers, screen flash, screen shake,
// hit sparks (canvas-drawn), combo counter, particle effects
// ═══════════════════════════════════════════════════════════════

const EffectManager = (() => {

  // ─────────────────────────────────────────────
  // DOM REFS
  // ─────────────────────────────────────────────
  let _dmgLayer    = null;
  let _flashEl     = null;
  let _canvas      = null;
  let _ctx         = null;
  let _shakeTimer  = 0;
  let _shakeAmt    = 0;
  let _particles   = [];

  function init(canvas) {
    _dmgLayer  = document.getElementById('damageNumberLayer');
    _flashEl   = document.getElementById('screenFlash');
    _canvas    = canvas;
    _ctx       = canvas ? canvas.getContext('2d') : null;
    _loadEffectImages();
  }

  // ─────────────────────────────────────────────
  // DAMAGE NUMBERS
  // ─────────────────────────────────────────────
  function showDamage(value, x, y, options = {}) {
    if (!_dmgLayer) return;

    const el = document.createElement('div');
    el.className = 'damage-number' + (options.critical ? ' critical' : '') + (options.heal ? ' heal' : '');

    let text = options.heal ? `+${value}` : `-${value}`;
    if (options.critical) text = `CRIT! ${text}`;
    el.textContent = text;

    // Convert canvas coords to screen coords
    const canvasRect = _canvas ? _canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const scaleX = canvasRect.width  / (_canvas ? _canvas.width  : window.innerWidth);
    const scaleY = canvasRect.height / (_canvas ? _canvas.height : window.innerHeight);

    const screenX = canvasRect.left + x * scaleX + (Math.random() * 40 - 20);
    const screenY = canvasRect.top  + y * scaleY - 20;

    el.style.left = `${screenX}px`;
    el.style.top  = `${screenY}px`;
    el.style.color = options.critical ? '#facc15' : options.heal ? '#22c55e' : '#fff';

    _dmgLayer.appendChild(el);
    setTimeout(() => {
      if (_dmgLayer.contains(el)) _dmgLayer.removeChild(el);
    }, 900);
  }

  // ─────────────────────────────────────────────
  // SCREEN FLASH
  // ─────────────────────────────────────────────
  function screenFlash(color = 'white') {
    if (!_flashEl) return;
    _flashEl.className = `screen-flash ${color}`;
    void _flashEl.offsetWidth; // force reflow
    setTimeout(() => {
      if (_flashEl) _flashEl.className = 'screen-flash hidden';
    }, 350);
  }

  // ─────────────────────────────────────────────
  // SCREEN SHAKE
  // ─────────────────────────────────────────────
  function screenShake(intensity = 8, duration = 400) {
    _shakeAmt   = intensity;
    _shakeTimer = duration;
  }

  function applyShake(canvas) {
    if (_shakeTimer <= 0 || !canvas) return;
    const dx = (Math.random() * 2 - 1) * _shakeAmt;
    const dy = (Math.random() * 2 - 1) * _shakeAmt;
    canvas.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function updateShake(dt) {
    if (_shakeTimer > 0) {
      _shakeTimer -= dt;
      if (_shakeTimer <= 0) {
        _shakeTimer = 0;
        if (_canvas) _canvas.style.transform = '';
      }
    }
    if (_canvas && _shakeTimer > 0) applyShake(_canvas);
  }

  // ─────────────────────────────────────────────
  // CANVAS PARTICLES
  // Drawn each frame by BattleEngine render loop
  // ─────────────────────────────────────────────
  function spawnParticles(x, y, color, count, options = {}) {
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = (options.speed || 3) + Math.random() * (options.speedVar || 3);
      _particles.push({
        x, y,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed - (options.upBias || 2),
        life:    options.life    || 0.6 + Math.random() * 0.4,
        maxLife: options.maxLife || 1.0,
        size:    options.size    || 3 + Math.random() * 4,
        color:   color,
        gravity: options.gravity !== undefined ? options.gravity : 0.2,
        shape:   options.shape || 'circle',
      });
    }
  }

  function updateParticles(dt) {
    const sec = dt / 1000;
    _particles = _particles.filter(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += p.gravity;
      p.life -= sec;
      return p.life > 0;
    });
  }

  function drawParticles(ctx) {
    _particles.forEach(p => {
      const alpha = Math.max(0, p.life / (p.maxLife || 1.0));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    // Draw image-based effects on top of particles
    _drawEffects(ctx);
  }

  function clearParticles() { _particles = []; }

  // ─────────────────────────────────────────────
  // HIT SPARKS (based on hit effect ID)
  // ─────────────────────────────────────────────
  const HIT_COLORS = {
    fire_small:        '#ff6b2b',
    fire_medium:       '#f97316',
    fire_large:        '#ef4444',
    fire_dash:         '#fb923c',
    fire_ultimate:     '#dc2626',
    ice_small:         '#7dd3fc',
    ice_medium:        '#38bdf8',
    ice_large:         '#0ea5e9',
    ice_wall:          '#bae6fd',
    ice_ultimate:      '#e0f2fe',
    lightning_small:   '#facc15',
    lightning_medium:  '#fbbf24',
    lightning_large:   '#f59e0b',
    lightning_dash:    '#fde68a',
    lightning_ultimate:'#fef08a',
    moon_small:        '#c084fc',
    moon_medium:       '#a855f7',
    moon_large:        '#9333ea',
    moon_shield:       '#ddd6fe',
    moon_ultimate:     '#ede9fe',
    earth_small:       '#86efac',
    earth_medium:      '#4ade80',
    earth_large:       '#22c55e',
    earth_wall:        '#bbf7d0',
    earth_ultimate:    '#dcfce7',
    shadow_small:      '#818cf8',
    shadow_medium:     '#6366f1',
    shadow_large:      '#4f46e5',
    shadow_dash:       '#a5b4fc',
    shadow_ultimate:   '#c7d2fe',
    wind_small:        '#6ee7b7',
    wind_medium:       '#34d399',
    wind_large:        '#10b981',
    wind_dash:         '#a7f3d0',
    wind_ultimate:     '#d1fae5',
    dark_small:        '#d8b4fe',
    dark_medium:       '#c084fc',
    dark_large:        '#a855f7',
    dark_dash:         '#e9d5ff',
    dark_ultimate:     '#f3e8ff',
  };

  function spawnHitEffect(x, y, hitEffectId, isUltimate = false, charId = null) {
    // Try image-based effect first
    if (charId) {
      const type = isUltimate ? 'ultimate'
                 : (hitEffectId && (hitEffectId.includes('medium') || hitEffectId.includes('large') || hitEffectId.includes('dash') || hitEffectId.includes('beam') || hitEffectId.includes('wall') || hitEffectId.includes('shield'))) ? 'skill'
                 : 'hit';
      const used = _spawnImageEffect(x, y, charId, type);
      if (used) return; // image effect spawned — skip particles
    }

    // Fallback: particle-based effect
    const color  = HIT_COLORS[hitEffectId] || '#ffffff';
    const count  = isUltimate ? 40 : (hitEffectId && hitEffectId.includes('large') ? 22 : (hitEffectId && hitEffectId.includes('medium') ? 14 : 8));
    const size   = isUltimate ? 14 : (hitEffectId && hitEffectId.includes('large') ? 10 : 6);
    const speed  = isUltimate ? 6 : 4;

    spawnParticles(x, y, color, count, {
      speed, speedVar: 3, size, life: isUltimate ? 0.8 : 0.5,
      maxLife: 1.0, gravity: 0.15, upBias: 1.5,
    });

    spawnParticles(x, y, '#ffffff', 4, {
      speed: speed * 1.5, speedVar: 1, size: size * 0.5, life: 0.2, maxLife: 0.2, gravity: 0,
    });
  }

  // ─────────────────────────────────────────────
  // EFFECT IMAGE SYSTEM
  // Loads: assets/effects/<charId>_<type>_<frame>.png
  // Types: hit, skill, ultimate
  // Played as animated sprite on canvas at hit position
  // ─────────────────────────────────────────────
  const _effectImages  = {};   // key: 'charId_type' → [HTMLImageElement, ...]
  const _activeEffects = [];   // currently playing effect animations

  const EFFECT_TYPES    = ['hit', 'skill', 'ultimate'];
  const EFFECT_CHARS    = ['ember','frost','blaze','volt','luna','terra','kai','kira','shadow','inferno'];
  const EFFECT_FRAMES   = { hit: 6, skill: 6, ultimate: 8 };
  const EFFECT_DURATION = { hit: 400, skill: 500, ultimate: 800 }; // ms total

  function _loadEffectImages() {
    EFFECT_CHARS.forEach(charId => {
      EFFECT_TYPES.forEach(type => {
        const maxFrames = EFFECT_FRAMES[type];
        const frames    = [];
        let   loaded    = 0;

        for (let i = 0; i < maxFrames; i++) {
          const img = new Image();
          img.onload  = () => { loaded++; };
          img.onerror = () => {};  // silent — frame just won't show
          img.src = `assets/effects/${charId}_${type}_${i}.png`;
          frames.push(img);
        }
        _effectImages[`${charId}_${type}`] = frames;
      });
    });
  }

  function _spawnImageEffect(x, y, charId, type) {
    const key    = `${charId}_${type}`;
    const frames = _effectImages[key];
    if (!frames || !frames.length) return false;

    // Check at least frame 0 loaded
    if (!frames[0] || !frames[0].complete || !frames[0].naturalWidth) return false;

    const duration = EFFECT_DURATION[type] || 500;
    // Size proportional to character (0.58 of canvas height — match character size)
    const canvasH = (_canvas && _canvas.height) ? _canvas.height : 550;
    const charH   = canvasH * 0.58;
    const charW   = charH * 0.65;
    const size    = type === 'ultimate' ? Math.round(charW * 1.6)
                  : type === 'skill'    ? Math.round(charW * 1.1)
                  :                       Math.round(charW * 0.7);

    _activeEffects.push({
      x, y,
      charId, type,
      frames,
      frameCount:  frames.length,
      duration,
      elapsed:     0,
      size,
    });
    return true;
  }

  function _updateEffects(dt) {
    for (let i = _activeEffects.length - 1; i >= 0; i--) {
      _activeEffects[i].elapsed += dt;
      if (_activeEffects[i].elapsed >= _activeEffects[i].duration) {
        _activeEffects.splice(i, 1);
      }
    }
  }

  function _drawEffects(ctx) {
    _activeEffects.forEach(eff => {
      const progress   = eff.elapsed / eff.duration;
      const frameIndex = Math.min(
        Math.floor(progress * eff.frameCount),
        eff.frameCount - 1
      );
      const img = eff.frames[frameIndex];
      if (!img || !img.complete || !img.naturalWidth) return;

      const alpha = progress < 0.2 ? progress / 0.2
                  : progress > 0.75 ? 1 - (progress - 0.75) / 0.25
                  : 1;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.drawImage(
        img,
        eff.x - eff.size / 2,
        eff.y - eff.size / 2,
        eff.size,
        eff.size
      );
      ctx.restore();
    });
  }

  // ─────────────────────────────────────────────
  let _comboCount   = 0;
  let _comboTimer   = 0;
  const COMBO_TIMEOUT = 2000;  // ms

  function addComboHit() {
    _comboCount++;
    _comboTimer = COMBO_TIMEOUT;
    updateComboDisplay();
    if (_comboCount >= 2) {
      AudioManager.playSFX('combo');
    }
    return _comboCount;
  }

  function resetCombo() {
    _comboCount = 0;
    _comboTimer = 0;
    const el = document.getElementById('comboCounter');
    if (el) el.classList.add('hidden');
  }

  function updateComboDisplay() {
    const el     = document.getElementById('comboCounter');
    const hitsEl = document.getElementById('comboHits');
    if (!el || !hitsEl) return;
    if (_comboCount >= 2) {
      hitsEl.textContent = _comboCount;
      el.classList.remove('hidden');
      // Trigger re-animation
      el.classList.remove('combo-pop');
      void el.offsetWidth;
      el.classList.add('combo-pop');
    } else {
      el.classList.add('hidden');
    }
  }

  function updateComboTimer(dt) {
    if (_comboTimer > 0) {
      _comboTimer -= dt;
      if (_comboTimer <= 0) {
        resetCombo();
      }
    }
  }

  // ─────────────────────────────────────────────
  // ARENA BACKGROUND (drawn on canvas each frame)
  // ─────────────────────────────────────────────
  // ─────────────────────────────────────────────
  // ARENA BACKGROUND THEMES
  // One unique painted background per level
  // levelId maps to a theme function
  // ─────────────────────────────────────────────
  const _bgThemes = {
    level1:  _bgStoneArena,
    level2:  _bgFireArena,
    level3:  _bgStormArena,
    level4:  _bgMoonArena,
    level5:  _bgRuinsArena,
    level6:  _bgShadowArena,
    level7:  _bgWindArena,
    level8:  _bgDarkArena,
    level9:  _bgVolcanoArena,
    level10: _bgFinalArena,
  };

  function drawArenaBackground(ctx, width, height, levelId = 'level1', offsetX = 0) {
    try {
      const bgImg = AssetManager.getBackground(levelId);
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const iw = bgImg.naturalWidth;
        const ih = bgImg.naturalHeight;
        // Scale up slightly to cover edges during parallax pan
        const scale = Math.max(width / iw, height / ih) * 1.15;
        const dw = iw * scale;
        const dh = ih * scale;
        // Apply parallax offset — background moves at 40% of camera offset
        const dx = (width - dw) / 2 - offsetX * 0.4;
        const dy = (height - dh) / 2;
        ctx.drawImage(bgImg, dx, dy, dw, dh);
        // Slight dark vignette so characters stand out
        const vig = ctx.createRadialGradient(width/2, height/2, height*0.2, width/2, height/2, width*0.8);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);
        return;
      }
    } catch(e) {}

    // Procedural fallback — painted canvas backgrounds per level
    const fn = _bgThemes[levelId] || _bgStoneArena;
    fn(ctx, width, height);
  }

  // ── Shared helpers ────────────────────────────

  function _fillSky(ctx, width, height, topColor, midColor, botColor) {
    const g = ctx.createLinearGradient(0, 0, 0, height * 0.78);
    g.addColorStop(0,   topColor);
    g.addColorStop(0.6, midColor);
    g.addColorStop(1,   botColor);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  function _fillGround(ctx, width, height, groundY, topColor, botColor) {
    const g = ctx.createLinearGradient(0, groundY, 0, height);
    g.addColorStop(0, topColor);
    g.addColorStop(1, botColor);
    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, width, height - groundY);
  }

  function _groundLine(ctx, width, groundY, color, glowColor) {
    // Hard edge
    ctx.fillStyle = color;
    ctx.fillRect(0, groundY, width, 3);
    // Glow
    if (glowColor) {
      const g = ctx.createLinearGradient(0, groundY - 28, 0, groundY + 8);
      g.addColorStop(0,   glowColor.replace('X', '0'));
      g.addColorStop(0.5, glowColor.replace('X', '0.12'));
      g.addColorStop(1,   glowColor.replace('X', '0'));
      ctx.fillStyle = g;
      ctx.fillRect(0, groundY - 28, width, 36);
    }
  }

  function _stars(ctx, width, height, count, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff';
    // Deterministic pseudo-random using sin
    for (let i = 0; i < count; i++) {
      const x = ((Math.sin(i * 127.1) * 0.5 + 0.5)) * width;
      const y = ((Math.sin(i * 311.7) * 0.5 + 0.5)) * height * 0.65;
      const r = 0.5 + (Math.sin(i * 74.3) * 0.5 + 0.5) * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function _pillars(ctx, width, groundY, pillarColor, capColor, torchColor) {
    const pairs = [[40, 120], [width - 60, 120]];
    pairs.forEach(([px, ph]) => {
      // Shaft
      ctx.fillStyle = pillarColor;
      ctx.fillRect(px - 10, groundY - ph, 20, ph);
      // Cap
      ctx.fillStyle = capColor;
      ctx.fillRect(px - 14, groundY - ph - 8, 28, 9);
      ctx.fillRect(px - 10, groundY - ph - 16, 20, 8);
      // Torch glow
      if (torchColor) {
        ctx.save();
        ctx.shadowColor = torchColor;
        ctx.shadowBlur  = 14;
        ctx.fillStyle   = torchColor;
        ctx.beginPath();
        ctx.arc(px, groundY - ph - 20, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  function _mountains(ctx, width, height, color, peaks) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);
    peaks.forEach(([x, y]) => ctx.lineTo(x * width, y * height));
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  }

  // ── LEVEL 1 — Stone Arena (neutral, classic) ──────────────────
  function _bgStoneArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#0d0d1a', '#1a1030', '#2a1a1a');
    _stars(ctx, width, height, 60, 0.5);
    // Distant mountains
    _mountains(ctx, width, height, 'rgba(20,15,35,0.8)', [[0.05,0.7],[0.15,0.55],[0.28,0.68],[0.4,0.5],[0.55,0.63],[0.7,0.48],[0.85,0.60],[1,0.7]]);
    // Stone bleachers / crowd silhouette
    ctx.fillStyle = 'rgba(15,12,25,0.9)';
    ctx.fillRect(0, height * 0.42, width, height * 0.12);
    ctx.fillStyle = 'rgba(10,8,18,0.95)';
    // Crowd dots
    for (let i = 0; i < 40; i++) {
      const cx = 20 + (i / 40) * (width - 40);
      const cy = height * 0.44 + Math.sin(i * 3.7) * 8;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    _fillGround(ctx, width, height, groundY, '#2a2640', '#0a0a14');
    _groundLine(ctx, width, groundY, '#4a4468', 'rgba(150,130,255,X)');
    _pillars(ctx, width, groundY, '#2a2640', '#3a3458', '#ff9944');
    // Center torch arch
    ctx.strokeStyle = 'rgba(80,70,120,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, groundY + 30, width * 0.3, Math.PI, 0);
    ctx.stroke();
  }

  // ── LEVEL 2 — Fire Arena ──────────────────────────────────────
  function _bgFireArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#100500', '#2a0800', '#3a1000');
    _stars(ctx, width, height, 20, 0.2);
    // Fire horizon glow
    const horizGlow = ctx.createRadialGradient(width/2, groundY, 0, width/2, groundY, width * 0.7);
    horizGlow.addColorStop(0,   'rgba(255,80,0,0.25)');
    horizGlow.addColorStop(0.5, 'rgba(200,40,0,0.10)');
    horizGlow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = horizGlow;
    ctx.fillRect(0, 0, width, height);
    // Lava mountains
    _mountains(ctx, width, height, '#1a0500', [[0.0,0.75],[0.1,0.55],[0.2,0.70],[0.35,0.45],[0.5,0.62],[0.65,0.48],[0.8,0.65],[1.0,0.75]]);
    // Lava cracks on mountains (orange lines)
    ctx.strokeStyle = 'rgba(255,100,0,0.4)';
    ctx.lineWidth = 1.5;
    [[0.12,0.55,0.15,0.75],[0.36,0.45,0.4,0.75],[0.66,0.48,0.68,0.75]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1*width, y1*height); ctx.lineTo(x2*width, y2*height); ctx.stroke();
    });
    _fillGround(ctx, width, height, groundY, '#3a1200', '#150400');
    _groundLine(ctx, width, groundY, '#ff4400', 'rgba(255,100,0,X)');
    _pillars(ctx, width, groundY, '#2a0a00', '#3a1400', '#ff6600');
    // Ground fire embers
    for (let i = 0; i < 12; i++) {
      const ex = 60 + (i / 12) * (width - 120);
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(i * 1.9) * 0.2;
      ctx.fillStyle = '#ff6600';
      ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 8;
      ctx.fillRect(ex, groundY - 3, 3, 8 + Math.sin(i*2.3)*4);
      ctx.restore();
    }
  }

  // ── LEVEL 3 — Storm Arena ─────────────────────────────────────
  function _bgStormArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#050510', '#0a0820', '#12102a');
    // Storm clouds
    ctx.save();
    ctx.globalAlpha = 0.35;
    [[0.2,0.15,180,60],[0.5,0.10,220,70],[0.75,0.18,160,55],[0.1,0.25,140,45]].forEach(([cx,cy,rw,rh]) => {
      const g = ctx.createRadialGradient(cx*width,cy*height,0,cx*width,cy*height,rw);
      g.addColorStop(0,'#2a2a5a'); g.addColorStop(1,'rgba(10,10,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(cx*width,cy*height,rw,rh,0,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
    // Lightning bolts in sky
    ctx.save();
    ctx.strokeStyle = 'rgba(180,180,255,0.25)';
    ctx.lineWidth = 1.5;
    [[0.3,0],[0.3,0.08],[0.28,0.16],[0.32,0.22],[0.30,0.32]].reduce((prev,cur)=>{
      if(prev){ ctx.beginPath(); ctx.moveTo(prev[0]*width,prev[1]*height); ctx.lineTo(cur[0]*width,cur[1]*height); ctx.stroke(); }
      return cur;
    }, null);
    [[0.7,0],[0.68,0.10],[0.72,0.20],[0.70,0.30]].reduce((prev,cur)=>{
      if(prev){ ctx.beginPath(); ctx.moveTo(prev[0]*width,prev[1]*height); ctx.lineTo(cur[0]*width,cur[1]*height); ctx.stroke(); }
      return cur;
    }, null);
    ctx.restore();
    _mountains(ctx, width, height, '#08081a', [[0,0.8],[0.15,0.60],[0.3,0.72],[0.5,0.55],[0.7,0.68],[0.85,0.57],[1,0.75]]);
    _fillGround(ctx, width, height, groundY, '#18183a', '#06060f');
    _groundLine(ctx, width, groundY, '#4444aa', 'rgba(100,100,255,X)');
    _pillars(ctx, width, groundY, '#18183a', '#28285a', '#8888ff');
  }

  // ── LEVEL 4 — Moon Arena ──────────────────────────────────────
  function _bgMoonArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#050510', '#0c0820', '#14103a');
    _stars(ctx, width, height, 120, 0.7);
    // Large moon
    ctx.save();
    ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 40;
    const moonG = ctx.createRadialGradient(width*0.75, height*0.18, 0, width*0.75, height*0.18, 55);
    moonG.addColorStop(0, '#f0e8ff');
    moonG.addColorStop(0.7, '#c084fc');
    moonG.addColorStop(1, 'rgba(150,80,220,0)');
    ctx.fillStyle = moonG;
    ctx.beginPath(); ctx.arc(width*0.75, height*0.18, 55, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // Moon glow on ground
    const mg = ctx.createRadialGradient(width*0.75, groundY, 0, width*0.75, groundY, width*0.6);
    mg.addColorStop(0,'rgba(180,100,255,0.12)'); mg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = mg; ctx.fillRect(0,0,width,height);
    _mountains(ctx, width, height, '#0a0820', [[0,0.85],[0.12,0.58],[0.25,0.70],[0.42,0.52],[0.58,0.65],[0.72,0.50],[0.88,0.60],[1,0.78]]);
    _fillGround(ctx, width, height, groundY, '#1a1035', '#08051a');
    _groundLine(ctx, width, groundY, '#9060cc', 'rgba(180,100,255,X)');
    _pillars(ctx, width, groundY, '#1a1035', '#2a2050', '#c084fc');
  }

  // ── LEVEL 5 — Ancient Ruins ───────────────────────────────────
  function _bgRuinsArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#060d02', '#0d1a06', '#162408');
    _stars(ctx, width, height, 40, 0.3);
    // Overgrown ruins silhouette
    ctx.fillStyle = '#0a1404';
    ctx.fillRect(0, height*0.35, width*0.18, groundY - height*0.35);
    ctx.fillRect(width*0.82, height*0.38, width*0.18, groundY - height*0.38);
    // Crumbled arch tops
    ctx.fillStyle = '#0c1806';
    ctx.beginPath(); ctx.arc(width*0.09, height*0.35, 40, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(width*0.91, height*0.38, 36, Math.PI, 0); ctx.fill();
    // Vines
    ctx.strokeStyle = 'rgba(40,100,20,0.5)'; ctx.lineWidth = 2;
    for(let i=0;i<6;i++){
      const vx = (i/6)*width*0.15;
      ctx.beginPath(); ctx.moveTo(vx, height*0.35+i*8);
      ctx.quadraticCurveTo(vx+15, height*0.5, vx+5, groundY);
      ctx.stroke();
    }
    _mountains(ctx, width, height, '#080f04', [[0,0.8],[0.2,0.62],[0.4,0.70],[0.6,0.58],[0.8,0.66],[1,0.78]]);
    _fillGround(ctx, width, height, groundY, '#1a2a0a', '#06100a');
    _groundLine(ctx, width, groundY, '#4a7a20', 'rgba(80,160,30,X)');
    _pillars(ctx, width, groundY, '#1a2a0a', '#2a3a14', '#88cc44');
  }

  // ── LEVEL 6 — Shadow Arena ────────────────────────────────────
  function _bgShadowArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#020004', '#080010', '#100018');
    _stars(ctx, width, height, 30, 0.2);
    // Purple void glow
    const vg = ctx.createRadialGradient(width/2, height*0.3, 0, width/2, height*0.3, width*0.6);
    vg.addColorStop(0,'rgba(80,0,120,0.2)'); vg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,width,height);
    // Shadow tendrils
    ctx.save();
    ctx.strokeStyle = 'rgba(100,0,180,0.15)'; ctx.lineWidth = 3;
    for(let i=0;i<5;i++){
      const tx = (i/4)*width;
      ctx.beginPath(); ctx.moveTo(tx, 0);
      ctx.bezierCurveTo(tx+50, height*0.3, tx-30, height*0.6, tx+20, groundY);
      ctx.stroke();
    }
    ctx.restore();
    _mountains(ctx, width, height, '#050008', [[0,0.85],[0.1,0.55],[0.25,0.70],[0.4,0.50],[0.6,0.65],[0.75,0.52],[0.9,0.62],[1,0.80]]);
    _fillGround(ctx, width, height, groundY, '#100018', '#04000a');
    _groundLine(ctx, width, groundY, '#6600aa', 'rgba(120,0,200,X)');
    _pillars(ctx, width, groundY, '#100018', '#200030', '#9933ff');
  }

  // ── LEVEL 7 — Wind / Forest Arena ────────────────────────────
  function _bgWindArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#001a10', '#003020', '#00502a');
    _stars(ctx, width, height, 25, 0.25);
    // Wind streaks
    ctx.save();
    ctx.strokeStyle = 'rgba(52,211,153,0.08)'; ctx.lineWidth = 1.5;
    for(let i=0;i<8;i++){
      const sy = height*0.1 + (i/8)*height*0.5;
      ctx.beginPath(); ctx.moveTo(0, sy);
      ctx.quadraticCurveTo(width*0.4, sy - 20 + i*8, width, sy + 10);
      ctx.stroke();
    }
    ctx.restore();
    // Tree silhouettes
    ctx.fillStyle = '#001a0a';
    [[0.05,0.55,18,70],[0.12,0.48,22,80],[0.88,0.52,20,75],[0.95,0.45,16,65]].forEach(([cx,ty,r,h])=>{
      ctx.beginPath(); ctx.arc(cx*width, ty*height, r, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx*width-4, ty*height, 8, h);
    });
    _mountains(ctx, width, height, '#001208', [[0,0.85],[0.15,0.60],[0.3,0.72],[0.5,0.55],[0.7,0.65],[0.85,0.55],[1,0.78]]);
    _fillGround(ctx, width, height, groundY, '#0a2a14', '#020f08');
    _groundLine(ctx, width, groundY, '#22aa66', 'rgba(50,210,120,X)');
    _pillars(ctx, width, groundY, '#0a2a14', '#163a1e', '#34d399');
  }

  // ── LEVEL 8 — Dark Realm ─────────────────────────────────────
  function _bgDarkArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#000000', '#020008', '#060010');
    // Dark floating crystals
    ctx.save();
    [[0.2,0.2],[0.5,0.12],[0.8,0.25],[0.35,0.35],[0.65,0.30]].forEach(([cx,cy],i)=>{
      ctx.globalAlpha = 0.12 + i*0.03;
      ctx.fillStyle = '#4400aa';
      ctx.save();
      ctx.translate(cx*width, cy*height);
      ctx.rotate(i*0.4);
      ctx.fillRect(-6, -18, 12, 36);
      ctx.restore();
    });
    ctx.restore();
    // Void rift (center)
    const rf = ctx.createRadialGradient(width/2,height*0.25,0,width/2,height*0.25,width*0.25);
    rf.addColorStop(0,'rgba(30,0,60,0.4)'); rf.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = rf; ctx.fillRect(0,0,width,height);
    _mountains(ctx, width, height, '#030006', [[0,0.9],[0.1,0.60],[0.25,0.72],[0.4,0.55],[0.6,0.68],[0.75,0.55],[0.9,0.65],[1,0.85]]);
    _fillGround(ctx, width, height, groundY, '#0a0018', '#020008');
    _groundLine(ctx, width, groundY, '#330066', 'rgba(80,0,150,X)');
    _pillars(ctx, width, groundY, '#0a0018', '#180030', '#6600cc');
  }

  // ── LEVEL 9 — Volcano Arena ───────────────────────────────────
  function _bgVolcanoArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#0a0000', '#1e0400', '#3a0800');
    // Ash particles (static dots)
    ctx.save();
    ctx.fillStyle = 'rgba(200,80,0,0.15)';
    for(let i=0;i<30;i++){
      const ax = (Math.sin(i*73.1)*0.5+0.5)*width;
      const ay = (Math.sin(i*137.5)*0.5+0.5)*groundY;
      ctx.beginPath(); ctx.arc(ax,ay,1.5,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // Volcano silhouette
    ctx.fillStyle = '#150300';
    ctx.beginPath();
    ctx.moveTo(0,height); ctx.lineTo(width*0.3,height);
    ctx.lineTo(width*0.42, height*0.35);
    ctx.lineTo(width*0.5, height*0.30);
    ctx.lineTo(width*0.58, height*0.35);
    ctx.lineTo(width*0.7, height);
    ctx.lineTo(width,height); ctx.closePath(); ctx.fill();
    // Lava glow from volcano top
    const lvg = ctx.createRadialGradient(width*0.5, height*0.30, 0, width*0.5, height*0.30, width*0.4);
    lvg.addColorStop(0,'rgba(255,80,0,0.35)'); lvg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = lvg; ctx.fillRect(0,0,width,height);
    // Lava river
    ctx.fillStyle = '#cc3300';
    ctx.beginPath();
    ctx.moveTo(width*0.46,height*0.35); ctx.lineTo(width*0.4,groundY); ctx.lineTo(width*0.52,groundY); ctx.lineTo(width*0.54,height*0.35);
    ctx.closePath(); ctx.fill();
    _fillGround(ctx, width, height, groundY, '#2a0600', '#0a0200');
    _groundLine(ctx, width, groundY, '#ff3300', 'rgba(255,60,0,X)');
    _pillars(ctx, width, groundY, '#200500', '#330800', '#ff5500');
    // Lava cracks on ground
    ctx.strokeStyle = 'rgba(255,80,0,0.35)'; ctx.lineWidth = 2;
    [[0.2,0],[0.3,0],[0.5,0],[0.65,0],[0.8,0]].forEach(([x])=>{
      ctx.beginPath();
      ctx.moveTo(x*width, groundY);
      ctx.lineTo(x*width + 20, groundY+20);
      ctx.lineTo(x*width - 10, groundY+40);
      ctx.stroke();
    });
  }

  // ── LEVEL 10 — Final Arena ────────────────────────────────────
  function _bgFinalArena(ctx, width, height) {
    const groundY = height * 0.78;
    _fillSky(ctx, width, height, '#000000', '#0a0000', '#1a0000');
    _stars(ctx, width, height, 40, 0.15);
    // Red apocalyptic glow
    const ag = ctx.createRadialGradient(width/2, 0, 0, width/2, 0, width);
    ag.addColorStop(0,'rgba(180,0,0,0.3)'); ag.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = ag; ctx.fillRect(0,0,width,height);
    // Broken pillars silhouette
    ctx.fillStyle = '#0d0000';
    [[0.08,0.45,24,height],[0.18,0.52,18,height],[0.80,0.48,22,height],[0.92,0.42,20,height]].forEach(([cx,ty,w2,h2])=>{
      ctx.fillRect(cx*width - w2/2, ty*height, w2, h2);
      // Broken top
      ctx.beginPath();
      ctx.moveTo(cx*width-w2/2, ty*height);
      ctx.lineTo(cx*width, ty*height - 15);
      ctx.lineTo(cx*width+w2/2, ty*height);
      ctx.fill();
    });
    // Chains
    ctx.strokeStyle = 'rgba(100,0,0,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height*0.1); ctx.quadraticCurveTo(width*0.25, height*0.4, width*0.5, height*0.2);
    ctx.quadraticCurveTo(width*0.75, height*0.0, width, height*0.15);
    ctx.stroke();
    _mountains(ctx, width, height, '#080000', [[0,0.9],[0.12,0.58],[0.28,0.70],[0.45,0.48],[0.62,0.62],[0.78,0.50],[0.92,0.60],[1,0.85]]);
    _fillGround(ctx, width, height, groundY, '#1a0000', '#060000');
    _groundLine(ctx, width, groundY, '#880000', 'rgba(200,0,0,X)');
    _pillars(ctx, width, groundY, '#1a0000', '#2a0000', '#ff0000');
    // Ground cracks with red glow
    ctx.strokeStyle = 'rgba(220,0,0,0.4)'; ctx.lineWidth = 2;
    [[0.15,0],[0.35,0],[0.5,0],[0.65,0],[0.85,0]].forEach(([x])=>{
      ctx.beginPath(); ctx.moveTo(x*width,groundY);
      ctx.lineTo(x*width+30,groundY+25); ctx.lineTo(x*width+10,groundY+50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x*width,groundY);
      ctx.lineTo(x*width-25,groundY+30); ctx.stroke();
    });
  }

  // ─────────────────────────────────────────────
  // HP BAR PULSE (danger state visual cue)
  // ─────────────────────────────────────────────
  function updateHPBarState(fillEl, pct) {
    if (!fillEl) return;
    fillEl.classList.remove('low', 'mid');
    if (pct <= 0.25) {
      fillEl.classList.add('low');
    } else if (pct <= 0.50) {
      fillEl.classList.add('mid');
    }
  }

  // ─────────────────────────────────────────────
  // MAIN UPDATE (call each frame)
  // ─────────────────────────────────────────────
  function update(dt) {
    updateShake(dt);
    updateParticles(dt);
    _updateEffects(dt);
    updateComboTimer(dt);
  }

  // ─────────────────────────────────────────────
  // ULTIMATE PORTRAIT OVERLAY
  // ─────────────────────────────────────────────
  let _ultimateTimer = null;

  function showUltimatePortrait(charData, isPlayer, skillName) {
    const overlay    = document.getElementById('ultimateOverlay');
    const portraitEl = document.getElementById('ultimateOverlayPortrait');
    const nameEl     = document.getElementById('ultimateOverlayName');
    const skillEl    = document.getElementById('ultimateOverlaySkill');
    if (!overlay) return;

    if (_ultimateTimer) { clearTimeout(_ultimateTimer); _ultimateTimer = null; }

    // Set side class — P1 bottom-left, P2 bottom-right
    overlay.className = `ultimate-overlay ${isPlayer ? 'player-side' : 'enemy-side'}`;

    // Character color for border glow + portrait outline
    const c = charData.color || '#ffffff';
    overlay.style.setProperty('--ult-color', c);

    // Portrait
    if (portraitEl) {
      const src = AssetManager.getPortraitSrc(charData.id, 'ultimate_portrait')
               || AssetManager.getPortraitSrc(charData.id, 'cutscene')
               || AssetManager.getPortraitSrc(charData.id, 'select');
      if (src) {
        portraitEl.innerHTML = `<img src="${src}" alt="${charData.name}" />`;
      } else {
        portraitEl.innerHTML = `<div class="ult-portrait-emoji">${charData.emoji}</div>`;
      }
    }

    if (nameEl)  nameEl.textContent  = charData.name;
    if (skillEl) skillEl.textContent = skillName || 'ULTIMATE';

    // Show
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Auto hide after 1.5s
    _ultimateTimer = setTimeout(() => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.classList.add('hidden'), 200);
      _ultimateTimer = null;
    }, 1500);
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    init,
    showDamage,
    screenFlash,
    screenShake,
    spawnParticles,
    spawnHitEffect,
    showUltimatePortrait,
    updateParticles,
    drawParticles,
    clearParticles,
    drawArenaBackground,
    addComboHit,
    resetCombo,
    updateHPBarState,
    update,
    HIT_COLORS,
  };

})();
