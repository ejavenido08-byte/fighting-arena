// ─────────────────────────────────────────────────────────────
// data/levels.js  — Story Mode level definitions
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// CHAPTERS
// ─────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id:       'chapter1',
    title:    'Chapter 1: The Awakening',
    number:   1,
    levels:   ['level1', 'level2', 'level3', 'level4'],
    mapBg:    'assets/backgrounds/chapter1_map_bg.png',
    unlockXP: 0,
  },
  {
    id:       'chapter2',
    title:    'Chapter 2: The Rising Storm',
    number:   2,
    levels:   ['level5', 'level6', 'level7'],
    mapBg:    'assets/backgrounds/chapter1_map_bg.png',
    unlockXP: 1000,
  },
  {
    id:       'chapter3',
    title:    'Chapter 3: The Shadow War',
    number:   3,
    levels:   ['level8', 'level9'],
    mapBg:    'assets/backgrounds/chapter1_map_bg.png',
    unlockXP: 2500,
  },
  {
    id:       'chapter4',
    title:    'Chapter 4: The Final Stand',
    number:   4,
    levels:   ['level10'],
    mapBg:    'assets/backgrounds/chapter1_map_bg.png',
    unlockXP: 4000,
  },
];

// ─────────────────────────────────────────────────────────────
// STORY_LEVELS
// ─────────────────────────────────────────────────────────────
const STORY_LEVELS = [

  // ─────────────────────────────────────────────
  // LEVEL 1 — THE FIRST FLAME
  // Chapter 1 | EASY
  // ─────────────────────────────────────────────
  {
    id:           'level1',
    number:       1,
    title:        'The First Flame',
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    '1',
    difficulty:   'easy',
    difficultyNum: 1,
    isBossLevel:  false,
    isFinalBoss:  false,

    enemy: {
      characterId:  'frost',
      name:         'FROST',
      isBoss:       false,
      aiDifficulty: 'easy',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
      speedMultiplier:  1.0,
    },

    rewards: {
      xp:    100,
      coins: 50,
      item:  null,
    },

    unlock: { characterId: 'frost',   message: 'Frost has joined your team!' },

    cutscene: {
      background: 'bg_level1',
      bgColor:    '#001133',
      bgImage:    'assets/backgrounds/cutscene_level1_bg.png',
      lines: [
        { speaker: 'EMBER', text: 'So this is where it begins. My first real test.' },
        { speaker: 'FROST', text: 'You dare challenge me? I will freeze you where you stand.' },
        { speaker: 'EMBER', text: 'Bring it on. I have nothing to lose.' },
      ],
    },

    bossMechanics: null,
  },

  // ─────────────────────────────────────────────
  // LEVEL 2 — BLAZE OF GLORY
  // Chapter 1 | EASY-MEDIUM
  // ─────────────────────────────────────────────
  {
    id:           'level2',
    number:       2,
    title:        'Blaze of Glory',
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    '2',
    difficulty:   'easy-medium',
    difficultyNum: 2,
    isBossLevel:  false,
    isFinalBoss:  false,

    enemy: {
      characterId:  'blaze',
      name:         'BLAZE',
      isBoss:       false,
      aiDifficulty: 'easy',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
      speedMultiplier:  1.0,
    },

    rewards: {
      xp:    150,
      coins: 75,
      item:  null,
    },

    unlock: { characterId: 'blaze',   message: 'Blaze has joined your team!' },

    cutscene: {
      background: 'bg_level2',
      bgColor:    '#220800',
      bgImage:    'assets/backgrounds/cutscene_level2_bg.png',
      lines: [
        { speaker: 'EMBER', text: 'Flames against flames. This will be interesting.' },
        { speaker: 'BLAZE', text: 'You think your fire can match mine? I am the original!' },
        { speaker: 'EMBER', text: 'Then let the better flame win.' },
      ],
    },

    bossMechanics: null,
  },

  // ─────────────────────────────────────────────
  // LEVEL 3 — STORM SURGE
  // Chapter 1 | MEDIUM
  // ─────────────────────────────────────────────
  {
    id:           'level3',
    number:       3,
    title:        'Storm Surge',
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    '3',
    difficulty:   'medium',
    difficultyNum: 3,
    isBossLevel:  false,
    isFinalBoss:  false,

    enemy: {
      characterId:  'volt',
      name:         'VOLT',
      isBoss:       false,
      aiDifficulty: 'medium',
      hpMultiplier:  1.0,
      attackMultiplier: 1.0,
      speedMultiplier:  1.0,
    },

    rewards: {
      xp:    200,
      coins: 100,
      item:  null,
    },

    unlock: { characterId: 'volt',    message: 'Volt has joined your team!' },

    cutscene: {
      background: 'bg_level3',
      bgColor:    '#001122',
      bgImage:    'assets/backgrounds/cutscene_level3_bg.png',
      lines: [
        { speaker: 'EMBER', text: 'The air crackles with electricity. I have to stay focused.' },
        { speaker: 'VOLT',  text: 'Speed and lightning — you cannot dodge what you cannot see.' },
        { speaker: 'EMBER', text: 'I do not need to see it. I just need to survive it.' },
      ],
    },

    bossMechanics: null,
  },

  // ─────────────────────────────────────────────
  // LEVEL 4 — LUNA'S JUDGMENT
  // Chapter 1 | BOSS
  // ─────────────────────────────────────────────
  {
    id:           'level4',
    number:       4,
    title:        "Luna's Judgment",
    chapter:      'chapter1',
    chapterNum:   1,
    nodeLabel:    'BOSS',
    difficulty:   'medium',
    difficultyNum: 4,
    isBossLevel:  true,
    isFinalBoss:  false,

    enemy: {
      characterId:  'luna',
      name:         'LUNA',
      isBoss:       true,
      aiDifficulty: 'medium',
      hpMultiplier:  1.2,
      attackMultiplier: 1.1,
      speedMultiplier:  1.0,
      bossLabel:    'CHAPTER 1 BOSS',
      bossSubtitle: 'Guardian of the Moon',
    },

    rewards: {
      xp:    400,
      coins: 200,
      item:  { name: 'Moonstone Shard', type: 'material', emoji: '🌙' },
    },

    unlock: { characterId: 'luna',    message: 'Luna has joined your team!' },

    cutscene: {
      background: 'bg_level4',
      bgColor:    '#110022',
      bgImage:    'assets/backgrounds/cutscene_level4_bg.png',
      lines: [
        { speaker: 'LUNA',  text: 'I have watched your progress. You are stronger than I expected.' },
        { speaker: 'EMBER', text: 'Then you know I will not back down.' },
        { speaker: 'LUNA',  text: 'Prove yourself worthy. Only the strong may pass.' },
        { speaker: 'EMBER', text: 'I will earn my place. Count on it.' },
      ],
    },

    bossMechanics: {
      description: 'Luna fights with lunar energy and phase shifts.',
      phases: [
        {
          phase:      1,
          threshold:  1.0,
          endAt:      0.50,
          label:      'Phase 1',
          attackMultiplier: 1.0,
          speedMultiplier:  1.0,
        },
        {
          phase:      2,
          threshold:  0.50,
          endAt:      0.0,
          label:      'Phase 2',
          attackMultiplier: 1.2,
          speedMultiplier:  1.15,
          phaseLabel: 'FULL MOON FORM!',
          phaseColor: '#c0c0ff',
          phaseEffect: 'moonrise',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 5 — EARTH BREAKER
  // Chapter 2 | MEDIUM-HARD
  // ─────────────────────────────────────────────
  {
    id:           'level5',
    number:       5,
    title:        'Earth Breaker',
    chapter:      'chapter2',
    chapterNum:   2,
    nodeLabel:    '5',
    difficulty:   'medium-hard',
    difficultyNum: 5,
    isBossLevel:  false,
    isFinalBoss:  false,

    enemy: {
      characterId:  'terra',
      name:         'TERRA',
      isBoss:       false,
      aiDifficulty: 'medium',
      hpMultiplier:  1.1,
      attackMultiplier: 1.05,
      speedMultiplier:  1.0,
    },

    rewards: {
      xp:    300,
      coins: 150,
      item:  null,
    },

    unlock: { characterId: 'terra',   message: 'Terra has joined your team!' },

    cutscene: {
      background: 'bg_level5',
      bgColor:    '#1a0a00',
      bgImage:    'assets/backgrounds/cutscene_level5_bg.png',
      lines: [
        { speaker: 'EMBER', text: 'A new chapter. The ground itself feels different here.' },
        { speaker: 'TERRA', text: 'The earth answers to me. You will be crushed beneath it.' },
        { speaker: 'EMBER', text: 'I have faced worse. Come.' },
      ],
    },

    bossMechanics: null,
  },

  // ─────────────────────────────────────────────
  // LEVEL 6 — THE KAI TRIAL
  // Chapter 2 | HARD
  // ─────────────────────────────────────────────
  {
    id:           'level6',
    number:       6,
    title:        'The Kai Trial',
    chapter:      'chapter2',
    chapterNum:   2,
    nodeLabel:    '6',
    difficulty:   'hard',
    difficultyNum: 6,
    isBossLevel:  false,
    isFinalBoss:  false,

    enemy: {
      characterId:  'kai',
      name:         'KAI',
      isBoss:       false,
      aiDifficulty: 'hard',
      hpMultiplier:  1.1,
      attackMultiplier: 1.1,
      speedMultiplier:  1.05,
    },

    rewards: {
      xp:    350,
      coins: 175,
      item:  null,
    },

    unlock: { characterId: 'kai',     message: 'Kai has joined your team!' },

    cutscene: {
      background: 'bg_level6',
      bgColor:    '#0a0a1a',
      bgImage:    'assets/backgrounds/cutscene_level6_bg.png',
      lines: [
        { speaker: 'KAI',   text: 'Few make it this far. You should be proud — and afraid.' },
        { speaker: 'EMBER', text: 'Pride is for the victors. Let me earn it first.' },
        { speaker: 'KAI',   text: 'Then show me what you have.' },
      ],
    },

    bossMechanics: null,
  },

  // ─────────────────────────────────────────────
  // LEVEL 7 — KIRA'S DOMAIN
  // Chapter 2 | BOSS
  // ─────────────────────────────────────────────
  {
    id:           'level7',
    number:       7,
    title:        "Kira's Domain",
    chapter:      'chapter2',
    chapterNum:   2,
    nodeLabel:    'BOSS',
    difficulty:   'hard',
    difficultyNum: 7,
    isBossLevel:  true,
    isFinalBoss:  false,

    enemy: {
      characterId:  'kira',
      name:         'KIRA',
      isBoss:       true,
      aiDifficulty: 'hard',
      hpMultiplier:  1.3,
      attackMultiplier: 1.15,
      speedMultiplier:  1.1,
      bossLabel:    'CHAPTER 2 BOSS',
      bossSubtitle: 'Mistress of Blades',
    },

    rewards: {
      xp:    600,
      coins: 300,
      item:  { name: 'Blade Fragment', type: 'material', emoji: '⚔️' },
    },

    unlock: { characterId: 'kira',    message: 'Kira has joined your team!' },

    cutscene: {
      background: 'bg_level7',
      bgColor:    '#1a0022',
      bgImage:    'assets/backgrounds/cutscene_level7_bg.png',
      lines: [
        { speaker: 'KIRA',  text: 'You have come far, little flame. But this is where your journey ends.' },
        { speaker: 'EMBER', text: 'I have heard that before.' },
        { speaker: 'KIRA',  text: 'Not from me.' },
        { speaker: 'EMBER', text: 'Then let\'s see if you can back it up.' },
      ],
    },

    bossMechanics: {
      description: 'Kira uses blade combos and speed bursts.',
      phases: [
        {
          phase:      1,
          threshold:  1.0,
          endAt:      0.55,
          label:      'Phase 1',
          attackMultiplier: 1.0,
          speedMultiplier:  1.0,
        },
        {
          phase:      2,
          threshold:  0.55,
          endAt:      0.0,
          label:      'Phase 2',
          attackMultiplier: 1.25,
          speedMultiplier:  1.30,
          phaseLabel: 'BLADE STORM!',
          phaseColor: '#ff00aa',
          phaseEffect: 'blade_aura',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  // LEVEL 8 — SHADOW REALM
  // Chapter 3 | HARD-PLUS
  // ─────────────────────────────────────────────
  {
    id:           'level8',
    number:       8,
    title:        'Shadow Realm',
    chapter:      'chapter3',
    chapterNum:   3,
    nodeLabel:    '8',
    difficulty:   'hard-plus',
    difficultyNum: 8,
    isBossLevel:  false,
    isFinalBoss:  false,

    enemy: {
      characterId:  'shadow',
      name:         'SHADOW',
      isBoss:       false,
      aiDifficulty: 'hard',
      hpMultiplier:  1.2,
      attackMultiplier: 1.15,
      speedMultiplier:  1.1,
    },

    rewards: {
      xp:    500,
      coins: 250,
      item:  null,
    },

    unlock: { characterId: 'shadow',  message: 'Shadow has joined your team!' },

    cutscene: {
      background: 'bg_level8',
      bgColor:    '#050505',
      bgImage:    'assets/backgrounds/cutscene_level8_bg.png',
      lines: [
        { speaker: 'EMBER',  text: 'Darkness everywhere. I can barely see.' },
        { speaker: 'SHADOW', text: 'Good. That is exactly how I want it.' },
        { speaker: 'EMBER',  text: 'I do not need to see you to fight you.' },
      ],
    },

    bossMechanics: null,
  },

  // ─────────────────────────────────────────────
  // LEVEL 9 — INFERNO RISING
  // Chapter 3 | BOSS
  // ─────────────────────────────────────────────
  {
    id:           'level9',
    number:       9,
    title:        'Inferno Rising',
    chapter:      'chapter3',
    chapterNum:   3,
    nodeLabel:    'BOSS',
    difficulty:   'very-hard',
    difficultyNum: 9,
    isBossLevel:  true,
    isFinalBoss:  false,

    enemy: {
      characterId:  'inferno',
      name:         'INFERNO',
      isBoss:       true,
      aiDifficulty: 'hard',
      hpMultiplier:  1.35,
      attackMultiplier: 1.2,
      speedMultiplier:  1.1,
      bossLabel:    'CHAPTER 3 BOSS',
      bossSubtitle: 'Lord of Flames',
    },

    rewards: {
      xp:    800,
      coins: 400,
      item:  { name: 'Inferno Core', type: 'material', emoji: '🔥' },
    },

    unlock: { characterId: 'inferno', message: 'Inferno has joined your team!' },

    cutscene: {
      background: 'bg_level9',
      bgColor:    '#220000',
      bgImage:    'assets/backgrounds/cutscene_level9_bg.png',
      lines: [
        { speaker: 'INFERNO', text: 'You have made it further than anyone before you.' },
        { speaker: 'EMBER',   text: 'Because I have more reason to fight.' },
        { speaker: 'INFERNO', text: 'Reason means nothing against true power.' },
        { speaker: 'EMBER',   text: 'Then I will prove you wrong.' },
      ],
    },

    bossMechanics: {
      description: 'Inferno uses fire waves and rage mode.',
      phases: [
        {
          phase:      1,
          threshold:  1.0,
          endAt:      0.60,
          label:      'Phase 1',
          attackMultiplier: 1.0,
          speedMultiplier:  1.0,
        },
        {
          phase:      2,
          threshold:  0.60,
          endAt:      0.0,
          label:      'Phase 2',
          attackMultiplier: 1.25,
          speedMultiplier:  1.20,
          phaseLabel: 'RAGE MODE!',
          phaseColor: '#ff4400',
          phaseEffect: 'fire_storm',
        },
      ],
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
      hpMultiplier:  1.5,
      attackMultiplier: 1.3,
      speedMultiplier:  1.15,
      bossLabel:    'FINAL BOSS',
      bossSubtitle: 'The End of All Things',
      finalFormColor: '#ff0000',
    },

    rewards: {
      xp:    2000,
      coins: 1000,
      item:  { name: 'Champion Badge', type: 'badge', emoji: '\uD83C\uDFC6' },
    },

    unlock: null,

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
          threshold:  1.0,
          endAt:      0.70,
          label:      'Phase 1',
          attackMultiplier: 1.0,
          speedMultiplier:  1.0,
        },
        {
          phase:      2,
          threshold:  0.70,
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
          threshold:  0.40,
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
      meteorRain: {
        id:          'meteor_rain',
        name:        'Meteor Rain',
        damage:      80,
        hits:        3,
        hitInterval: 400,
        emoji:       '\u2604\uFE0F',
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

// Returns levels for a chapter — used for map nodes
function getMainLevelsForChapter(chapterId) {
  return getLevelsForChapter(chapterId);
}

function getEpisodesForLevel(levelId) {
  return [getLevel(levelId)].filter(Boolean);
}

function getNextLevel(currentLevelId) {
  const idx = STORY_LEVELS.findIndex(l => l.id === currentLevelId);
  if (idx < 0 || idx >= STORY_LEVELS.length - 1) return null;
  return STORY_LEVELS[idx + 1];
}

// Star rating formula
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
