// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — ASSET MANAGER  v3
//
// Sprite format supported:
//   FORMAT 2 — Single sprite sheet (primary):
//     assets/characters/<id>_sheet.png
//     8 cols × 11 rows, ~108×164 px per frame, white background
//
//   FORMAT 3 — Placeholder (auto-generated canvas, always works)
//
// Portrait files:
//   assets/characters/<id>_portrait.png  → character select
//   assets/characters/<id>_cutscene.png  → story screen
//   assets/characters/<id>_victory_portrait.png → victory screen
// ═══════════════════════════════════════════════════════════════

const AssetManager = (() => {

  // ANIMATION STATE → ROW INDEX
  const SPRITE_ROWS = {
    idle:      0,
    walk:      1,
    run:       1,
    jump:      2,
    fall:      2,
    attack:    3,
    skill:     4,
    skill2:    5,
    ultimate:  6,
    hit:       7,
    knockdown: 8,
    block:     9,
    victory:   10,
    defeat:    11,
  };

  // SHEET DIMENSIONS
  const SHEET_DIMS = {
    ember:   { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    frost:   { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    blaze:   { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    volt:    { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    luna:    { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    terra:   { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    kai:     { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    kira:    { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    shadow:  { cols: 8, rows: 12, colW: 109, rowH: 150, whiteBg: true },
    inferno: { cols: 4, rows: 12, colW: 218, rowH: 150, whiteBg: true },
  };

  const DEFAULT_FRAME_COUNTS = {
    idle:      4,
    walk:      6,
    run:       6,
    jump:      3,
    fall:      3,
    attack:    5,
    skill:     5,
    skill2:    5,
    ultimate:  6,
    hit:       2,
    knockdown: 3,
    block:     2,
    victory:   3,
    defeat:    3,
  };

  const CHAR_FRAME_COUNTS = {
    ember:   { idle:4, walk:6, jump:3, attack:5, skill:6, ultimate:8, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    frost:   { idle:4, walk:6, jump:3, attack:5, skill:6, ultimate:7, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    blaze:   { idle:4, walk:6, jump:3, attack:5, skill:6, ultimate:7, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    volt:    { idle:4, walk:6, jump:3, attack:3, skill:4, ultimate:7, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    luna:    { idle:4, walk:6, jump:3, attack:5, skill:5, ultimate:8, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    terra:   { idle:4, walk:6, jump:3, attack:5, skill:5, ultimate:5, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    kai:     { idle:4, walk:6, jump:3, attack:5, skill:5, ultimate:8, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    kira:    { idle:4, walk:6, jump:3, attack:5, skill:6, ultimate:8, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    shadow:  { idle:4, walk:6, jump:3, attack:5, skill:6, ultimate:8, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
    inferno: { idle:4, walk:6, jump:3, attack:5, skill:6, ultimate:8, hit:2, knockdown:4, block:2, victory:4, defeat:3 },
  };

  const FRAME_W = 80;
  const FRAME_H = 120;

  // ─────────────────────────────────────────────
  // PER-STATE FILE SUPPORT
  // Supports two formats:
  //   Format A: ember_idle.png       — one row of frames
  //   Format B: ember_idle_0.png...  — individual frame files
  // ─────────────────────────────────────────────
  const _perState       = {};  // charId → { state → HTMLImageElement }        (row file)
  const _perStateFrames = {};  // charId → { state → [HTMLImageElement, ...] } (individual frames)

  function _tryLoadPerStateFiles(ch) {
    if (!_perState[ch.id])       _perState[ch.id]       = {};
    if (!_perStateFrames[ch.id]) _perStateFrames[ch.id] = {};

    const states = Object.keys(SPRITE_ROWS);
    states.forEach(state => {
      // Format A — row file: ember_idle.png
      const rowImg = new Image();
      rowImg.onload = () => {
        _perState[ch.id][state] = rowImg;
        console.log(`[AssetManager] Row file: ${ch.id}_${state}.png`);
      };
      rowImg.onerror = () => {};
      rowImg.src = `assets/characters/${ch.id}_${state}.png`;

      // Format B — individual frames: ember_idle_0.png, ember_idle_1.png ...
      const counts = CHAR_FRAME_COUNTS[ch.id] || DEFAULT_FRAME_COUNTS;
      const maxF   = counts[state] || DEFAULT_FRAME_COUNTS[state] || 4;
      const frames = [];
      let loadedCount = 0;

      for (let i = 0; i < maxF; i++) {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 1) {
            // At least one frame loaded — register the array
            _perStateFrames[ch.id][state] = frames;
            console.log(`[AssetManager] Individual frames: ${ch.id}_${state}_*.png`);
          }
        };
        img.onerror = () => {};
        img.src = `assets/characters/${ch.id}_${state}_${i}.png`;
        frames.push(img);
      }
    });
  }

  // ─────────────────────────────────────────────
  // INTERNAL CACHE
  // ─────────────────────────────────────────────
  const _sheets      = {};
  const _portraits   = {};
  const _generated   = {};
  const _frameCache  = {};
  const _backgrounds = {};

  let   _ready     = false;
  let   _onReadyCb = null;

  const _portraitListeners = [];
  const _bgListeners       = [];

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  function init(onReady) {
    _onReadyCb = onReady;

    if (_ready) {
      if (_onReadyCb) { _onReadyCb(); _onReadyCb = null; }
      return;
    }

    let allChars = [];
    try { allChars = getAllCharacters(); } catch(e) {
      try { allChars = Object.values(CHARACTERS); } catch(e2) {}
    }

    allChars.forEach(ch => {
      if (!ch) return;
      try {
        if (!_generated[ch.id]) _generated[ch.id] = _generatePlaceholderSheet(ch);
        _portraits[ch.id] = {
          select:   _generatePortrait(ch, 'select'),
          cutscene: _generatePortrait(ch, 'cutscene'),
          victory:  _generatePortrait(ch, 'victory'),
        };
      } catch(e) {
        console.warn('[AssetManager] Placeholder error for', ch.id, e);
      }
    });

    _ready = true;
    if (_onReadyCb) { _onReadyCb(); _onReadyCb = null; }

    allChars.forEach(ch => {
      if (!ch) return;
      _tryLoadPerStateFiles(ch); // per-state PNGs — highest priority
      _tryLoadSheet(ch);         // fallback: single sheet
      _tryLoadPortraits(ch);
    });

    _tryLoadBackgrounds();
  }

  // ─────────────────────────────────────────────
  // BACKGROUND LOADING
  // ─────────────────────────────────────────────
  function _tryLoadBackgrounds() {
    for (let i = 1; i <= 10; i++) {
      _loadBg(`level${i}`, `assets/backgrounds/level${i}_bg.png`);
    }
    _loadBg('default', 'assets/backgrounds/arena_bg.png');
    _loadBg('menu', 'assets/backgrounds/menu_bg.png');
  }

  function _loadBg(key, src) {
    const img = new Image();
    img.onload = () => {
      _backgrounds[key] = img;
      console.log(`[AssetManager] BG loaded: ${key}`);
      _bgListeners.forEach(cb => { try { cb(key, img); } catch(e) {} });
    };
    img.onerror = () => {};
    img.src = src;
  }

  function getBackground(levelId) {
    return _backgrounds[levelId] || _backgrounds['default'] || null;
  }

  function getMenuBackground() {
    return _backgrounds['menu'] || null;
  }

  // ─────────────────────────────────────────────
  // SHEET LOADING
  // ─────────────────────────────────────────────
  function _tryLoadSheet(ch) {
    const img = new Image();
    img.onload = () => {
      _sheets[ch.id] = img;
      _clearFrameCache(ch.id);
      console.log(`[AssetManager] Loaded sheet: ${ch.id} (${img.naturalWidth}×${img.naturalHeight})`);
    };
    img.onerror = () => {};
    img.src = `assets/characters/${ch.id}_sheet.png`;
  }

  function _tryLoadPortraits(ch) {
    const map = { portrait: 'select', cutscene: 'cutscene', victory_portrait: 'victory', ultimate_portrait: 'ultimate_portrait' };
    Object.entries(map).forEach(([file, key]) => {
      const img = new Image();
      img.onload = () => {
        if (!_portraits[ch.id]) _portraits[ch.id] = {};
        _portraits[ch.id][key] = img;
        _portraitListeners.forEach(cb => { try { cb(ch.id, key); } catch(e){} });
      };
      img.onerror = () => {};
      img.src = `assets/characters/${ch.id}_${file}.png`;
    });
  }

  function _clearFrameCache(charId) {
    Object.keys(_frameCache).forEach(k => {
      if (k.startsWith(charId + '_')) delete _frameCache[k];
    });
  }

  // ─────────────────────────────────────────────
  // DRAW BATTLE SPRITE
  // ─────────────────────────────────────────────
  // Draw image stretched to fill the destination box exactly (original behavior)
  function _drawPinBottom(ctx, img, srcX, srcY, srcW, srcH, destX, destY, destW, destH) {
    ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
  }

  function drawSprite(ctx, charId, state, animFrame, x, y, w, h) {
    const counts = CHAR_FRAME_COUNTS[charId] || DEFAULT_FRAME_COUNTS;
    const maxF   = counts[state] || DEFAULT_FRAME_COUNTS[state] || 4;
    const frame  = Math.floor(Math.abs(animFrame)) % maxF;

    // ── Per-state PNG (highest priority) ────────────────────────
    // If no per-state file for this state but idle exists, use idle
    const frameArr = _perStateFrames[charId]?.[state];
    const hasFrames = frameArr && frameArr.some(img => img.complete && img.naturalWidth > 0);

    const rowImg = _perState[charId]?.[state];
    const hasRow = rowImg && rowImg.complete && rowImg.naturalWidth > 0;

    // No per-state for this state — try idle as visual substitute
    const hasAnyPerState = Object.values(_perState[charId] || {}).some(img => img?.complete && img?.naturalWidth > 0)
                        || Object.values(_perStateFrames[charId] || {}).some(arr => arr?.some(img => img?.complete && img?.naturalWidth > 0));

    if (hasAnyPerState && !hasFrames && !hasRow) {
      // Use idle sprite as fallback for missing states
      const idleArr = _perStateFrames[charId]?.['idle'];
      const idleRow = _perState[charId]?.['idle'];
      const idleFrameCount = counts['idle'] || DEFAULT_FRAME_COUNTS['idle'] || 4;
      const idleFrame = frame % idleFrameCount;

      if (idleArr && idleArr.length > 0) {
        const img = idleArr[idleFrame % idleArr.length];
        if (img && img.complete && img.naturalWidth > 0) {
          try { _drawPinBottom(ctx, img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, w, h); return true; } catch(e) {}
        }
      }
      if (idleRow && idleRow.complete && idleRow.naturalWidth > 0) {
        try {
          const fw = Math.floor(idleRow.naturalWidth / idleFrameCount);
          _drawPinBottom(ctx, idleRow, idleFrame * fw, 0, fw, idleRow.naturalHeight, x, y, w, h);
          return true;
        } catch(e) {}
      }
    }

    // Format B: individual frame files
    if (frameArr && frameArr.length > 0) {
      const img = frameArr[frame % frameArr.length];
      if (img && img.complete && img.naturalWidth > 0) {
        try { _drawPinBottom(ctx, img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, w, h); return true; } catch(e) {}
      }
    }

    // Format A: row file
    if (hasRow) {
      try {
        const fw   = Math.floor(rowImg.naturalWidth / maxF);
        const fh   = rowImg.naturalHeight;
        const srcX = frame * fw;
        if (srcX + fw <= rowImg.naturalWidth) {
          _drawPinBottom(ctx, rowImg, srcX, 0, fw, fh, x, y, w, h);
          return true;
        }
      } catch(e) {}
    }

    // ── Real sheet ──────────────────────────────────────────────
    const dims  = SHEET_DIMS[charId];
    const sheet = _sheets[charId];
    if (sheet && sheet.complete && sheet.naturalWidth > 0 && dims) {
      try {
        const rowIdx = SPRITE_ROWS[state] ?? 0;
        const srcX   = frame  * dims.colW;
        const srcY   = rowIdx * dims.rowH;

        if (srcX + dims.colW > sheet.naturalWidth ||
            srcY + dims.rowH > sheet.naturalHeight) {
          console.warn(`[AssetManager] ${charId} ${state}[${frame}] out of sheet bounds`);
          return _drawPlaceholder(ctx, charId, state, frame, x, y, w, h);
        }

        if (dims.darkBg || dims.whiteBg) {
          const cacheKey = `${charId}_${state}_${frame}`;
          let cleanCanvas = _frameCache[cacheKey];
          if (!cleanCanvas && cleanCanvas !== false) {
            cleanCanvas = _extractFrame(sheet, srcX, srcY, dims.colW, dims.rowH, !!dims.darkBg);
            _frameCache[cacheKey] = cleanCanvas || false;
          }
          if (cleanCanvas) {
            _drawPinBottom(ctx, cleanCanvas, 0, 0, cleanCanvas.width, cleanCanvas.height, x, y, w, h);
          } else {
            _drawPinBottom(ctx, sheet, srcX, srcY, dims.colW, dims.rowH, x, y, w, h);
          }
        } else {
          _drawPinBottom(ctx, sheet, srcX, srcY, dims.colW, dims.rowH, x, y, w, h);
        }
        return true;
      } catch(e) {
        console.warn('[AssetManager] Sheet draw error', charId, state, e.message);
      }
    }

    // ── Placeholder ─────────────────────────────────────────────
    return _drawPlaceholder(ctx, charId, state, frame, x, y, w, h);
  }

  function _drawPlaceholder(ctx, charId, state, frame, x, y, w, h) {
    const gen = _generated[charId];
    if (!(gen instanceof HTMLCanvasElement)) return false;
    try {
      const rowIdx = SPRITE_ROWS[state] ?? 0;
      _drawPinBottom(ctx, gen, frame * FRAME_W, rowIdx * FRAME_H, FRAME_W, FRAME_H, x, y, w, h);
      return true;
    } catch(e) { return false; }
  }

  // ─────────────────────────────────────────────
  // EXTRACT FRAME + REMOVE BACKGROUND
  // ─────────────────────────────────────────────
  function _extractFrame(sheet, srcX, srcY, colW, rowH, darkBg) {
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width  = colW;
      offscreen.height = rowH;
      const octx = offscreen.getContext('2d', { willReadFrequently: true });

      octx.drawImage(sheet, srcX, srcY, colW, rowH, 0, 0, colW, rowH);

      const imageData = octx.getImageData(0, 0, colW, rowH);
      const data = imageData.data;
      const w = colW, h = rowH;

      function isBg(idx) {
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        if (a < 10) return true;
        if (darkBg) return r <= 35 && g <= 35 && b <= 35;
        return r >= 235 && g >= 235 && b >= 235;
      }

      const marked = new Uint8Array(w * h);
      const queue  = [];

      function seed(px, py) {
        const idx = (py * w + px) * 4;
        if (!marked[py * w + px] && isBg(idx)) {
          marked[py * w + px] = 1;
          queue.push(px, py);
        }
      }
      for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h-1); }
      for (let y = 1; y < h-1; y++) { seed(0, y); seed(w-1, y); }

      let qi = 0;
      while (qi < queue.length) {
        const px = queue[qi++];
        const py = queue[qi++];
        const neighbors = [[px-1,py],[px+1,py],[px,py-1],[px,py+1]];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const ni = ny * w + nx;
          if (marked[ni]) continue;
          const idx = ni * 4;
          if (isBg(idx)) {
            marked[ni] = 1;
            queue.push(nx, ny);
          }
        }
      }

      for (let i = 0; i < w * h; i++) {
        if (marked[i]) data[i*4+3] = 0;
      }

      octx.putImageData(imageData, 0, 0);
      return offscreen;
    } catch(e) {
      console.warn('[AssetManager] _extractFrame failed (tainted canvas?)', e.message);
      return null;
    }
  }

  // ─────────────────────────────────────────────
  // PORTRAIT
  // ─────────────────────────────────────────────
  function getPortraitSrc(charId, type) {
    const key = type === 'portrait' ? 'select' : type;
    const portraits = _portraits[charId];
    if (!portraits) return null;

    const asset = portraits[key] || portraits.select;
    if (!asset) return null;

    if (asset instanceof HTMLImageElement && asset.complete && asset.naturalWidth > 0) {
      return asset.src;
    }
    if (asset instanceof HTMLCanvasElement) {
      try { return asset.toDataURL('image/png'); } catch(e) { return null; }
    }
    return null;
  }

  function onPortraitLoaded(cb) { _portraitListeners.push(cb); }
  function onBackgroundLoaded(cb) { _bgListeners.push(cb); }

  // ─────────────────────────────────────────────
  // PLACEHOLDER GENERATOR
  // ─────────────────────────────────────────────
  function _generatePlaceholderSheet(ch) {
    const totalRows = Object.keys(SPRITE_ROWS).length;
    const maxFrames = 8;

    const canvas = document.createElement('canvas');
    canvas.width  = FRAME_W * maxFrames;
    canvas.height = FRAME_H * totalRows;
    const ctx = canvas.getContext('2d');

    const color   = ch.color   || '#ff6b2b';
    const darkCol = _darken(color, 0.35);
    const glowCol = color + '80';

    Object.entries(SPRITE_ROWS).forEach(([state, row]) => {
      const frameCount = DEFAULT_FRAME_COUNTS[state] || 4;
      for (let f = 0; f < frameCount; f++) {
        _drawPlaceholderFrame(ctx, ch, state, f, frameCount,
          f * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H, color, darkCol, glowCol);
      }
    });

    return canvas;
  }

  function _drawPlaceholderFrame(ctx, ch, state, frame, totalFrames, bx, by, fw, fh, color, darkCol, glowCol) {
    ctx.clearRect(bx, by, fw, fh);

    const cx = bx + fw / 2;
    const t  = totalFrames > 1 ? frame / (totalFrames - 1) : 0;

    let bodyY = by + fh * 0.30, legSpread = 0, armAngle = 0;
    let headBob = 0, lean = 0, alpha = 1.0, glowStr = 0;

    switch (state) {
      case 'idle':      headBob = Math.sin(frame*1.5)*2; armAngle = Math.sin(frame*1.5)*5; break;
      case 'walk':
      case 'run':       legSpread = Math.sin(frame*1.2)*10; lean = Math.sin(frame*1.2)*3; headBob = Math.abs(Math.sin(frame*2.4))*-2; break;
      case 'jump':      bodyY -= fh*0.12*t; legSpread = -8; armAngle = -30; break;
      case 'fall':      legSpread = 6; armAngle = 20; headBob = 4; break;
      case 'attack':    lean = 12*t; armAngle = -40+80*t; glowStr = t*12; break;
      case 'skill':     lean = 8*t; armAngle = -60+80*t; glowStr = t*20; break;
      case 'ultimate':  glowStr = 30*(0.5+0.5*Math.sin(frame*0.8)); armAngle = -90+frame*22; lean = Math.sin(frame*0.8)*6; break;
      case 'hit':       lean = -15; headBob = -8; alpha = 0.85; break;
      case 'knockdown': bodyY += fh*0.25*t; lean = 35*t; alpha = 1-t*0.4; break;
      case 'block':     lean = -5; armAngle = 30; break;
      case 'victory':   headBob = -4; armAngle = -60+frame*15; glowStr = 8; break;
      case 'defeat':    lean = 20*t; bodyY += fh*0.1*t; alpha = 1-t*0.5; break;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    if (glowStr > 0) { ctx.shadowColor = color; ctx.shadowBlur = glowStr; }

    const bw = fw*0.55, bh = fh*0.38, hw = fw*0.20;
    const lw = fw*0.10, lh = fh*0.28, aw = fw*0.10, ah = fh*0.24;

    ctx.translate(cx + lean, bodyY + headBob);

    ctx.globalAlpha = alpha * 0.2;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, fh*0.38, bw*0.5, 5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = darkCol;
    ctx.save(); ctx.rotate((-legSpread*Math.PI)/180);
    ctx.fillRect(-bw*0.3, bh*0.35, lw, lh);
    ctx.fillRect(-bw*0.32, bh*0.35+lh, lw*1.5, lw*0.7);
    ctx.restore();
    ctx.save(); ctx.rotate((legSpread*Math.PI)/180);
    ctx.fillRect(bw*0.18, bh*0.35, lw, lh);
    ctx.fillRect(bw*0.16, bh*0.35+lh, lw*1.5, lw*0.7);
    ctx.restore();

    const tg = ctx.createLinearGradient(-bw*0.35, 0, bw*0.35, bh);
    tg.addColorStop(0, color); tg.addColorStop(1, darkCol);
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(-bw*0.35, 0); ctx.lineTo(bw*0.35, 0);
    ctx.lineTo(bw*0.28, bh*0.40); ctx.lineTo(-bw*0.28, bh*0.40);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = color;
    ctx.save(); ctx.translate(-bw*0.38, bh*0.02); ctx.rotate(((-armAngle-10)*Math.PI)/180);
    ctx.fillRect(-aw*0.5, 0, aw, ah);
    ctx.beginPath(); ctx.arc(0, ah, aw*0.7, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(bw*0.38, bh*0.02); ctx.rotate(((armAngle+10)*Math.PI)/180);
    ctx.fillRect(-aw*0.5, 0, aw, ah);
    ctx.beginPath(); ctx.arc(0, ah, aw*0.7, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -hw*0.6, hw, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = darkCol;
    ctx.beginPath(); ctx.arc(0, -hw*0.6-hw*0.3, hw*0.65, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(hw*0.35, -hw*0.65, hw*0.18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(hw*0.40, -hw*0.65, hw*0.10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(hw*0.43, -hw*0.68, hw*0.04, 0, Math.PI*2); ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ─────────────────────────────────────────────
  // PORTRAIT GENERATOR
  // ─────────────────────────────────────────────
  function _generatePortrait(ch, type) {
    const sizes = { select: {w:120,h:160}, cutscene: {w:240,h:400}, victory: {w:200,h:260} };
    const { w, h } = sizes[type] || sizes.select;

    const canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const color   = ch.color || '#ff6b2b';
    const darkCol = _darken(color, 0.5);

    const bg = ctx.createRadialGradient(w*0.5, h*0.4, 0, w*0.5, h*0.4, w*0.8);
    bg.addColorStop(0, color + '30'); bg.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = color + '15'; ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for (let i = 0; i < h; i += 20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

    ctx.fillStyle = color + '20';
    ctx.beginPath(); ctx.ellipse(w*0.5, h*0.85, w*0.35, 12, 0, 0, Math.PI*2); ctx.fill();

    const emojiSize = Math.round(w * 0.55);
    ctx.font = `${emojiSize}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.85;
    ctx.fillText(ch.emoji, w*0.5, h*0.42);
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';

    const bannerH = h * 0.14;
    const bannerGrad = ctx.createLinearGradient(0, h-bannerH, 0, h);
    bannerGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bannerGrad.addColorStop(0.4, 'rgba(0,0,0,0.85)');
    bannerGrad.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = bannerGrad; ctx.fillRect(0, h-bannerH, w, bannerH);

    const fontSize = Math.max(10, Math.round(w*0.13));
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    ctx.fillText(ch.name, w*0.5, h - bannerH*0.35);

    ctx.font = `${Math.round(fontSize*0.6)}px Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(ch.element.toUpperCase(), w*0.5, h - bannerH*0.08);

    ctx.strokeStyle = color + '60'; ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w-2, h-2);

    const cl = Math.min(w,h)*0.12;
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,cl); ctx.lineTo(0,0); ctx.lineTo(cl,0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w-cl,0); ctx.lineTo(w,0); ctx.lineTo(w,cl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,h-cl); ctx.lineTo(0,h); ctx.lineTo(cl,h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w-cl,h); ctx.lineTo(w,h); ctx.lineTo(w,h-cl); ctx.stroke();

    return canvas;
  }

  // ─────────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────────
  function _darken(hex, factor) {
    try {
      const r = Math.round(parseInt(hex.slice(1,3), 16) * (1-factor));
      const g = Math.round(parseInt(hex.slice(3,5), 16) * (1-factor));
      const b = Math.round(parseInt(hex.slice(5,7), 16) * (1-factor));
      return '#' + r.toString(16).padStart(2,'0') +
                   g.toString(16).padStart(2,'0') +
                   b.toString(16).padStart(2,'0');
    } catch(e) { return hex; }
  }

  function isReady()   { return _ready; }
  function hasRealSheet(charId) { return !!(_sheets[charId]?.complete && _sheets[charId]?.naturalWidth > 0); }
  function hasPerStateSprite(charId, state) {
    const img = _perState[charId]?.[state];
    return !!(img && img.complete && img.naturalWidth > 0);
  }
  function hasRealPortrait(charId, type) {
    const p = _portraits[charId];
    if (!p) return false;
    const k = type === 'portrait' ? 'select' : type;
    const a = p[k];
    return a instanceof HTMLImageElement && a.complete && a.naturalWidth > 0;
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    init,
    drawSprite,
    getPortraitSrc,
    onPortraitLoaded,
    onBackgroundLoaded,
    isReady,
    hasRealSheet,
    hasPerStateSprite,
    hasRealPortrait,
    getBackground,
    getMenuBackground,
    SPRITE_ROWS,
    FRAME_W,
    FRAME_H,
    getSheetDims:    (id) => SHEET_DIMS[id],
    getFrameCount:   (id, state) => (CHAR_FRAME_COUNTS[id] || DEFAULT_FRAME_COUNTS)[state] || 4,
    clearFrameCache: _clearFrameCache,
  };

})();
