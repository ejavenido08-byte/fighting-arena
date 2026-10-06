// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — VICTORY / DEFEAT / UNLOCK / CHAPTER COMPLETE
// Wireframe Panel 5:  Victory screen
// Wireframe Panel 6:  Character Unlock popup
// Wireframe Panel 11: Chapter Complete screen
// Wireframe Panel 12: Defeat / Game Over screen
// ═══════════════════════════════════════════════════════════════

const VictoryScreen = (() => {

  // ═══════════════════════════════════════
  // VICTORY SCREEN (Panel 5)
  // ═══════════════════════════════════════
  function enterVictory(battleResult) {
    const result   = battleResult || GameManager.getLastBattleResult();
    const levelId  = GameManager.getCurrentLevel();
    const level    = levelId ? getLevel(levelId) : null;
    const playerCh = getCharacter(SaveManager.getSelectedCharacter());
    const isQB     = GameManager.isQuickBattle();

    // Update victory button labels based on mode
    const mapBtn2 = document.getElementById('btnReturnMap');
    if (mapBtn2) mapBtn2.textContent = isQB ? 'VS MODE' : 'RETURN TO MAP';
    const nextBtn2 = document.getElementById('btnNextLevel');
    if (nextBtn2) nextBtn2.style.display = isQB ? 'none' : '';

    // Calculate star rating (Wireframe Map Phase 6 E.1)
    const hpPct  = result ? result.playerHPPercent : 0.5;
    const stars  = calcStars(hpPct);

    // Build rewards
    const rewards = level ? level.rewards : { xp: 200, coins: 100 };
    const xp      = rewards.xp    || 0;
    const coins   = rewards.coins || 0;

    // Save progress — only in Story mode, NOT in VS/Quick Battle mode
    if (levelId && !isQB) {
      SaveManager.completeLevel(levelId, stars, xp, coins);
    } else {
      SaveManager.addXP(xp);
      SaveManager.addCoins(coins);
    }

    // Build UI
    _buildVictoryPortrait(playerCh);
    _buildVictoryStars(stars);
    _buildVictoryRewards(rewards, result);
    _buildVictoryStats(result, stars);
    _wireVictoryButtons(level, levelId);

    AudioManager.playMusic('victory', false, false);
    EffectManager.screenFlash('gold');

    // Animate stars with delay
    setTimeout(() => _revealStars(), 400);
  }

  function exitVictory() {}

  function _buildVictoryPortrait(ch) {
    const el = document.getElementById('victoryPortrait');
    if (!el || !ch) return;
    const src = AssetManager.getPortraitSrc(ch.id, 'victory');
    if (src) {
      el.innerHTML = `<img src="${src}" alt="${ch.name}"
        style="width:140px;height:180px;object-fit:cover;object-position:top center;
               border-radius:12px;filter:drop-shadow(0 0 20px ${ch.color}80);" />`;
      el.style.fontSize = '';
    } else {
      el.innerHTML = '';
      el.textContent = ch.emoji;
      el.style.color  = ch.color;
      el.style.filter = `drop-shadow(0 0 24px ${ch.color}80)`;
      el.style.fontSize = 'min(8rem,20vw)';
    }
  }

  function _buildVictoryStars(count) {
    const el = document.getElementById('victoryStars');
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const star = document.createElement('span');
      star.className = `victory-star star-anim-${i}`;
      star.textContent = '★';
      star.style.cssText = `
        color: ${i < count ? '#f5c518' : '#2a2a3e'};
        font-size: 2.5rem;
        opacity: 0;
        transform: scale(0.3);
        display: inline-block;
        transition: opacity 0.3s ease, transform 0.3s ease;
      `;
      el.appendChild(star);
    }
  }

  function _revealStars() {
    const stars = document.querySelectorAll('.victory-star');
    stars.forEach((s, i) => {
      setTimeout(() => {
        s.style.opacity   = '1';
        s.style.transform = 'scale(1.2)';
        setTimeout(() => { s.style.transform = 'scale(1)'; }, 200);
        if (s.style.color !== 'rgb(42, 42, 62)') {
          AudioManager.playSFX('star_reveal');
        }
      }, i * 250);
    });
  }

  function _buildVictoryRewards(rewards, result) {
    const el = document.getElementById('victoryRewards');
    if (!el) return;
    el.innerHTML = '';

    const cards = [
      { icon: '⭐', label: 'EXP',   value: `+${rewards.xp || 0}` },
      { icon: '🪙', label: 'Gold',  value: `+${rewards.coins || 0}` },
    ];
    if (rewards.item) {
      cards.push({ icon: rewards.item.emoji || '🎁', label: 'Item', value: rewards.item.name });
    }

    cards.forEach((card, i) => {
      const div = document.createElement('div');
      div.className = 'reward-card fadeInUp';
      div.style.animationDelay = `${0.3 + i * 0.15}s`;
      div.innerHTML = `
        <div class="reward-card-icon">${card.icon}</div>
        <div class="reward-card-label">${card.label}</div>
        <div class="reward-card-value" data-target="${card.value}">${card.value}</div>
      `;
      el.appendChild(div);
    });
  }

  function _buildVictoryStats(result, stars) {
    const el = document.getElementById('victoryStats');
    if (!el) return;
    if (!result) { el.textContent = ''; return; }
    el.innerHTML = `
      Rounds Won: ${result.roundsWon || 0} &nbsp;|&nbsp;
      Damage Dealt: ${result.damageDealt || 0} &nbsp;|&nbsp;
      Time: ${result.timeUsed ? _formatTime(result.timeUsed) : '—'}
    `;
  }

  function _formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function _wireVictoryButtons(level, levelId) {
    // NEXT LEVEL
    const nextBtn = document.getElementById('btnNextLevel');
    if (nextBtn) {
      const clone = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(clone, nextBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        _handleNextLevel(level, levelId);
      });
    }

    // RETURN TO MAP — in VS Mode go back to VS Mode screen
    const mapBtn = document.getElementById('btnReturnMap');
    if (mapBtn) {
      const clone = mapBtn.cloneNode(true);
      mapBtn.parentNode.replaceChild(clone, mapBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        if (GameManager.isQuickBattle()) {
          GameManager.navigate('QUICK_BATTLE');
        } else {
          GameManager.navigate('CHAPTER_MAP');
        }
      });
    }
  }

  function _handleNextLevel(level, levelId) {
    // Check if we need to show unlock screen
    if (level && level.unlock) {
      const wasNew = SaveManager.unlockCharacter(level.unlock.characterId);
      if (wasNew) {
        GameManager.setPendingUnlock(level.unlock.characterId);
        GameManager.navigate('CHARACTER_UNLOCK');
        return;
      }
    }

    // Check if chapter is complete (this was a boss level)
    if (level && level.isBossLevel) {
      if (level.isFinalBoss) {
        SaveManager.setStoryComplete();
        GameManager.navigate('STORY_COMPLETE');
        return;
      }
      GameManager.navigate('CHAPTER_COMPLETE');
      return;
    }

    // Advance to next level
    // If this was a minion level, next is either the next minion OR the parent (boss) level
    let nextLevel = null;
    if (level && level.isMinion && level.parentLevel) {
      // Check if there's another minion with the same parent after this one
      const siblings = STORY_LEVELS.filter(l => l.parentLevel === level.parentLevel);
      const myIdx    = siblings.findIndex(l => l.id === levelId);
      if (myIdx >= 0 && myIdx < siblings.length - 1) {
        // Go to next minion sibling
        nextLevel = siblings[myIdx + 1];
      } else {
        // All minions done — go to parent (boss/main) level
        nextLevel = getLevel(level.parentLevel);
      }
    } else {
      nextLevel = levelId ? getNextLevel(levelId) : null;
    }

    if (nextLevel) {
      GameManager.setCurrentLevel(nextLevel.id);
      const cutsceneKey = `cutscene_seen_${nextLevel.id}`;
      if (!sessionStorage.getItem(cutsceneKey) && nextLevel.cutscene) {
        GameManager.navigate('CUTSCENE');
      } else if (nextLevel.isBossLevel || nextLevel.isFinalBoss) {
        GameManager.navigate('BOSS_INTRO');
      } else {
        GameManager.navigate('BATTLE');
      }
    } else {
      GameManager.navigate('STORY_MAP');
    }
  }

  // ═══════════════════════════════════════
  // DEFEAT SCREEN (Panel 12)
  // ═══════════════════════════════════════
  function enterDefeat() {
    const playerCh = getCharacter(SaveManager.getSelectedCharacter());
    const el = document.getElementById('defeatPortrait');
    if (el && playerCh) {
      const src = AssetManager.getPortraitSrc(playerCh.id, 'select');
      if (src) {
        el.innerHTML = `<img src="${src}" alt="${playerCh.name}"
          style="width:120px;height:160px;object-fit:cover;object-position:top center;
                 border-radius:8px;filter:grayscale(0.8) brightness(0.4);" />`;
        el.style.fontSize = '';
      } else {
        el.innerHTML  = '';
        el.textContent = playerCh.emoji;
        el.style.filter = 'grayscale(0.8) brightness(0.5)';
        el.style.fontSize = 'min(6rem,18vw)';
      }
    }

    // Update button labels based on game mode
    const isQB = GameManager.isQuickBattle();
    const csBtn2 = document.getElementById('btnDefeatCharSelect');
    if (csBtn2) csBtn2.textContent = isQB ? 'VS MODE' : 'CHARACTER SELECT';
    const smBtn2 = document.getElementById('btnDefeatStoryMap');
    if (smBtn2) smBtn2.textContent = isQB ? 'MAIN MENU' : 'STORY MAP';
    const mapBtn2 = document.getElementById('btnReturnMap');
    if (mapBtn2) mapBtn2.textContent = isQB ? 'VS MODE' : 'RETURN TO MAP';

    _wireDefeatButtons();
    AudioManager.playMusic('defeat', false, false);
    EffectManager.screenFlash('red');
  }

  function exitDefeat() {}

  function _wireDefeatButtons() {
    // RETRY
    const retryBtn = document.getElementById('btnRetry');
    if (retryBtn) {
      const clone = retryBtn.cloneNode(true);
      retryBtn.parentNode.replaceChild(clone, retryBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        const levelId = GameManager.getCurrentLevel();
        const level   = levelId ? getLevel(levelId) : null;
        if (level && (level.isBossLevel || level.isFinalBoss)) {
          GameManager.navigate('BOSS_INTRO');
        } else {
          GameManager.navigate('BATTLE');
        }
      });
    }

    // CHARACTER SELECT → VS MODE if quick battle
    const csBtn = document.getElementById('btnDefeatCharSelect');
    if (csBtn) {
      const clone = csBtn.cloneNode(true);
      csBtn.parentNode.replaceChild(clone, csBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        if (GameManager.isQuickBattle()) {
          GameManager.navigate('QUICK_BATTLE');
        } else {
          GameManager.navigate('CHARACTER_SELECT');
        }
      });
    }

    // STORY MAP — in VS Mode go back to VS Mode
    const smBtn = document.getElementById('btnDefeatStoryMap');
    if (smBtn) {
      const clone = smBtn.cloneNode(true);
      smBtn.parentNode.replaceChild(clone, smBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        if (GameManager.isQuickBattle()) {
          GameManager.navigate('QUICK_BATTLE');
        } else {
          GameManager.navigate('STORY_MAP');
        }
      });
    }
  }

  // ═══════════════════════════════════════
  // CHARACTER UNLOCK POPUP (Panel 6)
  // ═══════════════════════════════════════
  function enterUnlock() {
    const charId = GameManager.getPendingUnlock();
    const ch     = getCharacter(charId);
    if (!ch) { GameManager.navigate('STORY_MAP'); return; }

    const portraitEl  = document.getElementById('unlockPortrait');
    const nameEl      = document.getElementById('unlockName');
    const elementEl   = document.getElementById('unlockElement');
    const roleEl      = document.getElementById('unlockRole');
    const descEl      = document.getElementById('unlockDesc');

    if (portraitEl) {
      const src = AssetManager.getPortraitSrc(ch.id, 'select');
      if (src) {
        portraitEl.innerHTML = `<img src="${src}" alt="${ch.name}"
          style="width:160px;height:210px;object-fit:cover;object-position:top center;
                 border-radius:12px;filter:drop-shadow(0 0 40px ${ch.color});" />`;
        portraitEl.style.fontSize = '';
        portraitEl.style.animation = 'unlockPortraitIn 0.7s 0.2s ease both';
      } else {
        portraitEl.innerHTML  = '';
        portraitEl.textContent = ch.emoji;
        portraitEl.style.color = ch.color;
        portraitEl.style.fontSize = 'min(10rem,28vw)';
        portraitEl.style.filter = `drop-shadow(0 0 40px ${ch.color}80)`;
        portraitEl.style.animation = 'unlockPortraitIn 0.7s 0.2s ease both';
      }
    }
    if (nameEl)     nameEl.textContent     = ch.name;
    if (elementEl)  elementEl.textContent  = `Element: ${ch.element}`;
    if (roleEl)     roleEl.textContent     = `Role: ${ch.role}`;
    if (descEl)     descEl.textContent     = ch.description;

    AudioManager.playMusic('unlock', false, false);
    EffectManager.screenFlash('gold');

    // Wire OK / Continue button
    const contBtn = document.getElementById('btnUnlockContinue');
    if (contBtn) {
      const clone = contBtn.cloneNode(true);
      contBtn.parentNode.replaceChild(clone, contBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        GameManager.clearPendingUnlock();
        _afterUnlockFlow();
      });
    }
  }

  function exitUnlock() {}

  function _afterUnlockFlow() {
    const levelId = GameManager.getCurrentLevel();
    const level   = levelId ? getLevel(levelId) : null;

    if (level && level.isFinalBoss) {
      SaveManager.setStoryComplete();
      GameManager.navigate('STORY_COMPLETE');
    } else if (level && level.isBossLevel) {
      GameManager.navigate('CHAPTER_COMPLETE');
    } else {
      const nextLevel = levelId ? getNextLevel(levelId) : null;
      if (nextLevel) {
        GameManager.setCurrentLevel(nextLevel.id);
        const cutKey = `cutscene_seen_${nextLevel.id}`;
        if (!sessionStorage.getItem(cutKey) && nextLevel.cutscene) {
          GameManager.navigate('CUTSCENE');
        } else {
          GameManager.navigate('BATTLE');
        }
      } else {
        GameManager.navigate('STORY_MAP');
      }
    }
  }

  // ═══════════════════════════════════════
  // CHAPTER COMPLETE (Panel 11)
  // ═══════════════════════════════════════
  function enterChapterComplete() {
    const levelId  = GameManager.getCurrentLevel();
    const level    = levelId ? getLevel(levelId) : null;
    const chapterId = level ? level.chapter : null;
    const chapter   = chapterId ? getChapter(chapterId) : null;

    const titleEl   = document.getElementById('chapterCompleteTitle');
    const starsEl   = document.getElementById('chapterCompleteStars');
    const rewardsEl = document.getElementById('chapterCompleteRewards');

    if (titleEl) {
      titleEl.textContent = chapter
        ? `${chapter.title}: ${chapter.subtitle} COMPLETE!`
        : 'CHAPTER COMPLETE!';
    }

    // Chapter stars
    if (starsEl && chapterId) {
      const { earned, max } = SaveManager.getChapterStars(chapterId);
      starsEl.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const s = document.createElement('span');
        s.textContent = '★';
        s.style.color = i < Math.round((earned / max) * 3) ? '#f5c518' : '#2a2a3e';
        s.style.fontSize = '2rem';
        starsEl.appendChild(s);
      }
    }

    // Chapter rewards
    if (rewardsEl && chapterId) {
      const levels = getLevelsForChapter(chapterId);
      let totalXP = 0, totalCoins = 0;
      levels.forEach(l => { if (l && l.rewards) { totalXP += l.rewards.xp || 0; totalCoins += l.rewards.coins || 0; } });
      rewardsEl.innerHTML = `
        <div class="reward-card"><div class="reward-card-icon">⭐</div><div class="reward-card-label">EXP</div><div class="reward-card-value">+${totalXP}</div></div>
        <div class="reward-card"><div class="reward-card-icon">🪙</div><div class="reward-card-label">Gold</div><div class="reward-card-value">+${totalCoins}</div></div>
        ${chapter && chapter.reward ? `<div class="reward-card"><div class="reward-card-icon">🔓</div><div class="reward-card-label">New Skill</div><div class="reward-card-value">${chapter.reward.label}</div></div>` : ''}
      `;
    }

    AudioManager.playMusic('victory', false, false);
    EffectManager.screenFlash('gold');
    _wireChapterCompleteButtons();
  }

  function exitChapterComplete() {}

  function _wireChapterCompleteButtons() {
    const btn = document.getElementById('btnNextChapter');
    if (btn) {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        GameManager.navigate('STORY_MAP');
      });
    }
  }

  // ═══════════════════════════════════════
  // STORY COMPLETE (Final)
  // ═══════════════════════════════════════
  function enterStoryComplete() {
    const save = SaveManager.get();

    // Roster display
    const rosterEl = document.getElementById('storyCompleteRoster');
    if (rosterEl) {
      rosterEl.innerHTML = CHARACTER_ORDER.map(id => {
        const ch = getCharacter(id);
        return ch ? `<span title="${ch.name}" style="color:${ch.color}">${ch.emoji}</span>` : '';
      }).join('');
    }

    // Stats
    const statsEl = document.getElementById('storyCompleteStats');
    if (statsEl) {
      statsEl.innerHTML = `
        Levels Completed: ${save.completedLevels.length} / 10<br>
        Total Stars: ${SaveManager.getTotalStars()} / 30<br>
        Total XP: ${save.playerXP}<br>
        Total Coins: ${save.coins}<br>
        Characters Unlocked: ${save.unlockedCharacters.length} / 10
      `;
    }

    AudioManager.playMusic('victory', true, true);
    EffectManager.screenFlash('gold');
    _wireStoryCompleteButtons();
  }

  function exitStoryComplete() {}

  function _wireStoryCompleteButtons() {
    [
      ['btnPlayAgain',    () => { SaveManager.reset(); GameManager.navigate('MENU'); }],
      ['btnSCCharSelect', () => GameManager.navigate('CHARACTER_SELECT')],
      ['btnSCMainMenu',  () => GameManager.navigate('MENU')],
    ].forEach(([id, handler]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', () => { AudioManager.playSFX('btn_click'); handler(); });
    });
  }

  // ═══════════════════════════════════════
  // BOSS INTRO SCREEN
  // ═══════════════════════════════════════
  function enterBossIntro() {
    const levelId = GameManager.getCurrentLevel();
    const level   = levelId ? getLevel(levelId) : null;
    if (!level || !level.enemy) { GameManager.navigate('BATTLE'); return; }

    const enemy = level.enemy;
    const ch    = getCharacter(enemy.characterId);

    const portraitEl  = document.getElementById('bossIntroPortrait');
    const nameEl      = document.getElementById('bossIntroName');
    const subtitleEl  = document.getElementById('bossIntroSubtitle');
    const fightEl     = document.getElementById('bossIntroFight');

    if (portraitEl && ch) {
      const src = AssetManager.getPortraitSrc(ch.id, 'select');
      if (src) {
        portraitEl.innerHTML = `<img src="${src}" alt="${ch.name}"
          style="width:160px;height:210px;object-fit:cover;object-position:top center;
                 border-radius:12px;filter:drop-shadow(0 0 50px ${ch.color});" />`;
        portraitEl.style.fontSize = '';
      } else {
        portraitEl.innerHTML  = '';
        portraitEl.textContent = ch.emoji;
        portraitEl.style.fontSize = 'min(12rem,35vw)';
        portraitEl.style.filter = `drop-shadow(0 0 50px ${ch.color})`;
      }
    }
    if (nameEl)     nameEl.textContent    = enemy.name || (ch ? ch.name : 'BOSS');
    if (subtitleEl) subtitleEl.textContent = enemy.bossSubtitle || '';
    if (fightEl)    fightEl.style.opacity = '0';

    AudioManager.playSFX('round_start');

    // Auto-proceed after animation completes
    setTimeout(() => {
      GameManager.navigate('BATTLE');
    }, 2800);
  }

  function exitBossIntro() {}

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    enterVictory,
    exitVictory,
    enterDefeat,
    exitDefeat,
    enterUnlock,
    exitUnlock,
    enterChapterComplete,
    exitChapterComplete,
    enterStoryComplete,
    exitStoryComplete,
    enterBossIntro,
    exitBossIntro,
  };

})();
