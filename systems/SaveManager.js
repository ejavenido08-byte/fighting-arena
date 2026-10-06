// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — SAVE MANAGER
// localStorage-based save system with auto-save, reset,
// versioning, and corruption recovery
// ═══════════════════════════════════════════════════════════════

const SaveManager = (() => {

  const SAVE_KEY     = 'fightingArena_save';
  const SETTINGS_KEY = 'fightingArena_settings';
  const SAVE_VERSION = 2;

  // ─────────────────────────────────────────────
  // DEFAULT SAVE STATE (Master Spec)
  // ─────────────────────────────────────────────
  const DEFAULT_SAVE = {
    version:            SAVE_VERSION,
    unlockedCharacters: ['ember', 'frost'],
    completedLevels:    [],          // array of level IDs
    starsEarned:        {},          // { level1: 3, level2: 2, ... }
    currentLevel:       1,
    currentChapter:     1,
    selectedCharacter:  'ember',
    coins:              0,
    playerXP:           0,
    inventory:          [],
    storyComplete:      false,
    totalPlayTime:      0,
  };

  const DEFAULT_SETTINGS = {
    musicVolume: 70,
    sfxVolume:   80,
    fullscreen:  false,
  };

  // ─────────────────────────────────────────────
  // INTERNAL STATE
  // ─────────────────────────────────────────────
  let _save     = null;
  let _settings = null;

  // ─────────────────────────────────────────────
  // LOAD
  // ─────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        _save = deepClone(DEFAULT_SAVE);
        return _save;
      }
      const parsed = JSON.parse(raw);

      // Version migration: if save is old, merge with defaults
      if (!parsed.version || parsed.version < SAVE_VERSION) {
        _save = Object.assign(deepClone(DEFAULT_SAVE), parsed);
        _save.version = SAVE_VERSION;
        save();
        return _save;
      }

      // Validate required fields
      _save = Object.assign(deepClone(DEFAULT_SAVE), parsed);
      return _save;
    } catch (e) {
      console.warn('[SaveManager] Corrupted save data, resetting.', e);
      _save = deepClone(DEFAULT_SAVE);
      save();
      return _save;
    }
  }

  // ─────────────────────────────────────────────
  // SAVE
  // ─────────────────────────────────────────────
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(_save));
    } catch (e) {
      console.error('[SaveManager] Failed to save:', e);
    }
  }

  // ─────────────────────────────────────────────
  // SETTINGS LOAD / SAVE
  // ─────────────────────────────────────────────
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        _settings = deepClone(DEFAULT_SETTINGS);
        return _settings;
      }
      _settings = Object.assign(deepClone(DEFAULT_SETTINGS), JSON.parse(raw));
      return _settings;
    } catch (e) {
      _settings = deepClone(DEFAULT_SETTINGS);
      return _settings;
    }
  }

  function saveSettings(partial) {
    if (!_settings) loadSettings();
    Object.assign(_settings, partial);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
    } catch (e) {
      console.error('[SaveManager] Failed to save settings:', e);
    }
  }

  function getSettings() {
    if (!_settings) loadSettings();
    return _settings;
  }

  // ─────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────
  function get() {
    if (!_save) load();
    return _save;
  }

  function isCharacterUnlocked(charId) {
    return get().unlockedCharacters.includes(charId);
  }

  function isLevelCompleted(levelId) {
    return get().completedLevels.includes(levelId);
  }

  function getStars(levelId) {
    return get().starsEarned[levelId] || 0;
  }

  function getTotalStars() {
    return Object.values(get().starsEarned).reduce((a, b) => a + b, 0);
  }

  function getChapterStars(chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) return { earned: 0, max: 0 };
    let earned = 0;
    let max    = chapter.levels.length * 3;
    chapter.levels.forEach(lid => { earned += getStars(lid); });
    return { earned, max };
  }

  function getSelectedCharacter() {
    return get().selectedCharacter || 'ember';
  }

  // ─────────────────────────────────────────────
  // SETTERS / UPDATERS
  // ─────────────────────────────────────────────
  function unlockCharacter(charId) {
    if (!get().unlockedCharacters.includes(charId)) {
      get().unlockedCharacters.push(charId);
      save();
      return true;  // newly unlocked
    }
    return false;   // already had it
  }

  function completeLevel(levelId, stars, xpGained, coinsGained) {
    const s = get();

    // Only add to completed if not already there
    if (!s.completedLevels.includes(levelId)) {
      s.completedLevels.push(levelId);
    }

    // Update stars only if improved
    const currentStars = s.starsEarned[levelId] || 0;
    if (stars > currentStars) {
      s.starsEarned[levelId] = stars;
    }

    // Add rewards
    s.playerXP += (xpGained  || 0);
    s.coins    += (coinsGained || 0);

    // Advance currentLevel pointer if this is the furthest
    const levelNum = parseInt(levelId.replace('level', ''));
    if (levelNum >= (s.currentLevel || 1)) {
      s.currentLevel = levelNum + 1;
    }

    save();
  }

  function addItem(item) {
    get().inventory.push(item);
    save();
  }

  function setSelectedCharacter(charId) {
    get().selectedCharacter = charId;
    save();
  }

  function setStoryComplete() {
    get().storyComplete = true;
    save();
  }

  function addCoins(amount) {
    get().coins += amount;
    save();
  }

  function addXP(amount) {
    get().playerXP += amount;
    save();
  }

  // ─────────────────────────────────────────────
  // RESET (with confirmation guard)
  // ─────────────────────────────────────────────
  function resetWithConfirmation() {
    return new Promise((resolve) => {
      const confirmed = window.confirm(
        '⚠️ RESET SAVE DATA\n\n' +
        'This will permanently delete ALL progress:\n' +
        '• Unlocked characters\n' +
        '• Completed levels\n' +
        '• Coins and XP\n\n' +
        'This cannot be undone. Are you sure?'
      );
      if (confirmed) {
        reset();
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  function reset() {
    _save = deepClone(DEFAULT_SAVE);
    localStorage.removeItem(SAVE_KEY);
    save();
    console.log('[SaveManager] Save data reset.');
  }

  // ─────────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────────
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Check if save data exists
  function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    load,
    save,
    get,
    hasSave,
    loadSettings,
    saveSettings,
    getSettings,
    isCharacterUnlocked,
    isLevelCompleted,
    getStars,
    getTotalStars,
    getChapterStars,
    getSelectedCharacter,
    unlockCharacter,
    completeLevel,
    addItem,
    setSelectedCharacter,
    setStoryComplete,
    addCoins,
    addXP,
    reset,
    resetWithConfirmation,
  };

})();
