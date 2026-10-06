// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — SETTINGS SCREEN
// Volume sliders, fullscreen toggle, save reset
// ═══════════════════════════════════════════════════════════════

const SettingsScreen = (() => {

  function enter() {
    _loadValues();
    _wireControls();
  }

  function exit() {}

  function _loadValues() {
    const settings = SaveManager.getSettings();

    const musicSlider = document.getElementById('musicVolume');
    const sfxSlider   = document.getElementById('sfxVolume');
    const musicVal    = document.getElementById('musicVolumeVal');
    const sfxVal      = document.getElementById('sfxVolumeVal');

    if (musicSlider) musicSlider.value   = settings.musicVolume;
    if (sfxSlider)   sfxSlider.value     = settings.sfxVolume;
    if (musicVal)    musicVal.textContent = settings.musicVolume;
    if (sfxVal)      sfxVal.textContent   = settings.sfxVolume;
  }

  function _wireControls() {
    // Music volume
    const musicSlider = document.getElementById('musicVolume');
    const musicVal    = document.getElementById('musicVolumeVal');
    if (musicSlider) {
      musicSlider.oninput = () => {
        const v = parseInt(musicSlider.value);
        if (musicVal) musicVal.textContent = v;
        AudioManager.setMusicVolume(v / 100);
      };
    }

    // SFX volume
    const sfxSlider = document.getElementById('sfxVolume');
    const sfxVal    = document.getElementById('sfxVolumeVal');
    if (sfxSlider) {
      sfxSlider.oninput = () => {
        const v = parseInt(sfxSlider.value);
        if (sfxVal) sfxVal.textContent = v;
        AudioManager.setSFXVolume(v / 100);
        AudioManager.playSFX('btn_click');
      };
    }

    // Fullscreen toggle
    const fsBtn = document.getElementById('btnFullscreen');
    if (fsBtn) {
      const clone = fsBtn.cloneNode(true);
      fsBtn.parentNode.replaceChild(clone, fsBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        _toggleFullscreen();
      });
    }

    // Reset Save
    const resetBtn = document.getElementById('btnResetSave');
    if (resetBtn) {
      const clone = resetBtn.cloneNode(true);
      resetBtn.parentNode.replaceChild(clone, resetBtn);
      clone.addEventListener('click', async () => {
        const confirmed = await SaveManager.resetWithConfirmation();
        if (confirmed) {
          AudioManager.playSFX('btn_click');
          GameManager.navigate('MENU');
        }
      });
    }

    // Back button
    const backBtn = document.getElementById('settingsBack');
    if (backBtn) {
      const clone = backBtn.cloneNode(true);
      backBtn.parentNode.replaceChild(clone, backBtn);
      clone.addEventListener('click', () => {
        AudioManager.playSFX('btn_click');
        GameManager.navigateBack();
      });
    }
  }

  function _toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  return { enter, exit };

})();
