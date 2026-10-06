// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — AUDIO MANAGER
// Web Audio API based. Fails gracefully if files missing.
// Supports music, SFX, volume control, mute.
// ═══════════════════════════════════════════════════════════════

const AudioManager = (() => {

  // Audio context
  let _ctx       = null;
  let _masterGain = null;
  let _musicGain  = null;
  let _sfxGain    = null;

  // Currently playing music
  let _currentMusic      = null;
  let _currentMusicSource = null;
  let _musicBuffer       = {};
  let _sfxBuffer         = {};

  // Settings
  let _musicVolume = 0.7;
  let _sfxVolume   = 0.8;
  let _muted       = false;

  // ─────────────────────────────────────────────
  // AUDIO FILE MAP
  // Add audio files to assets/audio/ and update paths here
  // ─────────────────────────────────────────────
  const MUSIC_FILES = {
    menu:    'assets/audio/menu_music.mp3',
    battle:  'assets/audio/battle_music.mp3',
    boss:    'assets/audio/boss_music.mp3',
    victory: 'assets/audio/victory.mp3',
    defeat:  'assets/audio/defeat.mp3',
    unlock:  'assets/audio/unlock.mp3',
  };

  const SFX_FILES = {
    btn_click:     'assets/audio/btn_click.mp3',
    attack_hit:    'assets/audio/attack_hit.mp3',
    attack_miss:   'assets/audio/attack_miss.mp3',
    skill_fire:    'assets/audio/skill_fire.mp3',
    skill_ice:     'assets/audio/skill_ice.mp3',
    skill_lightning: 'assets/audio/skill_lightning.mp3',
    ultimate:      'assets/audio/ultimate.mp3',
    block:         'assets/audio/block.mp3',
    ko:            'assets/audio/ko.mp3',
    round_start:   'assets/audio/round_start.mp3',
    countdown:     'assets/audio/countdown.mp3',
    star_reveal:   'assets/audio/star_reveal.mp3',
    unlock_chime:  'assets/audio/unlock_chime.mp3',
    screen_flash:  'assets/audio/screen_flash.mp3',
    combo:         'assets/audio/combo.mp3',
    critical:      'assets/audio/critical.mp3',
    navigate:      'assets/audio/navigate.mp3',
  };

  // ─────────────────────────────────────────────
  // INIT — call once on first user interaction
  // ─────────────────────────────────────────────
  function init() {
    if (_ctx) return;  // already initialised
    try {
      _ctx        = new (window.AudioContext || window.webkitAudioContext)();
      _masterGain = _ctx.createGain();
      _musicGain  = _ctx.createGain();
      _sfxGain    = _ctx.createGain();

      _musicGain.connect(_masterGain);
      _sfxGain.connect(_masterGain);
      _masterGain.connect(_ctx.destination);

      _musicGain.gain.value = _musicVolume;
      _sfxGain.gain.value   = _sfxVolume;

      // Apply saved settings
      const settings = SaveManager.getSettings();
      setMusicVolume(settings.musicVolume / 100);
      setSFXVolume(settings.sfxVolume / 100);

    } catch (e) {
      console.warn('[AudioManager] Web Audio API not available:', e);
      _ctx = null;
    }
  }

  // ─────────────────────────────────────────────
  // LOAD BUFFER (async, graceful fail)
  // ─────────────────────────────────────────────
  async function loadBuffer(url) {
    if (!_ctx) return null;
    try {
      const res  = await fetch(url);
      if (!res.ok) return null;
      const data = await res.arrayBuffer();
      return await _ctx.decodeAudioData(data);
    } catch (e) {
      // File missing or undecodable — silent fail
      return null;
    }
  }

  // Preload all audio (call after init)
  async function preloadAll() {
    if (!_ctx) return;

    const musicPromises = Object.entries(MUSIC_FILES).map(async ([key, url]) => {
      const buf = await loadBuffer(url);
      if (buf) _musicBuffer[key] = buf;
    });

    const sfxPromises = Object.entries(SFX_FILES).map(async ([key, url]) => {
      const buf = await loadBuffer(url);
      if (buf) _sfxBuffer[key] = buf;
    });

    await Promise.allSettled([...musicPromises, ...sfxPromises]);
  }

  // ─────────────────────────────────────────────
  // MUSIC PLAYBACK
  // ─────────────────────────────────────────────
  function playMusic(key, loop = true, fadeIn = false) {
    if (!_ctx) return;

    // Always stop current music first — even if new track has no buffer
    stopMusic(fadeIn ? 0.5 : 0);

    // If no buffer for this key, just stop — don't play anything
    if (!_musicBuffer[key]) return;

    const source = _ctx.createBufferSource();
    source.buffer = _musicBuffer[key];
    source.loop   = loop;

    if (fadeIn) {
      _musicGain.gain.setValueAtTime(0, _ctx.currentTime);
      _musicGain.gain.linearRampToValueAtTime(_musicVolume, _ctx.currentTime + 1.0);
    }

    source.connect(_musicGain);
    source.start(0);
    _currentMusicSource = source;
    _currentMusic       = key;
  }

  function stopMusic(fadeTime = 0.5) {
    if (!_currentMusicSource) return;
    try {
      if (fadeTime > 0 && _ctx) {
        _musicGain.gain.linearRampToValueAtTime(0, _ctx.currentTime + fadeTime);
        setTimeout(() => {
          try { _currentMusicSource && _currentMusicSource.stop(); } catch (e) {}
          if (_ctx) _musicGain.gain.setValueAtTime(_musicVolume, _ctx.currentTime);
          _currentMusicSource = null;
          _currentMusic = null;
        }, fadeTime * 1000 + 50);
      } else {
        _currentMusicSource.stop();
        _currentMusicSource = null;
        _currentMusic = null;
      }
    } catch (e) {}
  }

  // ─────────────────────────────────────────────
  // SFX PLAYBACK
  // ─────────────────────────────────────────────
  function playSFX(key) {
    if (!_ctx || !_sfxBuffer[key] || _muted) return;
    try {
      const source = _ctx.createBufferSource();
      source.buffer = _sfxBuffer[key];
      source.connect(_sfxGain);
      source.start(0);
      // Stop short SFX after max duration to prevent long files playing fully
      const maxDuration = (key === 'btn_click' || key === 'navigate') ? 0.4 : 3.0;
      source.stop(_ctx.currentTime + Math.min(source.buffer.duration, maxDuration));
    } catch (e) {}
  }

  // Map hit effects to SFX keys
  function playHitEffect(hitEffectId) {
    if (!hitEffectId) { playSFX('attack_hit'); return; }
    if (hitEffectId.includes('fire'))      { playSFX('skill_fire'); return; }
    if (hitEffectId.includes('ice'))       { playSFX('skill_ice'); return; }
    if (hitEffectId.includes('lightning')) { playSFX('skill_lightning'); return; }
    if (hitEffectId.includes('ultimate'))  { playSFX('ultimate'); return; }
    playSFX('attack_hit');
  }

  // ─────────────────────────────────────────────
  // VOLUME CONTROL
  // ─────────────────────────────────────────────
  function setMusicVolume(vol) {
    _musicVolume = Math.max(0, Math.min(1, vol));
    if (_musicGain) _musicGain.gain.value = _muted ? 0 : _musicVolume;
    SaveManager.saveSettings({ musicVolume: Math.round(_musicVolume * 100) });
  }

  function setSFXVolume(vol) {
    _sfxVolume = Math.max(0, Math.min(1, vol));
    if (_sfxGain) _sfxGain.gain.value = _muted ? 0 : _sfxVolume;
    SaveManager.saveSettings({ sfxVolume: Math.round(_sfxVolume * 100) });
  }

  function toggleMute() {
    _muted = !_muted;
    if (_masterGain) {
      _masterGain.gain.value = _muted ? 0 : 1;
    }
    return _muted;
  }

  function isMuted() { return _muted; }

  // Resume AudioContext after user gesture (browser autoplay policy)
  function resume() {
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume();
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {
    init,
    preloadAll,
    playMusic,
    stopMusic,
    playSFX,
    playHitEffect,
    getCurrentMusic: () => _currentMusic,
    setMusicVolume,
    setSFXVolume,
    toggleMute,
    isMuted,
    resume,
    getMusicVolume: () => _musicVolume,
    getSFXVolume:   () => _sfxVolume,
  };

})();
