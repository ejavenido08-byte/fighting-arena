// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — STORY LEVELS DATA
// 10 levels across 4 chapters, with cutscenes, boss mechanics,
// rewards, and difficulty settings
// ═══════════════════════════════════════════════════════════════

const CHAPTERS = [
  {
    id:       'chapter1',
    number:   1,
    title:    'Chapter 1',
    subtitle: 'The Awakening',
    levels:   ['level1', 'level2', 'level3', 'level4'],
    reward:   { type: 'character', characterId: 'frost', label: 'Unlock: Frost' },
    mapBg:    'assets/backgrounds/chapter1_map_bg.png',
  },
  {
    id:       'chapter2',
    number:   2,
    title:    'Chapter 2',
    subtitle: 'The Guardians',
    levels:   ['level5', 'level6', 'level7'],
    reward:   { type: 'skill', label: 'New Skill Scroll' },
  },
  {
    id:       'chapter3',
    number:   3,
    title:    'Chapter 3',
    subtitle: 'The Darkness',
    levels:   ['level8', 'level9'],
    reward:   { type: 'character', characterId: 'inferno', label: 'Unlock: Inferno' },
  },
  {
    id:       'chapter4',
    number:   4,
    title:    'Chapter 4',
    subtitle: 'The Final Battle',
    levels:   ['level10'],
    reward:   { type: 'badge', label: 'Story Complete' },
  },
];

