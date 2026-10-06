// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — BATTLE SCREEN
// Wires up the battle canvas, starts BattleEngine,
// handles the boss intro flow, manages music
// Wireframe Panels 4 + 10
// ═══════════════════════════════════════════════════════════════

const BattleScreen = (() => {

  function enter() {
    const levelId      = GameManager.getCurrentLevel();
    const levelData    = levelId ? getLevel(levelId) : null;
    const isQuickBattle = GameManager.isQuickBattle();

    // Story Mode — Ember is ALWAYS the player, ignore saved selection
    const playerCharId = isQuickBattle
      ? (SaveManager.getSelectedCharacter() || 'ember')
      : 'ember';

    // Always set ember as player in story mode
    if (!isQuickBattle) {
      SaveManager.setSelectedCharacter('ember');
      GameManager.setPlayerCharacter('ember');
    }

    // Build the resolved level
    let resolvedLevel;
    if (levelData && !isQuickBattle) {
      // Story mode — use level as-is
      resolvedLevel = levelData;
    } else if (levelData && isQuickBattle) {
      // Quick Battle with a real map — use the map background but override the enemy
      const cpuId = GameManager.getEnemyCharacter() || levelData.enemy.characterId;
      resolvedLevel = {
        ...levelData,
        // Keep original id so BattleEngine loads the correct background PNG
        title:       'Quick Battle — ' + (levelData.title || ''),
        isBossLevel: false,
        isFinalBoss: false,
        cutscene:    null,
        unlock:      null,
        rewards:     { xp: 150, coins: 50 },
        enemy: {
          ...levelData.enemy,
          characterId:      cpuId,
          isBoss:           false,
          hpMultiplier:     1.0,
          attackMultiplier: 1.0,
          aiDifficulty:     'medium',
        },
      };
    } else {
      // No level — fallback quick battle
      resolvedLevel = _buildQuickBattleLevel(playerCharId);
    }

    // Pick correct music — stop menu music first regardless
    AudioManager.stopMusic(0);
    if (resolvedLevel.isBossLevel || resolvedLevel.isFinalBoss) {
      AudioManager.playMusic('boss', true, true);
    } else {
      AudioManager.playMusic('battle', true, true);
    }

    // Get canvas element
    const canvas = document.getElementById('battleCanvas');
    if (!canvas) {
      console.error('[BattleScreen] Canvas not found!');
      return;
    }

    // Set canvas size to fill its parent area (between HUDs)
    _resizeCanvas(canvas);

    // Init engine — it will generate sprites and auto-start
    BattleEngine.init(canvas, playerCharId, resolvedLevel);
    // Note: BattleEngine.start() is called internally after AssetManager initializes
  }

  function exit() {
    BattleEngine.stop();
  }

  function _resizeCanvas(canvas) {
    // Canvas size = full viewport minus the two HUD strips
    const topH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hud-top-h')) || 90;
    const botH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hud-bot-h')) || 110;
    // Use window dimensions directly — parent may not be laid out yet
    canvas.width  = Math.max(320, window.innerWidth);
    canvas.height = Math.max(200, window.innerHeight - topH - botH);
  }

  function _buildQuickBattleLevel(playerCharId) {
    // Use enemy chosen in QuickBattleScreen if available
    const storedEnemy = GameManager.getEnemyCharacter();

    // Use level chosen in QuickBattleScreen if available (levelId was set to a real level)
    // This function is only called when getCurrentLevel() returned null/no level data,
    // but QB now always sets a real levelId — so this is a safety fallback only.
    const unlocked  = SaveManager.get().unlockedCharacters;
    const opponents = unlocked.filter(id => id !== playerCharId);
    const cpuId     = storedEnemy && storedEnemy !== playerCharId
      ? storedEnemy
      : (opponents.length
          ? opponents[Math.floor(Math.random() * opponents.length)]
          : (playerCharId === 'frost' ? 'ember' : 'frost'));

    return {
      id:            'quick_battle',
      title:         'Quick Battle',
      isBossLevel:   false,
      isFinalBoss:   false,
      difficultyNum: 4,
      enemy: {
        characterId:      cpuId,
        isBoss:           false,
        aiDifficulty:     'medium',
        hpMultiplier:     1.0,
        attackMultiplier: 1.0,
      },
      rewards:       { xp: 150, coins: 50 },
      unlock:        null,
      bossMechanics: null,
      cutscene:      null,
    };
  }

  return { enter, exit };

})();
