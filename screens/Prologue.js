// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — PROLOGUE SCREEN
// Cinematic intro story shown once before Story Mode.
// 8 slides — narrates Ember's origin and why he enters the arena.
// Skippable. Only plays on first Story Mode entry per session.
// ═══════════════════════════════════════════════════════════════

const PrologueScreen = (() => {

  // ─────────────────────────────────────────────
  // STORY SLIDES
  // Each slide: { bg, portrait, tag, speaker, text }
  //   bg       — CSS background color/gradient or image url
  //   portrait — charId to show (uses cutscene portrait), or null
  //   tag      — small label above text (chapter tag / narrator)
  //   speaker  — name shown below text, '' for narrator
  //   text     — the narration / dialogue line
  // ─────────────────────────────────────────────
  const SLIDES = [
    {
      bg:       'assets/backgrounds/prologue_1.png',
      portrait: null,
      tag:      'THE STORY OF THE FIRST FLAME',
      speaker:  '',
      text:     'Long ago, before kingdoms rose and armies clashed, there existed a sacred flame known only as the First Flame — the source of all elemental power in the world.',
    },
    {
      bg:       'assets/backgrounds/prologue_2.png',
      portrait: null,
      tag:      'THE STORY OF THE FIRST FLAME',
      speaker:  '',
      text:     'Nine warriors were chosen as its Guardians — each bound to a different element, each sworn to protect the balance. For centuries, the flame burned steady and the world knew peace.',
    },
    {
      bg:       'assets/backgrounds/prologue_3.png',
      portrait: 'ember',
      tag:      'PROLOGUE — EMBER\'S ORIGIN',
      speaker:  'NARRATOR',
      text:     'Ember was born in the slums of a forgotten city — a child of ash and ember, raised by the heat of dying furnaces. He had no family name, no title, no lineage. Only fire.',
    },
    {
      bg:       'assets/backgrounds/prologue_4.png',
      portrait: 'ember',
      tag:      'PROLOGUE — THE AWAKENING',
      speaker:  'NARRATOR',
      text:     'At the age of seventeen, he touched a dying flame in an abandoned temple — and it answered. The fire did not burn him. It spoke to him. It chose him.',
    },
    {
      bg:       'assets/backgrounds/prologue_5.png',
      portrait: 'ember',
      tag:      'PROLOGUE — THE CALL',
      speaker:  'EMBER',
      text:     '"They say the First Flame chooses its bearer. But I did not come here to be chosen. I came here to prove that a flame born from nothing… can burn brighter than all of them."',
    },
    {
      bg:       'assets/backgrounds/prologue_6.png',
      portrait: null,
      tag:      'PROLOGUE — THE TRIAL',
      speaker:  'NARRATOR',
      text:     'But the nine Guardians will not step aside. Each one a master of their element. Each one a test of strength, will, and fire. To claim the First Flame, Ember must face them all — and survive.',
    },
    {
      bg:       'assets/backgrounds/prologue_7.png',
      portrait: 'ember',
      tag:      'PROLOGUE — THE VOW',
      speaker:  'EMBER',
      text:     '"Frost, Blaze, Volt, Luna, Terra, Kai, Kira, Shadow, Inferno — I am coming for every single one of you. Not out of hatred. But because this flame inside me will not be silenced."',
    },
    {
      bg:       'assets/backgrounds/prologue_8.png',
      portrait: 'ember',
      tag:      'CHAPTER 1 — THE AWAKENING',
      speaker:  'EMBER',
      text:     '"The arena awaits. The First Flame calls. My story begins now."',
    },
  ];

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  let _slideIndex  = 0;
  let _typing      = false;
  let _typeTimer   = null;
  let _fullText    = '';
  let _charIndex   = 0;

  const TYPE_SPEED = 22; // ms per character

  // ─────────────────────────────────────────────
  // ENTER / EXIT
  // ─────────────────────────────────────────────
  function enter() {
    // Prologue — continue menu music from story map
    _slideIndex = 0;
    _buildDots();
    _showSlide(0);
    _wireButtons();
  }

  function exit() {
    _stopTyping();
  }

  // ─────────────────────────────────────────────
  // SLIDE RENDERING
  // ─────────────────────────────────────────────
  function _showSlide(idx) {
    const slide = SLIDES[idx];
    if (!slide) { _finish(); return; }

    _stopTyping();

    // Background — detect if image path or CSS gradient
    const bgEl = document.getElementById('prologueBg');
    if (bgEl) {
      bgEl.classList.remove('visible');
      if (slide.bg.startsWith('assets/') || slide.bg.startsWith('http')) {
        bgEl.style.background    = '#0a0200';
        bgEl.style.backgroundImage = `url('${slide.bg}')`;
        bgEl.style.backgroundSize = 'cover';
        bgEl.style.backgroundPosition = 'center';
      } else {
        bgEl.style.backgroundImage = 'none';
        bgEl.style.background = slide.bg;
      }
      requestAnimationFrame(() => bgEl.classList.add('visible'));
    }

    // Portrait
    _showPortrait(slide.portrait);

    // Chapter tag
    const tagEl = document.getElementById('prologueTag');
    if (tagEl) tagEl.textContent = slide.tag || 'PROLOGUE';

    // Speaker
    const speakerEl = document.getElementById('prologueSpeaker');
    if (speakerEl) speakerEl.textContent = slide.speaker || '';

    // Counter
    const counterEl = document.getElementById('prologueCounter');
    if (counterEl) counterEl.textContent = `${idx + 1} / ${SLIDES.length}`;

    // Panel animate in
    const panel = document.getElementById('prologuePanel') ||
                  document.querySelector('.prologue-panel');
    if (panel) {
      panel.classList.remove('animate-in', 'visible');
      void panel.offsetWidth;
      panel.classList.add('visible', 'animate-in');
    }

    // Dots
    _updateDots(idx);

    // Next button label
    const nextBtn = document.getElementById('prologueNext');
    if (nextBtn) {
      nextBtn.textContent = idx === SLIDES.length - 1 ? 'BEGIN ›' : 'NEXT ›';
    }

    // Typewriter text
    _typeText(slide.text);
  }

  function _showPortrait(charId) {
    const el = document.getElementById('prologuePortrait');
    if (!el) return;

    el.classList.remove('visible');

    if (!charId) {
      el.innerHTML = '';
      return;
    }

    const ch  = getCharacter(charId);
    const src = AssetManager.getPortraitSrc(charId, 'cutscene')
             || AssetManager.getPortraitSrc(charId, 'select');

    if (src) {
      el.innerHTML = `<img src="${src}" alt="${ch ? ch.name : charId}" />`;
    } else if (ch) {
      el.innerHTML = `<div class="prologue-portrait-emoji">${ch.emoji}</div>`;
      // Upgrade when portrait loads
      AssetManager.onPortraitLoaded((id, type) => {
        if (id === charId) _showPortrait(charId);
      });
    }

    requestAnimationFrame(() => el.classList.add('visible'));
  }

  // ─────────────────────────────────────────────
  // TYPEWRITER
  // ─────────────────────────────────────────────
  function _typeText(text) {
    const el = document.getElementById('prologueText');
    if (!el) return;

    _fullText   = text;
    _charIndex  = 0;
    _typing     = true;
    el.innerHTML = '';

    function tick() {
      if (!_typing) return;
      if (_charIndex < _fullText.length) {
        el.innerHTML =
          _fullText.slice(0, _charIndex + 1) +
          '<span class="prologue-cursor"></span>';
        _charIndex++;
        _typeTimer = setTimeout(tick, TYPE_SPEED);
      } else {
        // Done typing — remove cursor blink after a moment
        el.innerHTML = _fullText;
        _typing = false;
      }
    }
    tick();
  }

  function _stopTyping() {
    _typing = false;
    clearTimeout(_typeTimer);
    _typeTimer = null;
  }

  function _skipTyping() {
    // If still typing — show full text immediately
    const el = document.getElementById('prologueText');
    if (_typing && el) {
      _stopTyping();
      el.innerHTML = _fullText;
      return true; // consumed the press
    }
    return false;
  }

  // ─────────────────────────────────────────────
  // PROGRESS DOTS
  // ─────────────────────────────────────────────
  function _buildDots() {
    const container = document.getElementById('prologueDots');
    if (!container) return;
    container.innerHTML = '';
    SLIDES.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'prologue-dot';
      dot.dataset.idx = i;
      dot.addEventListener('click', () => {
        if (i !== _slideIndex) {
          _slideIndex = i;
          _showSlide(i);
        }
      });
      container.appendChild(dot);
    });
  }

  function _updateDots(idx) {
    document.querySelectorAll('.prologue-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i === idx)   dot.classList.add('active');
      else if (i < idx) dot.classList.add('done');
    });
  }

  // ─────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────
  function _next() {
    // If typing, finish immediately
    if (_skipTyping()) return;

    _slideIndex++;
    if (_slideIndex >= SLIDES.length) {
      _finish();
    } else {
      _showSlide(_slideIndex);
    }
  }

  function _finish() {
    // Mark prologue as seen so it won't show again this session
    sessionStorage.setItem('prologue_seen', '1');
    AudioManager.playSFX('btn_click');
    GameManager.navigate('STORY_MAP');
  }

  // ─────────────────────────────────────────────
  // WIRE BUTTONS
  // ─────────────────────────────────────────────
  function _wireButtons() {
    const nextBtn = document.getElementById('prologueNext');
    if (nextBtn) {
      const clone = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(clone, nextBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('navigate');
        _next();
      });
    }

    const skipBtn = document.getElementById('prologueSkip');
    if (skipBtn) {
      const clone = skipBtn.cloneNode(true);
      skipBtn.parentNode.replaceChild(clone, skipBtn);
      clone.addEventListener('click', () => {
        _finish();
      });
    }

    // Also allow keyboard navigation
    _keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        AudioManager.playSFX('navigate');
        _next();
      }
      if (e.key === 'Escape') {
        _finish();
      }
    };
    document.addEventListener('keydown', _keyHandler);
  }

  let _keyHandler = null;

  function exit() {
    _stopTyping();
    if (_keyHandler) {
      document.removeEventListener('keydown', _keyHandler);
      _keyHandler = null;
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return { enter, exit };

})();
