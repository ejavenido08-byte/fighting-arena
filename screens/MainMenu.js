// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — MAIN MENU SCREEN
// Wireframe Panel 1: Title, 5 nav buttons, keyboard hint
// Animated particle background, keyboard navigation
// ═══════════════════════════════════════════════════════════════

const MainMenuScreen = (() => {

  let _cleanupNav = null;
  let _particleInterval = null;

  // ─────────────────────────────────────────────
  // ENTER
  // ─────────────────────────────────────────────
  function enter() {
    AudioManager.init();
    AudioManager.resume();
    // Main menu — no music, stop whatever is playing
    AudioManager.stopMusic(0);

    _applyMenuBackground();
    _spawnParticles();
    _particleInterval = setInterval(_spawnParticles, 600);

    _wireButtons();

    // Keyboard navigation on the menu button list
    _cleanupNav = InputManager.setupMenuNavigation('#menuNav .menu-btn', (btn) => {
      const action = btn.dataset.action;
      _handleAction(action);
    });
  }

  // ─────────────────────────────────────────────
  // MENU PNG BACKGROUND
  // Uses menu_bg.png if loaded by AssetManager,
  // otherwise keeps the CSS gradient default.
  // Handles both: already-loaded and late-loading cases.
  // ─────────────────────────────────────────────
  function _applyMenuBackground() {
    const bg = document.querySelector('.menu-bg');
    if (!bg) return;

    function _applyImg(img) {
      if (img && img.complete && img.naturalWidth > 0) {
        bg.style.backgroundImage    = `url('${img.src}')`;
        bg.style.backgroundSize     = 'cover';
        bg.style.backgroundPosition = 'center center';
        bg.style.backgroundRepeat   = 'no-repeat';
      }
    }

    // Try immediately (image may already be cached/loaded)
    try { _applyImg(AssetManager.getMenuBackground()); } catch(e) {}

    // Also listen for when the PNG finishes loading (async, typical case)
    try {
      AssetManager.onBackgroundLoaded((key) => {
        if (key === 'menu') {
          try { _applyImg(AssetManager.getMenuBackground()); } catch(e) {}
        }
      });
    } catch(e) {}
  }

  // ─────────────────────────────────────────────
  // EXIT
  // ─────────────────────────────────────────────
  function exit() {
    if (_cleanupNav)       { _cleanupNav(); _cleanupNav = null; }
    if (_particleInterval) { clearInterval(_particleInterval); _particleInterval = null; }
    _clearParticles();
  }

  // ─────────────────────────────────────────────
  // BUTTON WIRING
  // ─────────────────────────────────────────────
  function _wireButtons() {
    const nav = document.getElementById('menuNav');
    if (!nav) return;

    nav.querySelectorAll('.menu-btn').forEach(btn => {
      // Remove old listeners by replacing node
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
    });

    nav.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        AudioManager.resume();
        _handleAction(btn.dataset.action);
      });
    });
  }

  function _handleAction(action) {
    switch (action) {
      case 'storyMode':
        // Story Mode — start menu music HERE when story mode is clicked
        AudioManager.playMusic('menu', true, true);
        GameManager.setQuickBattle(false);
        GameManager.setPlayerCharacter('ember');
        SaveManager.setSelectedCharacter('ember');
        if (!sessionStorage.getItem('prologue_seen')) {
          GameManager.navigate('PROLOGUE');
        } else {
          GameManager.navigate('STORY_MAP');
        }
        break;
      case 'quickBattle':
        GameManager.setQuickBattle(true);
        GameManager.navigate('QUICK_BATTLE');
        break;
      case 'characterSelect':
        GameManager.setQuickBattle(false);
        GameManager.navigate('CHARACTER_SELECT');
        break;
      case 'howToPlay':
        GameManager.navigate('HOW_TO_PLAY');
        break;
      case 'settings':
        GameManager.navigate('SETTINGS');
        break;
      case 'quit':
        if (confirm('Exit Fighting Arena?')) {
          window.close();
          // Fallback for browsers that block window.close()
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;font-family:Impact;font-size:2rem;background:#0a0a0f;">Thanks for playing Fighting Arena!</div>';
        }
        break;
    }
  }

  // ─────────────────────────────────────────────
  // PARTICLE BACKGROUND (menu ambiance)
  // Wireframe Panel 1: animated background effects
  // ─────────────────────────────────────────────
  function _spawnParticles() {
    const container = document.getElementById('menuParticles');
    if (!container) return;

    const p = document.createElement('div');
    p.className = 'menu-particle';
    const size = 2 + Math.random() * 4;
    p.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${Math.random() * 100}%;
      bottom: 0;
      animation-duration:  ${4 + Math.random() * 6}s;
      animation-delay:     ${Math.random() * 0.5}s;
      opacity: 0;
      background: ${Math.random() > 0.5 ? '#ff6b2b' : '#f97316'};
    `;
    container.appendChild(p);

    // Remove after animation ends
    setTimeout(() => {
      if (container.contains(p)) container.removeChild(p);
    }, 11000);
  }

  function _clearParticles() {
    const container = document.getElementById('menuParticles');
    if (container) container.innerHTML = '';
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return { enter, exit };

})();
