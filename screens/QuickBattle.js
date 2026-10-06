// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — VS MODE SELECT SCREEN
// Layout:
//   Left panel  — P1 big portrait + name
//   Center      — ONE grid of all 10 chars (P1 & P2 pick from same grid) + map strip
//   Right panel — P2 big portrait + name
// ═══════════════════════════════════════════════════════════════

const QuickBattleScreen = (() => {

  let _p1Id      = null;
  let _p2Id      = null;
  let _mapId     = null;
  let _allChars  = [];
  let _allLevels = [];
  let _selectingFor = 'p1'; // which side is currently being selected

  const LEVEL_IDS = [
    'level1','level2','level3','level4','level5',
    'level6','level7','level8','level9','level10',
  ];

  // ─────────────────────────────────────────────
  // ENTER / EXIT
  // ─────────────────────────────────────────────
  function enter() {
    _p1Id  = null;
    _p2Id  = null;
    _mapId = null;
    _selectingFor = 'p1';
    // Stop menu music for VS mode selection screen
    AudioManager.stopMusic(0.5);

    // Reset quick battle flag — will be set again on FIGHT
    GameManager.setQuickBattle(false);

    _allChars  = [...CHARACTER_ORDER];
    _allLevels = LEVEL_IDS.map(id => getLevel(id)).filter(Boolean);

    _buildBackground();
    _buildGrid();
    _buildMapStrip();
    _refreshPortrait('p1');
    _refreshPortrait('p2');
    _refreshFightBtn();
    _updateSelectingIndicator();
    _wireButtons();
  }

  function exit() {}

  // ─────────────────────────────────────────────
  // BACKGROUND
  // ─────────────────────────────────────────────
  function _buildBackground() {
    const bg = document.getElementById('qbBg');
    if (!bg) return;
    bg.innerHTML = '';
    const img = AssetManager.getMenuBackground();
    if (img) {
      const el = document.createElement('img');
      el.src = img.src;
      bg.appendChild(el);
    }
  }

  // ─────────────────────────────────────────────
  // SINGLE GRID — all 10 chars, both P1 & P2 pick from same grid
  // ─────────────────────────────────────────────
  function _buildGrid() {
    // Use left grid for unified grid, hide right grid
    const leftEl  = document.getElementById('qbGridLeft');
    const rightEl = document.getElementById('qbGridRight');
    if (!leftEl) return;

    leftEl.innerHTML = '';
    leftEl.style.gridTemplateColumns = 'repeat(5, 1fr)';
    leftEl.style.width = '100%';
    if (rightEl) rightEl.style.display = 'none';

    _allChars.forEach(id => leftEl.appendChild(_makeCard(id)));
  }

  function _makeCard(charId) {
    const ch = getCharacter(charId);
    if (!ch) return document.createElement('div');

    const isUnlocked = SaveManager.isCharacterUnlocked(charId);

    const card = document.createElement('div');
    card.className  = 'qb-card';
    card.dataset.id = charId;

    if (!isUnlocked) {
      // Locked — show portrait dimmed with lock overlay
      const src = AssetManager.getPortraitSrc(charId, 'select');
      if (src) {
        card.innerHTML = `<img src="${src}" alt="${ch.name}" />`;
      } else {
        card.innerHTML = `<div class="qb-card-emoji" style="color:${ch.color}">${ch.emoji}</div>`;
      }
      card.innerHTML += `
        <div class="qb-card-name">${ch.name}</div>
        <div class="qb-card-lock-overlay">
          <div class="qb-card-lock-icon">🔒</div>
          <div class="qb-card-lock-hint">Clear Story Mode</div>
        </div>
      `;
      card.classList.add('qb-card-locked');
      return card; // no click listener
    }

    const src = AssetManager.getPortraitSrc(charId, 'select');
    if (src) {
      card.innerHTML = `<img src="${src}" alt="${ch.name}" />`;
    } else {
      card.innerHTML = `<div class="qb-card-emoji" style="color:${ch.color}">${ch.emoji}</div>`;
      AssetManager.onPortraitLoaded((id) => {
        if (id === charId) {
          const freshSrc = AssetManager.getPortraitSrc(charId, 'select');
          if (freshSrc) {
            card.innerHTML = `<img src="${freshSrc}" alt="${ch.name}" /><div class="qb-card-name">${ch.name}</div>`;
          }
        }
      });
    }
    card.innerHTML += `<div class="qb-card-name">${ch.name}</div>`;

    _updateCardBadge(card, charId);

    card.addEventListener('click', () => {
      AudioManager.playSFX('btn_click');
      if (_selectingFor === 'p1') {
        _p1Id = charId;
        _selectingFor = 'p2';
      } else {
        _p2Id = charId;
        _selectingFor = 'p1';
      }
      _refreshAllCards();
      _refreshPortrait('p1');
      _refreshPortrait('p2');
      _refreshFightBtn();
      _updateSelectingIndicator();
    });

    return card;
  }

  function _refreshAllCards() {
    document.querySelectorAll('.qb-card').forEach(card => {
      const id = card.dataset.id;
      card.classList.remove('selected-p1', 'selected-p2');
      card.querySelectorAll('.qb-card-badge').forEach(b => b.remove());
      _updateCardBadge(card, id);
    });
  }

  function _updateCardBadge(card, charId) {
    card.classList.remove('selected-p1', 'selected-p2');
    card.querySelectorAll('.qb-card-badge').forEach(b => b.remove());
    if (charId === _p1Id) {
      card.classList.add('selected-p1');
      const b = document.createElement('div');
      b.className = 'qb-card-badge p1'; b.textContent = 'P1';
      card.appendChild(b);
    }
    if (charId === _p2Id) {
      card.classList.add('selected-p2');
      const b = document.createElement('div');
      b.className = 'qb-card-badge p2'; b.textContent = 'P2';
      card.appendChild(b);
    }
  }

  // ─────────────────────────────────────────────
  // SELECTING INDICATOR — show who is picking
  // ─────────────────────────────────────────────
  function _updateSelectingIndicator() {
    const p1Name = document.getElementById('qbP1Name');
    const p2Name = document.getElementById('qbP2Name');
    const p1Role = document.getElementById('qbP1Role');
    const p2Role = document.getElementById('qbP2Role');

    if (!_p1Id) {
      if (p1Name) p1Name.textContent = 'P1 SELECT';
      if (p1Role) p1Role.textContent = _selectingFor === 'p1' ? '▶ CHOOSING...' : '─';
    }
    if (!_p2Id) {
      if (p2Name) p2Name.textContent = 'P2 SELECT';
      if (p2Role) p2Role.textContent = _selectingFor === 'p2' ? '▶ CHOOSING...' : '─';
    }

    // Highlight which fighter panel is active
    const p1Panel = document.querySelector('.qb-fighter-left');
    const p2Panel = document.querySelector('.qb-fighter-right');
    if (p1Panel) p1Panel.style.opacity = _selectingFor === 'p1' ? '1' : '0.6';
    if (p2Panel) p2Panel.style.opacity = _selectingFor === 'p2' ? '1' : '0.6';
  }

  // ─────────────────────────────────────────────
  // BIG PORTRAITS
  // ─────────────────────────────────────────────
  function _refreshPortrait(side) {
    const charId = side === 'p1' ? _p1Id : _p2Id;
    const wrapId = side === 'p1' ? 'qbP1Portrait' : 'qbP2Portrait';
    const nameId = side === 'p1' ? 'qbP1Name'     : 'qbP2Name';
    const roleId = side === 'p1' ? 'qbP1Role'     : 'qbP2Role';
    const wrap   = document.getElementById(wrapId);
    const nameEl = document.getElementById(nameId);
    const roleEl = document.getElementById(roleId);
    if (!wrap) return;

    if (!charId) {
      wrap.innerHTML = `<div class="qb-portrait-placeholder">${side === 'p1' ? '🔥' : '❓'}</div>`;
      if (nameEl) nameEl.textContent = side === 'p1' ? 'P1 SELECT' : 'P2 SELECT';
      if (roleEl) roleEl.textContent = _selectingFor === side ? '▶ CHOOSING...' : '─';
      return;
    }

    const ch  = getCharacter(charId);
    const src = AssetManager.getPortraitSrc(charId, 'cutscene')
             || AssetManager.getPortraitSrc(charId, 'select');

    if (src) {
      wrap.innerHTML = `<img src="${src}" alt="${ch.name}" />`;
    } else {
      wrap.innerHTML = `<div class="qb-portrait-placeholder" style="color:${ch.color};opacity:0.6;">${ch.emoji}</div>`;
      AssetManager.onPortraitLoaded((id) => { if (id === charId) _refreshPortrait(side); });
    }

    if (nameEl) nameEl.textContent = ch.name;
    if (roleEl) roleEl.textContent = (ch.element || '') + (ch.role ? '  ·  ' + ch.role : '');
  }

  // ─────────────────────────────────────────────
  // MAP STRIP
  // ─────────────────────────────────────────────
  function _buildMapStrip() {
    const strip = document.getElementById('qbMapStrip');
    if (!strip) return;
    strip.innerHTML = '';

    _allLevels.forEach((level, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'qb-map-thumb';
      thumb.dataset.levelId = level.id;

      const canvas = document.createElement('canvas');
      canvas.className = 'qb-map-canvas';
      canvas.width  = 96;
      canvas.height = 54;

      const bgImg = AssetManager.getBackground(level.id);
      if (bgImg) {
        canvas.getContext('2d').drawImage(bgImg, 0, 0, 96, 54);
      } else {
        EffectManager.drawArenaBackground(canvas.getContext('2d'), 96, 54, level.id);
        AssetManager.onBackgroundLoaded((key) => {
          if (key === level.id) {
            const freshBg = AssetManager.getBackground(level.id);
            if (freshBg) canvas.getContext('2d').drawImage(freshBg, 0, 0, 96, 54);
          }
        });
      }

      const numLabel = document.createElement('div');
      numLabel.className   = 'qb-map-thumb-num';
      numLabel.textContent = idx + 1;

      thumb.appendChild(canvas);
      thumb.appendChild(numLabel);

      thumb.addEventListener('click', () => {
        AudioManager.playSFX('navigate');
        _mapId = level.id;
        _refreshMapStrip();
        _refreshFightBtn();
        const nameEl = document.getElementById('qbMapName');
        if (nameEl) nameEl.textContent = level.title || level.id;
      });

      strip.appendChild(thumb);
    });

    _refreshMapStrip();
  }

  function _refreshMapStrip() {
    document.querySelectorAll('.qb-map-thumb').forEach(thumb => {
      thumb.classList.toggle('selected', thumb.dataset.levelId === _mapId);
    });
  }

  // ─────────────────────────────────────────────
  // FIGHT BUTTON
  // ─────────────────────────────────────────────
  function _refreshFightBtn() {
    const btn = document.getElementById('qbFightBtn');
    if (!btn) return;
    btn.disabled = !_p1Id || !_p2Id || !_mapId;
  }

  // ─────────────────────────────────────────────
  // WIRE BUTTONS
  // ─────────────────────────────────────────────
  function _wireButtons() {
    const fightBtn = document.getElementById('qbFightBtn');
    if (fightBtn) {
      const clone = fightBtn.cloneNode(true);
      fightBtn.parentNode.replaceChild(clone, fightBtn);
      clone.addEventListener('click', () => {
        if (!_p1Id || !_p2Id || !_mapId) return;
        AudioManager.playSFX('btn_click');
        SaveManager.setSelectedCharacter(_p1Id);
        GameManager.setPlayerCharacter(_p1Id);
        GameManager.setEnemyCharacter(_p2Id);
        GameManager.setCurrentLevel(_mapId);
        GameManager.setQuickBattle(true);
        GameManager.navigate('BATTLE');
      });
    }

    const backBtn = document.getElementById('qbBackBtn');
    if (backBtn) {
      const clone = backBtn.cloneNode(true);
      backBtn.parentNode.replaceChild(clone, backBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        GameManager.navigate('MENU'); // always go to main menu, not previous state
      });
    }
  }

  return { enter, exit };

})();
