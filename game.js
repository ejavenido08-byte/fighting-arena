// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — GAME MANAGER + SCREEN MANAGER
// Central state router. All navigation goes through GameManager.
// Manages screen transitions, game context, battle results.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// GAME STATES (Master Spec)
// ─────────────────────────────────────────────
const STATES = {
  LOGIN:             'LOGIN',
  MENU:              'MENU',
  STORY_MAP:         'STORY_MAP',
  CHAPTER_MAP:       'CHAPTER_MAP',
  CHARACTER_SELECT:  'CHARACTER_SELECT',
  CHAR_PROFILE:      'CHAR_PROFILE',
  QUICK_BATTLE:      'QUICK_BATTLE',
  PROLOGUE:          'PROLOGUE',
  CUTSCENE:          'CUTSCENE',
  BOSS_INTRO:        'BOSS_INTRO',
  BATTLE:            'BATTLE',
  ROUND_RESULT:      'ROUND_RESULT',
  VICTORY:           'VICTORY',
  DEFEAT:            'DEFEAT',
  CHARACTER_UNLOCK:  'CHARACTER_UNLOCK',
  CHAPTER_COMPLETE:  'CHAPTER_COMPLETE',
  STORY_COMPLETE:    'STORY_COMPLETE',
  HOW_TO_PLAY:       'HOW_TO_PLAY',
  SETTINGS:          'SETTINGS',
};

// ─────────────────────────────────────────────
// SCREEN → HTML element ID map
// ─────────────────────────────────────────────
const SCREEN_IDS = {
  [STATES.LOGIN]:            'screen-login',
  [STATES.MENU]:             'screen-menu',
  [STATES.STORY_MAP]:        'screen-storymap',
  [STATES.CHAPTER_MAP]:      'screen-chaptermap',
  [STATES.CHARACTER_SELECT]: 'screen-charselect',
  [STATES.CHAR_PROFILE]:     'screen-charprofile',
  [STATES.QUICK_BATTLE]:     'screen-quickbattle',
  [STATES.PROLOGUE]:         'screen-prologue',
  [STATES.CUTSCENE]:         'screen-cutscene',
  [STATES.BOSS_INTRO]:       'screen-bossintro',
  [STATES.BATTLE]:           'screen-battle',
  [STATES.ROUND_RESULT]:     'screen-battle',   // round result shown as overlay on battle canvas
  [STATES.VICTORY]:          'screen-victory',
  [STATES.DEFEAT]:           'screen-defeat',
  [STATES.CHARACTER_UNLOCK]: 'screen-unlock',
  [STATES.CHAPTER_COMPLETE]: 'screen-chaptercomplete',
  [STATES.STORY_COMPLETE]:   'screen-storycomplete',
  [STATES.HOW_TO_PLAY]:      'screen-howtoplay',
  [STATES.SETTINGS]:         'screen-settings',
};

// ─────────────────────────────────────────────
// SCREEN MANAGER
// Handles showing/hiding screens with transitions
// ─────────────────────────────────────────────
const ScreenManager = (() => {
  let _currentScreenId = null;
  let _transitioning   = false;
  const _overlay       = document.getElementById('transitionOverlay');

  function show(screenId, instant = false) {
    // If transitioning, force-complete the switch immediately
    if (_transitioning) {
      _transitioning = false;
    }

    const newEl = document.getElementById(screenId);
    if (!newEl) { console.warn('[ScreenManager] Screen not found:', screenId); return; }

    if (instant) {
      _doSwitch(screenId);
      return;
    }

    _transitioning = true;
    if (_overlay) _overlay.classList.add('fade-in');

    setTimeout(() => {
      _doSwitch(screenId);
      if (_overlay) _overlay.classList.remove('fade-in');
      _transitioning = false;
    }, 220);
  }

  function _doSwitch(screenId) {
    // Deactivate all screens
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.remove('active');
    });
    // Activate target
    const el = document.getElementById(screenId);
    if (el) {
      el.classList.add('active');
      _currentScreenId = screenId;
    }
  }

  function getCurrent() { return _currentScreenId; }

  return { show, getCurrent };
})();

