// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — CHARACTER INFO SCREEN
// Read-only. Shows all 10 characters + abilities.
// Layout: horizontal thumb row at top, detail panel below.
// ═══════════════════════════════════════════════════════════════

const CharacterSelectScreen = (() => {

  let _activeId = null;

  // ─────────────────────────────────────────────
  function enterSelect() {
    // Keep menu music playing
    _activeId = null;
    _buildRow();
    _showEmpty();
    _wireBack();
  }
  function exitSelect() {}
  function enterProfile() { GameManager.navigate('CHARACTER_SELECT'); }
  function exitProfile()  {}

  // ─────────────────────────────────────────────
  // THUMB ROW
  // ─────────────────────────────────────────────
  function _buildRow() {
    const row = document.getElementById('charinfoGrid');
    if (!row) return;
    row.innerHTML = '';

    CHARACTER_ORDER.forEach(charId => {
      const ch   = getCharacter(charId);
      if (!ch) return;

      const thumb = document.createElement('div');
      thumb.className    = 'ci-thumb';
      thumb.dataset.id   = charId;

      const src = AssetManager.getPortraitSrc(charId, 'select');
      if (src) {
        thumb.innerHTML = `<img src="${src}" alt="${ch.name}" />`;
      } else {
        thumb.innerHTML = `<div class="ci-thumb-emoji" style="color:${ch.color}">${ch.emoji}</div>`;
        AssetManager.onPortraitLoaded(id => {
          if (id !== charId) return;
          const fresh = AssetManager.getPortraitSrc(charId, 'select');
          if (fresh) thumb.innerHTML = `<img src="${fresh}" alt="${ch.name}" /><div class="ci-thumb-name">${ch.name}</div>`;
        });
      }
      thumb.innerHTML += `<div class="ci-thumb-name">${ch.name}</div>`;

      thumb.addEventListener('click', () => {
        AudioManager.playSFX('navigate');
        _activeId = charId;
        document.querySelectorAll('.ci-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        _showDetail(ch);
      });

      row.appendChild(thumb);
    });
  }

  // ─────────────────────────────────────────────
  // DETAIL PANEL
  // ─────────────────────────────────────────────
  function _showEmpty() {
    const d = document.getElementById('charinfoDetail');
    if (d) d.innerHTML = '<div class="ci-empty">← Select a character to view abilities</div>';
  }

  function _showDetail(ch) {
    const d = document.getElementById('charinfoDetail');
    if (!d) return;

    // Portrait
    const src = AssetManager.getPortraitSrc(ch.id, 'select')
             || AssetManager.getPortraitSrc(ch.id, 'cutscene');
    const portraitHtml = src
      ? `<img src="${src}" alt="${ch.name}" />`
      : `<div class="ci-detail-portrait-emoji" style="color:${ch.color}">${ch.emoji}</div>`;

    // Stats
    const stats    = ch.displayStats;
    const statList = [
      { label:'HP',      val:stats.hp },
      { label:'Energy',  val:stats.energy },
      { label:'Speed',   val:stats.speed },
      { label:'Attack',  val:stats.attack },
      { label:'Defense', val:stats.defense },
    ];
    const statsHtml = statList.map(s => {
      const pct   = (s.val / 10) * 100;
      const color = s.val >= 8 ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                  : s.val >= 5 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                  :              'linear-gradient(90deg,#ef4444,#dc2626)';
      return `<div class="ci-stat-row">
        <div class="ci-stat-label">${s.label}</div>
        <div class="ci-stat-track"><div class="ci-stat-fill" style="width:0%;background:${color}" data-pct="${pct}"></div></div>
        <div class="ci-stat-val">${s.val}/10</div>
      </div>`;
    }).join('');

    // Passive
    const p = ch.passive;
    const passiveHtml = p ? `<div class="ci-passive">
      <div class="ci-passive-label">PASSIVE</div>
      <div class="ci-passive-name">${p.name}</div>
      <div class="ci-passive-desc">${p.description}</div>
    </div>` : '';

    // Skills
    const skillsHtml = ch.skills.map(sk => `
      <div class="ci-skill-item${sk.type === 'ultimate' ? ' ult' : ''}">
        <div class="ci-skill-emoji">${sk.emoji}</div>
        <div class="ci-skill-info">
          <div class="ci-skill-name">${sk.name}${sk.type === 'ultimate' ? ' ⭐' : ''}</div>
          <div class="ci-skill-desc">${sk.description}</div>
        </div>
        <div class="ci-skill-cost">${sk.energyCost > 0 ? `${sk.energyCost}⚡` : 'Free'}</div>
      </div>`).join('');

    d.innerHTML = `
      <div class="ci-detail-header">
        <div class="ci-detail-portrait">${portraitHtml}</div>
        <div class="ci-detail-info">
          <div class="ci-detail-logo">${ch.emoji}</div>
          <div class="ci-detail-name">${ch.name}</div>
          <div class="ci-detail-badge" style="background:${ch.color}">${ch.element} · ${ch.role}</div>
          <div class="ci-detail-desc">${ch.description}</div>
        </div>
      </div>
      <div class="ci-stats">${statsHtml}</div>
      ${passiveHtml}
      <div class="ci-skills-label">SKILLS & ABILITIES</div>
      <div class="ci-skill-list">${skillsHtml}</div>
    `;

    // Animate stat bars
    requestAnimationFrame(() => {
      d.querySelectorAll('.ci-stat-fill').forEach(el => {
        el.style.width = el.dataset.pct + '%';
      });
    });

    // Upgrade portrait if it loads later
    AssetManager.onPortraitLoaded(id => {
      if (id === ch.id && _activeId === ch.id) _showDetail(ch);
    });
  }

  // ─────────────────────────────────────────────
  function _wireBack() {
    const btn = document.getElementById('charSelectBack');
    if (!btn) return;
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', () => {
      AudioManager.playSFX('btn_click');
      GameManager.navigateBack();
    });
  }

  return { enterSelect, exitSelect, enterProfile, exitProfile };

})();
