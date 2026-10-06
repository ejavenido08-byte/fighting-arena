// FIGHTING ARENA — STORY MAP SCREENS
// Wireframe Panel 9: Chapter Progression List
// Wireframe Panel 2: Chapter Level Map with nodes
// ═══════════════════════════════════════════════════════════════

const StoryMapScreen = (() => {

  let _currentChapterId = null;

  // ═══════════════════════════════════════
  // STORY MAP (Chapter List — Panel 9)
  // ═══════════════════════════════════════
  function enterStoryMap() {
    // Music already started from Main Menu — just continue
    _buildChapterList();
    _wireStoryMapButtons();
    _buildChapterList();
    _wireStoryMapButtons();
  }

  function exitStoryMap() {}

  function _buildChapterList() {
    const list = document.getElementById('chapterList');
    if (!list) return;
    list.innerHTML = '';

    const save = SaveManager.get();

    CHAPTERS.forEach((chapter, idx) => {
      const allLevelsDone = chapter.levels.every(lid => save.completedLevels.includes(lid));
      const isCompleted   = allLevelsDone;
      const isAvailable   = _isChapterAvailable(chapter.id, save);
      const isLocked      = !isCompleted && !isAvailable;

      let statusClass = isLocked ? 'locked' : isAvailable ? 'available' : 'completed';
      let statusText  = isLocked ? '🔒 Locked' : isCompleted ? '✓ Completed' : '▶ Available';
      let statusCls   = isLocked ? 'status-locked' : isCompleted ? 'status-completed' : 'status-available';

      const card = document.createElement('div');
      card.className = `chapter-card ${statusClass}`;
      card.innerHTML = `
        <div class="chapter-card-icon">${_chapterEmoji(chapter.id)}</div>
        <div class="chapter-card-info">
          <div class="chapter-card-num">${chapter.title}</div>
          <div class="chapter-card-name">${chapter.subtitle}</div>
          <div class="chapter-card-status ${statusCls}">${statusText}</div>
        </div>
        <div class="chapter-card-arrow">${isLocked ? '' : '›'}</div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          AudioManager.playSFX('btn_click');
          GameManager.setCurrentChapter(chapter.id);
          GameManager.navigate('CHAPTER_MAP');
        });
      }

      list.appendChild(card);

      if (idx < CHAPTERS.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'chapter-connector';
        arrow.textContent = '↓';
        list.appendChild(arrow);
      }
    });
  }

  function _isChapterAvailable(chapterId, save) {
    const chapter = getChapter(chapterId);
    if (!chapter) return false;
    if (chapterId === 'chapter1') return true;

    const idx = CHAPTERS.findIndex(c => c.id === chapterId);
    if (idx <= 0) return true;
    const prevChapter = CHAPTERS[idx - 1];
    const prevLevels  = prevChapter.levels;
    const bossLevelId = prevLevels[prevLevels.length - 1];
    return save.completedLevels.includes(bossLevelId);
  }

  function _chapterEmoji(id) {
    const map = { chapter1: '🔥', chapter2: '⚔️', chapter3: '🌑', chapter4: '🏆' };
    return map[id] || '📖';
  }

  function _wireStoryMapButtons() {
    const backBtn = document.querySelector('#screen-storymap [data-action="backToMenu"]');
    if (backBtn) {
      const clone = backBtn.cloneNode(true);
      backBtn.parentNode.replaceChild(clone, backBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        GameManager.navigate('MENU');
      });
    }
  }

  // ═══════════════════════════════════════
  // CHAPTER MAP (Level Nodes — Panel 2)
  // ═══════════════════════════════════════
  function enterChapterMap(chapterId) {
    _currentChapterId = chapterId || GameManager.getCurrentChapter();
    const chapter = getChapter(_currentChapterId);
    if (!chapter) { GameManager.navigate('STORY_MAP'); return; }

    // Apply per-chapter background
    const screenBg = document.querySelector('#screen-chaptermap .screen-bg');
    if (screenBg) {
      if (chapter.mapBg) {
        screenBg.style.backgroundImage = `url('${chapter.mapBg}')`;
        screenBg.style.backgroundSize = 'cover';
        screenBg.style.backgroundPosition = 'center';
        screenBg.style.backgroundRepeat = 'no-repeat';
      } else {
        screenBg.style.backgroundImage = '';
      }
    }

    _buildChapterMapHeader(chapter);
    _buildLevelPath(chapter);
    _buildRewardPanel(chapter);
    _wireChapterMapButtons();
  }

  function exitChapterMap() {}

  function _buildChapterMapHeader(chapter) {
    const titleEl = document.getElementById('chapterMapTitle');
    const starEl  = document.getElementById('chapterStarCounter');
    if (titleEl) titleEl.textContent = `${chapter.title} — ${chapter.subtitle}`;

    if (starEl) {
      const { earned, max } = SaveManager.getChapterStars(chapter.id);
      starEl.innerHTML = `⭐ ${earned}/${max}`;
    }
  }

  function _buildLevelPath(chapter) {
    const path = document.getElementById('chapterMapPath');
    if (!path) return;
    path.innerHTML = '';

    const save   = SaveManager.get();
    const levels = getLevelsForChapter(chapter.id);

    levels.forEach((level, idx) => {
      if (!level) return;

      const isCompleted = save.completedLevels.includes(level.id);
      const isAvailable = _isLevelAvailable(level, save, chapter);
      const isLocked    = !isCompleted && !isAvailable;
      const isBoss      = level.isBossLevel || level.isFinalBoss;
      const stars       = SaveManager.getStars(level.id);

      let nodeStatus = isLocked ? 'locked' : isCompleted ? 'completed' : 'available';
      if (isBoss) nodeStatus += ' boss-node';

      const node = document.createElement('div');
      node.className = `level-node ${nodeStatus}`;

      let starHtml = '';
      for (let s = 0; s < 3; s++) {
        starHtml += `<span class="${s < stars ? 'star-filled' : 'star-empty'}">★</span>`;
      }

      let nodeIcon = isLocked ? '🔒' : isCompleted ? '✓' : isBoss ? '💀' : level.nodeLabel || idx + 1;

      node.innerHTML = `
        <div class="level-node-circle">${nodeIcon}</div>
        <div class="level-node-label">${level.title || ''}</div>
        <div class="level-node-stars">${starHtml}</div>
      `;

      if (!isLocked) {
        node.addEventListener('click', () => {
          AudioManager.playSFX('btn_click');
          GameManager.setCurrentLevel(level.id);
          // Enter cutscene first if not visited, else go direct to battle
          const cutsceneKey = `cutscene_seen_${level.id}`;
          if (!sessionStorage.getItem(cutsceneKey) && level.cutscene) {
            GameManager.navigate('CUTSCENE');
          } else {
            _startBattle(level);
          }
        });
      }

      path.appendChild(node);
    });
  }

  function _isLevelAvailable(level, save, chapter) {
    const idx = chapter.levels.indexOf(level.id);
    if (idx <= 0) return true;

    if (!_isChapterAvailable(chapter.id, save)) return false;

    const prevLevelId = chapter.levels[idx - 1];
    return save.completedLevels.includes(prevLevelId);
  }

  function _startBattle(level) {
    // Stop menu music when going directly to battle (no cutscene)
    AudioManager.stopMusic(0.5);
    if (level.isBossLevel || level.isFinalBoss) {
      GameManager.navigate('BOSS_INTRO');
    } else {
      GameManager.navigate('BATTLE');
    }
  }

  function _buildRewardPanel(chapter) {
    const panel = document.getElementById('chapterRewardPanel');
    if (!panel || !chapter.reward) { if (panel) panel.style.display = 'none'; return; }
    panel.style.display = '';

    const isUnlocked = chapter.reward.type === 'character'
      ? SaveManager.isCharacterUnlocked(chapter.reward.characterId)
      : false;

    panel.innerHTML = `
      <div style="font-size:0.8rem;">
        <div class="reward-panel-label">Chapter Reward</div>
        <div class="reward-panel-value">${isUnlocked ? '✓ ' : ''}${chapter.reward.label}</div>
      </div>
    `;
  }

  function _wireChapterMapButtons() {
    const backBtn = document.querySelector('#screen-chaptermap [data-action="backToStoryMap"]');
    if (backBtn) {
      const clone = backBtn.cloneNode(true);
      backBtn.parentNode.replaceChild(clone, backBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        GameManager.navigate('STORY_MAP');
      });
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    enterStoryMap,
    exitStoryMap,
    enterChapterMap,
    exitChapterMap,
  };

})();
