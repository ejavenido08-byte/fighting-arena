// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — INPUT MANAGER
// Handles keyboard and touch/mobile controls.
// Maps physical input to game actions used by BattleEngine.
// Prevents accidental page scrolling during gameplay.
// ═══════════════════════════════════════════════════════════════

const InputManager = (() => {

  // ─────────────────────────────────────────────
  // KEY MAP (Master Spec defaults)
  // ─────────────────────────────────────────────
  const DEFAULT_KEY_MAP = {
    left:      ['a', 'arrowleft'],
    right:     ['d', 'arrowright'],
    jump:      ['w', 'arrowup'],
    block:     ['s', 'arrowdown'],
    attack:    ['j'],
    skill1:    ['k'],
    skill2:    ['l'],
    skill3:    ['u'],
    ultimate:  ['i'],
    pause:     ['escape'],
    sound:     ['m'],
  };

  // Keys that should never scroll the page during gameplay
  const PREVENT_DEFAULT_KEYS = new Set([
    'arrowleft','arrowright','arrowup','arrowdown',
    'space',' ','j','k','l','u','i','s','a','d','w','escape'
  ]);

  // ─────────────────────────────────────────────
  // INTERNAL STATE
  // ─────────────────────────────────────────────
  let _keys       = {};         // key id → bool (held)
  let _justPressed = {};        // key id → bool (one-frame)
  let _justReleased = {};
  let _active     = false;      // only process input when active
  let _keyMap     = Object.assign({}, DEFAULT_KEY_MAP);
  let _listeners  = {};         // event listeners for actions
  let _touchState = {           // virtual controller state
    left: false, right: false, jump: false,
    block: false, attack: false,
    skill1: false, skill2: false, skill3: false, ultimate: false,
  };
  let _prevTouchState = {};

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  function init() {
    document.addEventListener('keydown',  onKeyDown,  { passive: false });
    document.addEventListener('keyup',    onKeyUp,    { passive: false });
    setupTouchControls();
  }

  function setActive(val) {
    _active = val;
    if (!val) {
      _keys = {};
      _justPressed = {};
      _justReleased = {};
      resetTouchState();
    }
  }

  // ─────────────────────────────────────────────
  // KEYBOARD EVENTS
  // ─────────────────────────────────────────────
  function onKeyDown(e) {
    const key = e.key.toLowerCase();

    // Always allow pause
    if (key === 'escape') {
      _justPressed['pause'] = true;
      emit('pause');
      return;
    }

    // Sound toggle
    if (key === 'm') {
      emit('sound');
      return;
    }

    if (_active && PREVENT_DEFAULT_KEYS.has(key)) {
      e.preventDefault();
    }

    if (_keys[key]) return;  // already held — don't fire justPressed again
    _keys[key] = true;

    // Map to actions and fire events
    for (const [action, keys] of Object.entries(_keyMap)) {
      if (keys.includes(key)) {
        _justPressed[action] = true;
        emit(action + '_press');
        if (action === 'block') emit('block_start');
      }
    }
  }

  function onKeyUp(e) {
    const key = e.key.toLowerCase();
    _keys[key] = false;

    for (const [action, keys] of Object.entries(_keyMap)) {
      if (keys.includes(key)) {
        _justReleased[action] = true;
        emit(action + '_release');
        if (action === 'block') emit('block_end');
      }
    }
  }

  // ─────────────────────────────────────────────
  // QUERY FUNCTIONS (called by BattleEngine each frame)
  // ─────────────────────────────────────────────
  function isHeld(action) {
    if (!_active) return false;
    // Check keyboard
    const keys = _keyMap[action] || [];
    for (const k of keys) {
      if (_keys[k]) return true;
    }
    // Check touch
    if (_touchState[action]) return true;
    return false;
  }

  function wasJustPressed(action) {
    return !!_justPressed[action];
  }

  function wasJustReleased(action) {
    return !!_justReleased[action];
  }

  // Call at end of each frame to clear one-frame flags
  function clearFrame() {
    _justPressed  = {};
    _justReleased = {};
    _prevTouchState = Object.assign({}, _touchState);
  }

  // ─────────────────────────────────────────────
  // EVENT EMITTER (for non-battle screens)
  // ─────────────────────────────────────────────
  function on(event, callback) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(callback);
  }

  function off(event, callback) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(cb => cb !== callback);
  }

  function emit(event, data) {
    if (!_listeners[event]) return;
    _listeners[event].forEach(cb => { try { cb(data); } catch (e) {} });
  }

  // ─────────────────────────────────────────────
  // TOUCH / MOBILE CONTROLS
  // Wires up the on-screen buttons from index.html
  // ─────────────────────────────────────────────
  function setupTouchControls() {
    const buttonMap = {
      btnLeft:    'left',
      btnRight:   'right',
      btnUp:      'jump',
      btnAttack:  'attack',
      btnSkill1:  'skill1',
      btnSkill2:  'skill2',
      btnSkill3:  'skill3',
      btnUltimate:'ultimate',
      btnBlock:   'block',
    };

    for (const [btnId, action] of Object.entries(buttonMap)) {
      const btn = document.getElementById(btnId);
      if (!btn) continue;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        _touchState[action] = true;
        _justPressed[action] = true;
        emit(action + '_press');
        if (action === 'block') emit('block_start');
        AudioManager.resume();
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        _touchState[action] = false;
        _justReleased[action] = true;
        emit(action + '_release');
        if (action === 'block') emit('block_end');
      }, { passive: false });

      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        _touchState[action] = false;
      }, { passive: false });

      // Also handle mouse for desktop testing of mobile layout
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        _touchState[action] = true;
        _justPressed[action] = true;
        emit(action + '_press');
        if (action === 'block') emit('block_start');
      });
      btn.addEventListener('mouseup', (e) => {
        _touchState[action] = false;
        _justReleased[action] = true;
        emit(action + '_release');
        if (action === 'block') emit('block_end');
      });
      btn.addEventListener('mouseleave', () => {
        _touchState[action] = false;
      });
    }

    // Pause button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        emit('pause');
        AudioManager.playSFX('btn_click');
      });
    }

    // Prevent accidental scrolling during battles
    document.addEventListener('touchmove', (e) => {
      if (_active) e.preventDefault();
    }, { passive: false });
  }

  function resetTouchState() {
    for (const key in _touchState) _touchState[key] = false;
  }

  // ─────────────────────────────────────────────
  // MENU KEYBOARD NAVIGATION
  // Arrow key navigation for button lists
  // ─────────────────────────────────────────────
  function setupMenuNavigation(buttonSelector, onSelect) {
    let focusedIndex = 0;
    const buttons = Array.from(document.querySelectorAll(buttonSelector));
    if (!buttons.length) return;

    function updateFocus() {
      buttons.forEach((b, i) => {
        b.classList.toggle('focused', i === focusedIndex);
      });
    }
    updateFocus();

    function navHandler(e) {
      const key = e.key.toLowerCase();
      if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % buttons.length;
        updateFocus();
        AudioManager.playSFX('navigate');
      } else if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + buttons.length) % buttons.length;
        updateFocus();
        AudioManager.playSFX('navigate');
      } else if (key === 'enter' || key === ' ') {
        e.preventDefault();
        AudioManager.playSFX('btn_click');
        if (onSelect) onSelect(buttons[focusedIndex], focusedIndex);
        else buttons[focusedIndex].click();
      }
    }

    document.addEventListener('keydown', navHandler);
    // Return cleanup function
    return () => document.removeEventListener('keydown', navHandler);
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    init,
    setActive,
    isHeld,
    wasJustPressed,
    wasJustReleased,
    clearFrame,
    on,
    off,
    setupMenuNavigation,
    getKeyMap: () => Object.assign({}, _keyMap),
  };

})();
