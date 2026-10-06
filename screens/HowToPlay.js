// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — HOW TO PLAY SCREEN
// ═══════════════════════════════════════════════════════════════

const HowToPlayScreen = (() => {

  let _fromPause = false;

  function enter(fromPause) {
    _fromPause = !!fromPause;
    _wireButtons();
  }

  function exit() {}

  function _wireButtons() {
    const backBtn = document.getElementById('htpBack');
    if (!backBtn) return;
    const clone = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(clone, backBtn);
    clone.addEventListener('click', () => {
      AudioManager.playSFX('btn_click');
      GameManager.navigateBack();
    });
  }

  return { enter, exit };

})();