// ─────────────────────────────────────────────
// GAME MANAGER
// Central orchestrator — single source of truth
// ─────────────────────────────────────────────
const GameManager = (() => {

  // ─── Internal context state ───
  let _currentState      = null;
  let _previousState     = null;
  let _currentLevel      = null;   // level ID string
  let _currentChapter    = 'chapter1';
  let _playerCharId      = 'ember';
  let _enemyCharId       = null;
  let _viewedCharId      = null;
  let _pendingUnlock     = null;
  let _lastBattleResult  = null;
  let _isQuickBattle     = false;

  // ─────────────────────────────────────────────
  // NAVIGATE
  // ─────────────────────────────────────────────
  function navigate(stateName) {
    const state    = STATES[stateName] || stateName;
    const screenId = SCREEN_IDS[state];

    if (!screenId) {
      console.warn('[GameManager] No screen mapped for state:', state);
      return;
    }

    // Exit current screen
    _exitCurrentScreen();

    _previousState = _currentState;
    _currentState  = state;

    // Show screen
    ScreenManager.show(screenId);

    // Enter new screen
    _enterScreen(state);
  }

  function navigateBack() {
    if (_previousState) navigate(_previousState);
    else navigate('MENU');
  }

  function _exitCurrentScreen() {
    if (!_currentState) return;
    switch (_currentState) {
      case STATES.LOGIN:            LoginScreen.exit();       break;
      case STATES.MENU:             MainMenuScreen.exit();    break;
      case STATES.STORY_MAP:        StoryMapScreen.exitStoryMap();  break;
      case STATES.CHAPTER_MAP:      StoryMapScreen.exitChapterMap(); break;
      case STATES.CHARACTER_SELECT: CharacterSelectScreen.exitSelect();  break;
      case STATES.CHAR_PROFILE:     CharacterSelectScreen.exitProfile(); break;
      case STATES.QUICK_BATTLE:     QuickBattleScreen.exit();            break;
      case STATES.PROLOGUE:         PrologueScreen.exit();               break;
      case STATES.CUTSCENE:         CutsceneScreen.exit();   break;
      case STATES.BATTLE:           BattleScreen.exit();     break;
      case STATES.VICTORY:          VictoryScreen.exitVictory();  break;
      case STATES.DEFEAT:           VictoryScreen.exitDefeat();   break;
      case STATES.CHARACTER_UNLOCK: VictoryScreen.exitUnlock();   break;
      case STATES.CHAPTER_COMPLETE: VictoryScreen.exitChapterComplete(); break;
      case STATES.STORY_COMPLETE:   VictoryScreen.exitStoryComplete(); break;
      case STATES.BOSS_INTRO:       VictoryScreen.exitBossIntro(); break;
      case STATES.HOW_TO_PLAY:      HowToPlayScreen.exit();  break;
      case STATES.SETTINGS:         SettingsScreen.exit();   break;
    }
  }

  function _enterScreen(state) {
    switch (state) {
      case STATES.LOGIN:
        LoginScreen.enter();
        break;
      case STATES.MENU:
        MainMenuScreen.enter();
        break;
      case STATES.STORY_MAP:
        StoryMapScreen.enterStoryMap();
        break;
      case STATES.CHAPTER_MAP:
        StoryMapScreen.enterChapterMap(_currentChapter);
        break;
      case STATES.CHARACTER_SELECT:
        CharacterSelectScreen.enterSelect(_previousState);
        break;
      case STATES.CHAR_PROFILE:
        CharacterSelectScreen.enterProfile(_viewedCharId);
        break;
      case STATES.QUICK_BATTLE:
        QuickBattleScreen.enter();
        break;
      case STATES.PROLOGUE:
        PrologueScreen.enter();
        break;
      case STATES.CUTSCENE:
        CutsceneScreen.enter();
        break;
      case STATES.BOSS_INTRO:
        VictoryScreen.enterBossIntro();
        break;
      case STATES.BATTLE:
        BattleScreen.enter();
        break;
      case STATES.VICTORY:
        VictoryScreen.enterVictory(_lastBattleResult);
        break;
      case STATES.DEFEAT:
        VictoryScreen.enterDefeat();
        break;
      case STATES.CHARACTER_UNLOCK:
        VictoryScreen.enterUnlock();
        break;
      case STATES.CHAPTER_COMPLETE:
        VictoryScreen.enterChapterComplete();
        break;
      case STATES.STORY_COMPLETE:
        VictoryScreen.enterStoryComplete();
        break;
      case STATES.HOW_TO_PLAY:
        HowToPlayScreen.enter(_currentState === STATES.BATTLE);
        break;
      case STATES.SETTINGS:
        SettingsScreen.enter();
        break;
      default:
        console.warn('[GameManager] No enter handler for:', state);
    }
  }

  // ─────────────────────────────────────────────
  // CONTEXT SETTERS / GETTERS
  // ─────────────────────────────────────────────
  function setCurrentLevel(id)    { _currentLevel   = id; }
  function getCurrentLevel()      { return _currentLevel; }

  function setCurrentChapter(id)  { _currentChapter = id; }
  function getCurrentChapter()    { return _currentChapter; }

  function setPlayerCharacter(id) {
    _playerCharId = id;
    SaveManager.setSelectedCharacter(id);
  }
  function getPlayerCharacter()   { return _playerCharId; }

  function setEnemyCharacter(id)  { _enemyCharId = id; }
  function getEnemyCharacter()    { return _enemyCharId; }

  function setViewedCharacter(id) { _viewedCharId = id; }
  function getViewedCharacter()   { return _viewedCharId; }

  function setPendingUnlock(charId) { _pendingUnlock = charId; }
  function getPendingUnlock()       { return _pendingUnlock; }
  function clearPendingUnlock()     { _pendingUnlock = null; }

  function setBattleResult(result) { _lastBattleResult = result; }
  function getLastBattleResult()   { return _lastBattleResult; }

  function setQuickBattle(val) { _isQuickBattle = val; }
  function isQuickBattle()     { return _isQuickBattle; }

  function getContext()        { return _currentState; }
  function getState()          { return _currentState; }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  function init() {
    // Load save data
    SaveManager.load();
    SaveManager.loadSettings();

    // Init input manager
    InputManager.init();

    // Init audio (will be activated on first user interaction)
    // AudioManager.init() is called lazily in MainMenu

    // Start on login screen
    navigate('LOGIN');
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    navigate,
    navigateBack,
    init,
    setCurrentLevel,    getCurrentLevel,
    setCurrentChapter,  getCurrentChapter,
    setPlayerCharacter, getPlayerCharacter,
    setEnemyCharacter,  getEnemyCharacter,
    setViewedCharacter, getViewedCharacter,
    setPendingUnlock,   getPendingUnlock, clearPendingUnlock,
    setBattleResult,    getLastBattleResult,
    setQuickBattle,     isQuickBattle,
    getContext, getState,
  };

})();