const STORY_LEVELS = [

  // ─────────────────────────────────────────────
  // LEVEL 1 — THE FIRST FLAME
  // Chapter 1 | Easy
  // ─────────────────────────────────────────────
  {
    id:           'level1',
    number:       1,
    title:        'The First Flame',
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    '1-1',
    difficulty:   'easy',
    difficultyNum: 1,

    enemy: {
      characterId: 'frost',
      name:        'FROST',
      isBoss:      false,
      aiDifficulty: 'easy',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
    },

    rewards: {
      xp:    500,
      coins: 100,
      item:  { name: 'Skill Scroll', type: 'skillScroll', emoji: '📜' },
    },

    unlock: {
      characterId: 'frost',
      message:     'Frost has joined your team! You can now use Frost in battle.',
    },

    cutscene: {
      background: 'bg_arena_stone',
      bgColor:    '#1a0d00',
      bgImage:    'assets/backgrounds/cutscene_level1_bg.png',
      lines: [
        { speaker: 'EMBER', text: 'I came here to prove myself. This arena holds the answer I seek.' },
        { speaker: 'FROST', text: 'Bold words for someone who has never faced true cold. Let\'s see if your flame can survive.' },
        { speaker: 'EMBER', text: 'This is just the beginning… I will become stronger, no matter what stands in my way.' },
        { speaker: 'FROST', text: 'Then prove it. Show me that raw fire is not just empty heat.' },
      ],
    },

    bossMechanics: null,
  },

  // ─────────────────────────────────────────────
  // LEVEL 2 — BURNING RIVAL
  // Chapter 1 | Easy-Medium
  // ─────────────────────────────────────────────
  {
    id:           'level2',
    number:       2,
    title:        'Burning Rival',
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    '1-2',
    difficulty:   'easy-medium',
    difficultyNum: 2,

    enemy: {
      characterId: 'blaze',
      name:        'BLAZE',
      isBoss:      false,
      aiDifficulty: 'easy-medium',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
    },

    rewards: {
      xp:    600,
      coins: 150,
      item:  null,
    },

    unlock: {
      characterId: 'blaze',
      message:     'Blaze has joined your team! A powerful fire fighter is now at your disposal.',
    },

    cutscene: {
      background: 'bg_arena_fire',
      bgColor:    '#2a0a00',
      bgImage:    'assets/backgrounds/cutscene_level2_bg.png',
      lines: [
        { speaker: 'BLAZE', text: 'So you\'re the one they call Ember. I\'ve been watching. You\'re not ready for this arena.' },
        { speaker: 'EMBER', text: 'I earned my place here. Every fighter does.' },
        { speaker: 'BLAZE', text: 'Earning a place and deserving it are different things. I\'ll show you the true power of fire.' },
        { speaker: 'EMBER', text: 'Then let\'s see whose flame burns brighter.' },
      ],
    },

    bossMechanics: {
      description: 'At 30% HP, Blaze activates BURNING RAGE. Attack increases by 20%.',
      phaseThreshold: 0.30,
      phase2: {
        attackMultiplier: 1.20,
        effectLabel: 'BURNING RAGE!',
        effectColor: '#ff6b2b',
        newBehavior: 'aggressive',
      },
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 3 — THUNDER TRIAL
  // Chapter 1 | Medium
  // ─────────────────────────────────────────────
  {
    id:           'level3',
    number:       3,
    title:        'Thunder Trial',
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    '1-3',
    difficulty:   'medium',
    difficultyNum: 3,

    enemy: {
      characterId: 'volt',
      name:        'VOLT',
      isBoss:      false,
      aiDifficulty: 'medium',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
    },

    rewards: {
      xp:    700,
      coins: 175,
      item:  null,
    },

    unlock: {
      characterId: 'volt',
      message:     'Volt has joined your team! Lightning-fast attacks are now yours to command.',
    },

    cutscene: {
      background: 'bg_arena_storm',
      bgColor:    '#0a0a1a',
      bgImage:    'assets/backgrounds/cutscene_level3_bg.png',
      lines: [
        { speaker: 'VOLT',  text: 'Speed is everything. Fire is slow. I\'ll prove it.' },
        { speaker: 'EMBER', text: 'Speed means nothing if your strikes have no weight.' },
        { speaker: 'VOLT',  text: 'A hundred light blows will always overcome one heavy punch. Watch and learn.' },
        { speaker: 'EMBER', text: 'I\'m ready. Come fast if you dare.' },
      ],
    },

    bossMechanics: {
      description: 'Volt periodically uses FLASH STEP to teleport behind the player.',
      periodicSkill: 'flash_step',
      periodicInterval: 8000,
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 4 — MOONLIT ARENA
  // Chapter 1 | Medium
  // ─────────────────────────────────────────────
  {
    id:           'level4',
    number:       4,
    title:        'Moonlit Arena',
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    'BOSS',
    difficulty:   'medium',
    difficultyNum: 4,
    isBossLevel:  true,

    enemy: {
      characterId: 'luna',
      name:        'LUNA',
      isBoss:      true,
      aiDifficulty: 'medium',
      hpMultiplier:  1.15,
      attackMultiplier: 1.0,
      bossLabel:   'CHAPTER 1 BOSS',
      bossSubtitle: 'Guardian of the Moon',
    },

    rewards: {
      xp:    800,
      coins: 200,
      item:  { name: 'Moon Crystal', type: 'crystal', emoji: '💎' },
    },

    unlock: {
      characterId: 'luna',
      message:     'Luna has joined your team! Harness the power of the moon in battle.',
    },

    cutscene: {
      background: 'bg_arena_moon',
      bgColor:    '#0d0a1a',
      bgImage:    'assets/backgrounds/cutscene_level4_bg.png',
      lines: [
        { speaker: 'LUNA',  text: 'You have come far, flame bearer. But the arena contains an ancient energy source.' },
        { speaker: 'EMBER', text: 'Ancient energy? What do you mean?' },
        { speaker: 'LUNA',  text: 'Beneath this ground pulses a power older than fire itself. To claim it, you must first defeat me.' },
        { speaker: 'EMBER', text: 'I don\'t fully understand, but I know I have to keep moving forward.' },
      ],
    },

    bossMechanics: {
      description: 'Luna regenerates 5% HP once when HP reaches 25%.',
      healThreshold: 0.25,
      healAmount:    0.05,
      healLabel:     'LUNAR RECOVERY!',
      healOnce:      true,
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 5 — EARTH GUARDIAN
  // Chapter 2 | Medium-Hard
  // ─────────────────────────────────────────────
  {
    id:           'level5',
    number:       5,
    title:        'Earth Guardian',
    chapter:      'chapter2',
    chapterNum:   2,
    nodeLabel:    '2-1',
    difficulty:   'medium-hard',
    difficultyNum: 5,

    enemy: {
      characterId: 'terra',
      name:        'TERRA',
      isBoss:      false,
      aiDifficulty: 'medium-hard',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
    },

    rewards: {
      xp:    900,
      coins: 250,
      item:  null,
    },

    unlock: {
      characterId: 'terra',
      message:     'Terra has joined your team! Unbreakable defense is now on your side.',
    },

    cutscene: {
      background: 'bg_arena_ruins',
      bgColor:    '#0a1200',
      bgImage:    'assets/backgrounds/cutscene_level5_bg.png',
      lines: [
        { speaker: 'TERRA', text: 'This ancient arena is under my protection. No outsider may pass.' },
        { speaker: 'EMBER', text: 'I need to reach what lies beyond. I won\'t be stopped here.' },
        { speaker: 'TERRA', text: 'You will not break what the earth has sealed for centuries.' },
        { speaker: 'EMBER', text: 'I\'ve come too far. Earth or not — I\'ll find a way through.' },
      ],
    },

    bossMechanics: {
      description: 'Terra periodically creates a Stone Wall barrier.',
      periodicSkill: 'stone_wall',
      periodicInterval: 12000,
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 6 — SHADOW ASSASSIN
  // Chapter 2 | Hard
  // ─────────────────────────────────────────────
  {
    id:           'level6',
    number:       6,
    title:        'Shadow Assassin',
    chapter:      'chapter2',
    chapterNum:   2,
    nodeLabel:    '2-2',
    difficulty:   'hard',
    difficultyNum: 6,

    enemy: {
      characterId: 'kai',
      name:        'KAI',
      isBoss:      false,
      aiDifficulty: 'hard',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
    },

    rewards: {
      xp:    1000,
      coins: 275,
      item:  null,
    },

    unlock: {
      characterId: 'kai',
      message:     'Kai has joined your team! Master the shadows as this deadly assassin.',
    },

    cutscene: {
      background: 'bg_arena_shadow',
      bgColor:    '#0a0010',
      bgImage:    'assets/backgrounds/cutscene_level6_bg.png',
      lines: [
        { speaker: 'KAI',   text: 'You cannot see me. You cannot hear me. You are already defeated.' },
        { speaker: 'EMBER', text: 'Come out of the shadows and face me properly.' },
        { speaker: 'KAI',   text: 'The shadows are my home. You fight on my terms now.' },
        { speaker: 'EMBER', text: 'Then I\'ll burn away every shadow until there\'s nowhere left to hide.' },
      ],
    },

    bossMechanics: {
      description: 'Kai becomes invisible for 1 second before certain attacks.',
      useSkill: 'dark_clone',
      invisBeforeAttack: true,
      invisDuration: 1000,
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 7 — EYE OF THE STORM
  // Chapter 2 | Hard (Boss)
  // ─────────────────────────────────────────────
  {
    id:           'level7',
    number:       7,
    title:        'Eye of the Storm',
    chapter:      'chapter2',
    chapterNum:   2,
    nodeLabel:    'BOSS',
    difficulty:   'hard',
    difficultyNum: 7,
    isBossLevel:  true,

    enemy: {
      characterId: 'kira',
      name:        'KIRA',
      isBoss:      true,
      aiDifficulty: 'hard',
      hpMultiplier:  1.15,
      attackMultiplier: 1.0,
      bossLabel:   'CHAPTER 2 BOSS',
      bossSubtitle: 'Eye of the Storm',
    },

    rewards: {
      xp:    1100,
      coins: 300,
      item:  { name: 'Wind Crystal', type: 'crystal', emoji: '💎' },
    },

    unlock: {
      characterId: 'kira',
      message:     'Kira has joined your team! Become the wind itself with this speed demon.',
    },

    cutscene: {
      background: 'bg_arena_wind',
      bgColor:    '#001a0d',
      bgImage:    'assets/backgrounds/cutscene_level7_bg.png',
      lines: [
        { speaker: 'KIRA',  text: 'The winds here have chosen me as their champion. No one passes the eye of the storm.' },
        { speaker: 'EMBER', text: 'The winds can change direction. So can this fight.' },
        { speaker: 'KIRA',  text: 'You\'re confident. I respect that. But confidence won\'t save you from 145 speed.' },
        { speaker: 'EMBER', text: 'I\'ll read your movements. Speed isn\'t everything.' },
      ],
    },

    bossMechanics: {
      description: 'Kira periodically increases movement speed by 30%.',
      periodicSpeedBoost: 0.30,
      speedBoostDuration: 5000,
      speedBoostInterval: 10000,
      speedBoostLabel: 'WIND SPEED!',
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 8 — DARK CHALLENGER
  // Chapter 3 | Hard+
  // ─────────────────────────────────────────────
  {
    id:           'level8',
    number:       8,
    title:        'Dark Challenger',
    chapter:      'chapter3',
    chapterNum:   3,
    nodeLabel:    '3-1',
    difficulty:   'hard-plus',
    difficultyNum: 8,

    enemy: {
      characterId: 'shadow',
      name:        'SHADOW',
      isBoss:      false,
      aiDifficulty: 'hard-plus',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
    },

    rewards: {
      xp:    1200,
      coins: 350,
      item:  null,
    },

    unlock: {
      characterId: 'shadow',
      message:     'Shadow has joined your team! The darkness itself is now your weapon.',
    },

    cutscene: {
      background: 'bg_arena_dark',
      bgColor:    '#050005',
      bgImage:    'assets/backgrounds/cutscene_level8_bg.png',
      lines: [
        { speaker: 'SHADOW', text: 'I emerged from the darkness to test the one who carries fire. Are you worthy?' },
        { speaker: 'EMBER',  text: 'I\'ve faced every fighter in this arena. I won\'t stop now.' },
        { speaker: 'SHADOW', text: 'Those others were just the prelude. I am the real trial.' },
        { speaker: 'EMBER',  text: 'Fire against darkness. Let\'s see which one consumes the other.' },
      ],
    },

    bossMechanics: {
      description: 'Shadow has an increased critical hit chance (25% instead of 15%).',
      critChanceOverride: 0.25,
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 9 — THE INFERNO
  // Chapter 3 | Very Hard (Boss)
  // ─────────────────────────────────────────────
  {
    id:           'level9',
    number:       9,
    title:        'The Inferno',
    chapter:      'chapter3',
    chapterNum:   3,
    nodeLabel:    'BOSS',
    difficulty:   'very-hard',
    difficultyNum: 9,
    isBossLevel:  true,

    enemy: {
      characterId: 'inferno',
      name:        'INFERNO',
      isBoss:      true,
      aiDifficulty: 'very-hard',
      hpMultiplier:  1.2,
      attackMultiplier: 1.1,
      bossLabel:   'CHAPTER 3 BOSS',
      bossSubtitle: 'The Flame of Destruction',
    },

    rewards: {
      xp:    1500,
      coins: 500,
      item:  { name: 'Inferno Core', type: 'relic', emoji: '🔮' },
    },

    unlock: {
      characterId: 'inferno',
      message:     'Inferno has joined your team! The most powerful fighter is now yours to command.',
    },

    cutscene: {
      background: 'bg_arena_volcano',
      bgColor:    '#1a0000',
      bgImage:    'assets/backgrounds/cutscene_level9_bg.png',
      lines: [
        { speaker: 'INFERNO', text: 'The arena begins to collapse around me. This is where weak challengers fall.' },
        { speaker: 'EMBER',   text: 'I won\'t fall. I\'ve come too far.' },
        { speaker: 'INFERNO', text: 'You have impressed me enough to witness my true power. Prepare yourself.' },
        { speaker: 'EMBER',   text: 'I\'ve been preparing my whole life for this moment.' },
      ],
    },

    bossMechanics: {
      description:    'Phase 1 (100%-50%): Normal. Phase 2 (50%): Rage Mode +20% attack. Phase 3 (25%): Burning Ground activates.',
      phaseThreshold1: 0.50,
      phaseThreshold2: 0.25,
      phase2: {
        attackMultiplier: 1.20,
        effectLabel:      'RAGE MODE!',
        effectColor:      '#ef4444',
        newBehavior:      'aggressive',
      },
      phase3: {
        burningGround:    true,
        burningDamagePerSec: 15,
        effectLabel:      'BURNING GROUND!',
        effectColor:      '#dc2626',
      },
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 10 — FINAL ARENA
  // Chapter 4 | EXTREME (Final Boss)
  // ─────────────────────────────────────────────
  {
    id:           'level10',
    number:       10,
    title:        'Final Arena',
    chapter:      'chapter4',
    chapterNum:   4,
    nodeLabel:    'FINAL',
    difficulty:   'extreme',
    difficultyNum: 10,
    isBossLevel:  true,
    isFinalBoss:  true,

    enemy: {
      characterId:  'inferno',
      name:         'INFERNO — FINAL FORM',
      isBoss:       true,
      isFinalBoss:  true,
      aiDifficulty: 'extreme',
      hpMultiplier:  1.5,       // 2250 HP
      attackMultiplier: 1.3,
      speedMultiplier:  1.15,
      bossLabel:    'FINAL BOSS',
      bossSubtitle: 'The End of All Things',
      finalFormColor: '#ff0000',
    },

    rewards: {
      xp:    2000,
      coins: 1000,
      item:  { name: 'Champion Badge', type: 'badge', emoji: '🏆' },
    },

    unlock: null,  // Final level — no new unlock, story complete

    cutscene: {
      background: 'bg_arena_final',
      bgColor:    '#110000',
      bgImage:    'assets/backgrounds/cutscene_level10_bg.png',
      lines: [
        { speaker: 'INFERNO', text: 'You survived. But this is the final arena. There is no returning from here.' },
        { speaker: 'EMBER',   text: 'This is what I\'ve been building toward. Every battle, every scar, it all led here.' },
        { speaker: 'INFERNO', text: 'I am the end of the Fighting Arena. Defeat me, and you claim everything.' },
        { speaker: 'EMBER',   text: 'Then let\'s end this. For everyone who couldn\'t make it this far.' },
        { speaker: 'INFERNO', text: 'Show me everything you have. I will accept nothing less.' },
      ],
    },

    bossMechanics: {
      description: '3-phase final boss with increasing intensity.',
      phases: [
        {
          phase:      1,
          threshold:  1.0,   // 100% → 70%
          endAt:      0.70,
          label:      'Phase 1',
          attackMultiplier: 1.0,
          speedMultiplier:  1.0,
        },
        {
          phase:      2,
          threshold:  0.70,  // 70% → 40%
          endAt:      0.40,
          label:      'Phase 2',
          attackMultiplier: 1.15,
          speedMultiplier:  1.20,
          newSkill:   'meteor_rain',
          phaseLabel: 'SECOND FORM!',
          phaseColor: '#f97316',
          phaseEffect: 'arena_rumble',
        },
        {
          phase:      3,
          threshold:  0.40,  // 40% → 0%
          endAt:      0.0,
          label:      'Phase 3',
          attackMultiplier: 1.30,
          speedMultiplier:  1.30,
          energyRegenBonus: 5,
          ultimateCdReduction: 0.5,
          burningGround: true,
          burningDamagePerSec: 20,
          phaseLabel:  'FINAL FORM!',
          phaseColor:  '#dc2626',
          phaseEffect: 'arena_collapse',
        },
      ],
      // Unique final boss skill
      meteorRain: {
        id:          'meteor_rain',
        name:        'Meteor Rain',
        damage:      80,     // per hit, hits 3 times
        hits:        3,
        hitInterval: 400,
        emoji:       '☄️',
        hitEffect:   'fire_large',
      },
    },
  },

]; // end STORY_LEVELS

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getLevel(id) {
  return STORY_LEVELS.find(l => l.id === id) || null;
}

function getLevelByNumber(num) {
  return STORY_LEVELS.find(l => l.number === num) || null;
}

function getChapter(id) {
  return CHAPTERS.find(c => c.id === id) || null;
}

function getLevelsForChapter(chapterId) {
  const ch = getChapter(chapterId);
  if (!ch) return [];
  return ch.levels.map(lid => getLevel(lid)).filter(Boolean);
}

// Returns only the main (non-minion) levels for a chapter — used for map nodes
function getMainLevelsForChapter(chapterId) {
  return getLevelsForChapter(chapterId);
}

function getEpisodesForLevel(levelId) {
  const mainLevel = getLevel(levelId);
  if (!mainLevel) return [];
  return [mainLevel]; // no minions — single episode only
}

function getNextLevel(currentLevelId) {
  const idx = STORY_LEVELS.findIndex(l => l.id === currentLevelId);
  if (idx < 0 || idx >= STORY_LEVELS.length - 1) return null;
  return STORY_LEVELS[idx + 1];
}

// Star rating formula (Wireframe Implementation Map Phase 6 E.1)
// 3 stars = win with >50% HP; 2 stars = 25-50%; 1 star = <25%
function calcStars(playerHPPercent) {
  if (playerHPPercent > 0.50) return 3;
  if (playerHPPercent > 0.25) return 2;
  return 1;
}

// Difficulty label for display
const DIFFICULTY_LABELS = {
  'easy':        'Easy',
  'easy-medium': 'Easy+',
  'medium':      'Medium',
  'medium-hard': 'Medium+',
  'hard':        'Hard',
  'hard-plus':   'Hard+',
  'very-hard':   'Very Hard',
  'extreme':     'EXTREME',
};
