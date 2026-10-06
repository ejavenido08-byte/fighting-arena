// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — CUTSCENE SYSTEM
// Wireframe Panel 3: portrait, dialogue box, typewriter text,
// NEXT button, SKIP button, speaker name tag
// ═══════════════════════════════════════════════════════════════

const CutsceneScreen = (() => {

  let _lines       = [];
  let _lineIndex   = 0;
  let _typing      = false;
  let _typeTimer   = null;
  let _charIndex   = 0;
  let _currentText = '';
  let _onComplete  = null;
  let _levelId     = null;

  const TYPE_SPEED = 28;  // ms per character

  // ─────────────────────────────────────────────
  // ENTER
  // ─────────────────────────────────────────────
  function enter() {
    _levelId = GameManager.getCurrentLevel();
    const level = _levelId ? getLevel(_levelId) : null;

    // Stop menu music when cutscene starts
    AudioManager.stopMusic(0.5);

    if (!level || !level.cutscene) {
      _proceed();
      return;
    }

    // Mark cutscene as seen so we don't replay it
    sessionStorage.setItem(`cutscene_seen_${_levelId}`, '1');

    _lines     = level.cutscene.lines || [];
    _lineIndex = 0;
    _onComplete = () => {
      if (level.isBossLevel || level.isFinalBoss) {
        GameManager.navigate('BOSS_INTRO');
      } else {
        GameManager.navigate('BATTLE');
      }
    };

    // Set background color/mood
    const bgEl = document.getElementById('cutsceneBg');
    if (bgEl) {
      if (level.cutscene.bgImage) {
        bgEl.style.background    = level.cutscene.bgColor || '#1a0d00';
        bgEl.style.backgroundImage    = `url('${level.cutscene.bgImage}')`;
        bgEl.style.backgroundSize     = 'cover';
        bgEl.style.backgroundPosition = 'center';
        bgEl.style.backgroundRepeat   = 'no-repeat';
      } else {
        bgEl.style.backgroundImage = '';
        bgEl.style.background      = level.cutscene.bgColor || '#1a0d00';
      }
    }

    // When a real portrait finishes loading, refresh the display
    AssetManager.onPortraitLoaded((charId, type) => {
      if (type === 'cutscene' && _lines[_lineIndex]) {
        const ch = Object.values(CHARACTERS).find(c => c.id === charId);
        if (ch && _lines[_lineIndex].speaker.toUpperCase() === ch.name) {
          const portraitEl = document.getElementById('cutscenePortrait');
          _updatePortrait(_lines[_lineIndex].speaker, portraitEl);
        }
      }
    });

    // No music during cutscene — stopped when entering
    _wireCutsceneButtons();
    _showLine(0);
  }

  function exit() {
    _stopTyping();
    _lines = [];
    _lineIndex = 0;
  }

  // ─────────────────────────────────────────────
  // SHOW A DIALOGUE LINE
  // ─────────────────────────────────────────────
  function _showLine(idx) {
    if (idx >= _lines.length) {
      _proceed();
      return;
    }

    _lineIndex    = idx;
    const line    = _lines[idx];
    const speakerEl  = document.getElementById('dialogueSpeaker');
    const textEl     = document.getElementById('dialogueText');
    const portraitEl = document.getElementById('cutscenePortrait');

    // Find character for color
    const ch = Object.values(CHARACTERS).find(c => c.name === line.speaker.toUpperCase());
    const speakerColor = ch ? ch.color : 'var(--clr-primary)';

    if (speakerEl) {
      speakerEl.textContent = line.speaker || '';
      speakerEl.style.color           = speakerColor;
      speakerEl.style.borderLeftColor = speakerColor;
      speakerEl.style.background      = speakerColor + '18';
    }
    if (textEl) textEl.textContent = '';

    _updatePortrait(line.speaker, portraitEl);
    _typeText(line.text, textEl);
  }

  // ─────────────────────────────────────────────
  // TYPEWRITER EFFECT
  // ─────────────────────────────────────────────
  function _typeText(text, el) {
    _stopTyping();
    _currentText = text;
    _charIndex   = 0;
    _typing      = true;

    function tick() {
      if (_charIndex <= _currentText.length) {
        el.textContent = _currentText.slice(0, _charIndex);
        _charIndex++;
        _typeTimer = setTimeout(tick, TYPE_SPEED);
      } else {
        _typing = false;
        // Show blinking cursor
        el.innerHTML = el.textContent + '<span class="dialogue-cursor"></span>';
      }
    }
    tick();
  }

  function _stopTyping() {
    if (_typeTimer) { clearTimeout(_typeTimer); _typeTimer = null; }
    _typing = false;
  }

  // ─────────────────────────────────────────────
  // ADVANCE (NEXT)
  // ─────────────────────────────────────────────
  function _advance() {
    if (_typing) {
      // Skip to end of current line
      _stopTyping();
      const el = document.getElementById('dialogueText');
      if (el) el.innerHTML = _currentText + '<span class="dialogue-cursor"></span>';
      return;
    }
    _showLine(_lineIndex + 1);
  }

  function _proceed() {
    if (_onComplete) _onComplete();
    else GameManager.navigate('BATTLE');
  }

  // ─────────────────────────────────────────────
  // PORTRAIT per speaker
  // ─────────────────────────────────────────────
  function _updatePortrait(speakerName, el) {
    if (!el) return;
    const ch = Object.values(CHARACTERS).find(c => c.name === speakerName.toUpperCase());

    if (ch) {
      const src = AssetManager.getPortraitSrc(ch.id, 'cutscene');

      // Determine if this is the player character or enemy
      const playerCharId = SaveManager.getSelectedCharacter() || 'ember';
      const isEnemy = ch.id !== playerCharId;

      // Position: player on left, enemy on right
      if (isEnemy) {
        el.classList.add('enemy-side');
      } else {
        el.classList.remove('enemy-side');
      }

      // Set the portrait color for drop-shadow
      el.style.filter = `drop-shadow(0 0 30px ${ch.color}80)`;

      if (src) {
        el.innerHTML = `<img
          src="${src}"
          alt="${ch.name}"
          style="
            max-width:100%; max-height:100%;
            object-fit:contain;
            object-position:bottom center;
          "
        />`;
        el.style.fontSize = '0';
      } else {
        el.innerHTML = '';
        el.style.fontSize = 'min(10rem,30vw)';
        el.textContent = ch.emoji;
        el.style.color  = ch.color;
      }
    } else {
      el.classList.remove('enemy-side');
      el.innerHTML = '';
      el.style.fontSize = 'min(10rem,30vw)';
      el.textContent = '👤';
      el.style.color  = '#888';
      el.style.filter = 'none';
    }

    // Re-trigger entrance animation
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'portraitFadeIn 0.4s ease both';
  }

  // ─────────────────────────────────────────────
  // BUTTON WIRING
  // ─────────────────────────────────────────────
  function _wireCutsceneButtons() {
    // NEXT button
    const nextBtn = document.getElementById('dialogueNext');
    if (nextBtn) {
      const clone = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(clone, nextBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        _advance();
      });
    }

    // SKIP button
    const skipBtn = document.getElementById('dialogueSkip');
    if (skipBtn) {
      const clone = skipBtn.cloneNode(true);
      skipBtn.parentNode.replaceChild(clone, skipBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        sessionStorage.setItem(`cutscene_seen_${_levelId}`, '1');
        _proceed();
      });
    }

    // Tap dialogue box to advance (mobile UX)
    const box = document.getElementById('cutsceneDialogue');
    if (box) {
      const clone = box.cloneNode(false);
      // Copy children manually
      while (box.firstChild) clone.appendChild(box.firstChild);
      box.parentNode.replaceChild(clone, box);

      clone.addEventListener('click', (e) => {
        if (e.target.id === 'dialogueNext' || e.target.id === 'dialogueSkip') return;
        _advance();
      });

      // Re-wire next/skip after container clone
      const newNext = document.getElementById('dialogueNext');
      if (newNext) {
        newNext.addEventListener('click', (e) => {
          e.stopPropagation();
          AudioManager.playSFX('btn_click');
          _advance();
        });
      }
      const newSkip = document.getElementById('dialogueSkip');
      if (newSkip) {
        newSkip.addEventListener('click', (e) => {
          e.stopPropagation();
          AudioManager.playSFX('btn_click');
          _proceed();
        });
      }
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return { enter, exit };

})();