// ─────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Add countdown pop animation to style
  _injectRuntimeStyles();

  // Global error handler — shows errors on screen for easy debugging
  window.onerror = (msg, src, line, col, err) => {
    console.error('[FightingArena ERROR]', msg, 'at', src, line, col);
    const div = document.createElement('div');
    div.style.cssText = `
      position:fixed; top:0; left:0; right:0; z-index:9999;
      background:#7f1d1d; color:#fff; padding:10px 16px;
      font-family:monospace; font-size:12px; line-height:1.4;
    `;
    div.textContent = `ERROR: ${msg} (line ${line})`;
    document.body.appendChild(div);
    setTimeout(() => { if (document.body.contains(div)) document.body.removeChild(div); }, 8000);
    return false;
  };

  // Pre-init AssetManager immediately at startup so portraits are
  // ready before cutscenes and character select screens open
  AssetManager.init(() => {
    console.log('[AssetManager] All placeholders ready, real images loading in background.');
  });

  // Start the game
  GameManager.init();
});

// Resume AudioContext on any user gesture and preload all audio
function _initAudio() {
  AudioManager.init();
  AudioManager.resume();
  AudioManager.preloadAll();
}
document.addEventListener('click',      _initAudio, { once: true });
document.addEventListener('touchstart', _initAudio, { once: true });
document.addEventListener('keydown',    _initAudio, { once: true });

// ─────────────────────────────────────────────
// INJECT RUNTIME CSS (animations needed by JS)
// ─────────────────────────────────────────────
function _injectRuntimeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes countdownPop {
      0%   { transform: scale(1.6); opacity: 0; }
      40%  { transform: scale(0.95); opacity: 1; }
      70%  { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes overlayPop {
      0%   { transform: scale(0.8); opacity: 0; }
      60%  { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); }
    }
    @keyframes lockShake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
    @keyframes combo-pop {
      0%   { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    .combo-pop { animation: combo-pop 0.2s ease; }

    /* Skill button flash on press */
    .skill-btn:active:not(:disabled) {
      box-shadow: 0 0 18px rgba(255,107,43,0.8);
    }
    /* Battle overlay text transitions */
    #battleOverlayText {
      transition: opacity 0.3s ease, transform 0.2s ease;
    }
  `;
  document.head.appendChild(style);
}
