# Fighting Arena

A complete 2D story-based fighting game — HTML5 + CSS3 + JavaScript ES6+.

---

## How to Run

**Option 1 — Direct file (Chrome/Edge with flags):**
```
Open index.html directly in a browser.
Note: Audio preloading requires a local server due to browser fetch restrictions.
```

**Option 2 — Local server (recommended):**
```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code — use Live Server extension
```
Then open `http://localhost:8080` in your browser.

---

## Project Structure

```
FightingArena/
│
├── index.html              ← All 19 screen HTML elements
├── style.css               ← Complete stylesheet (all components, responsive)
├── game.js                 ← GameManager + ScreenManager + bootstrap
│
├── data/
│   ├── characters.js       ← All 10 characters: stats, skills, passives
│   └── levels.js           ← 10 story levels across 4 chapters + boss mechanics
│
├── systems/
│   ├── SaveManager.js      ← localStorage save/load/reset
│   ├── AudioManager.js     ← Web Audio API, music + SFX, graceful fallback
│   ├── InputManager.js     ← Keyboard + touch input mapping
│   └── EffectManager.js    ← Damage numbers, particles, screen shake, combo counter
│
├── engine/
│   ├── Skills.js           ← SkillSystem class: cooldowns, passives, energy, damage
│   ├── Character.js        ← Character class: physics, states, HP, drawing
│   ├── CpuAI.js            ← AI state machine: APPROACH, ATTACK, DEFEND, RETREAT...
│   └── BattleEngine.js     ← Game loop, hit detection, rounds, projectiles, HUD
│
├── screens/
│   ├── MainMenu.js         ← Main menu + particle background
│   ├── StoryMap.js         ← Chapter list + level node map
│   ├── CharacterSelect.js  ← Character grid + profile/stats view
│   ├── Cutscene.js         ← Typewriter dialogue system
│   ├── BattleScreen.js     ← Battle screen entry + Quick Battle builder
│   ├── VictoryScreen.js    ← Victory, Defeat, Unlock, Chapter Complete, Story Complete, Boss Intro
│   ├── HowToPlay.js        ← Controls reference screen
│   └── Settings.js         ← Volume sliders, fullscreen, save reset
│
└── assets/
    ├── characters/         ← Place character sprite sheets here
    ├── backgrounds/        ← Place background images here
    ├── effects/            ← Place VFX sprites here
    ├── icons/              ← Place skill icons here
    └── audio/              ← Place audio files here (see below)
```

---

## Architecture

### Game States
All navigation is handled by `GameManager.navigate(STATE)`. Valid states:

```
MENU → STORY_MAP → CHAPTER_MAP → CUTSCENE → BATTLE → VICTORY/DEFEAT
VICTORY → CHARACTER_UNLOCK → CHAPTER_COMPLETE → STORY_COMPLETE
Any screen → HOW_TO_PLAY, SETTINGS
BATTLE → BOSS_INTRO (boss levels)
MENU → CHARACTER_SELECT → CHAR_PROFILE → BATTLE (quick battle)
```

### Data Flow
1. `SaveManager` holds all persistent state (localStorage)
2. `GameManager` holds session state (current level, selected chars)
3. Screens read from both, never write directly to each other
4. `BattleEngine` is entirely self-contained — init, run, emit result to `GameManager`

### Damage Formula
```
finalDamage = baseDamage × (attackerAttack / 100) × (100 / (100 + defenderDefense))
× critMultiplier × passiveMultiplier × blockReduction
```
Normal block: 65% reduction | Perfect block (0.2s window): 90% reduction

### Round System
- Best of 3 rounds
- Each round: 99 seconds
- Win condition: opponent HP = 0, OR higher HP on timeout
- Match winner: first to win 2 rounds

---

## How to Add a New Character

1. Open `data/characters.js`
2. Add a new entry to the `CHARACTERS` object following the existing pattern:
```js
newchar: {
  id: 'newchar', name: 'NEWCHAR', element: 'Wind', role: 'Speed',
  description: 'Your description here.',
  unlockLevel: 10,
  isStarter: false,
  emoji: '⚡',          // placeholder — replace with actual portrait path
  color: '#00ff88',
  bgGradient: '...',
  stats: { hp: 950, attack: 110, defense: 80, speed: 120, maxEnergy: 100 },
  displayStats: { hp: 6, energy: 7, speed: 8, attack: 7, defense: 5 },
  passive: { id: 'my_passive', name: 'MY PASSIVE', description: '...' },
  skills: [ /* 5 skills: basic, skill1, skill2, skill3, ultimate */ ],
}
```
3. Add `'newchar'` to `CHARACTER_ORDER` array
4. Handle the passive in `SkillSystem._initPassive()` and `_updatePassive()`
5. Add the unlock to a story level in `data/levels.js`

---

## How to Add a New Level

1. Open `data/levels.js`
2. Add a new entry to `STORY_LEVELS`:
```js
{
  id: 'level11', number: 11, title: 'My Level',
  chapter: 'chapter4', chapterNum: 4, nodeLabel: '4-1',
  difficulty: 'hard', difficultyNum: 7,
  enemy: { characterId: 'mychar', isBoss: false, aiDifficulty: 'hard',
           hpMultiplier: 1.0, attackMultiplier: 1.0 },
  rewards: { xp: 1000, coins: 300 },
  unlock: { characterId: 'newchar', message: 'New char unlocked!' },
  cutscene: {
    bgColor: '#0a0a1a',
    lines: [ { speaker: 'EMBER', text: 'Dialogue here.' } ],
  },
  bossMechanics: null,
}
```
3. Add the level ID to the correct chapter's `levels` array in `CHAPTERS`

---

## How to Replace Placeholder Artwork

All characters currently use emoji as placeholders. To replace:

1. Add portrait images to `assets/characters/` (e.g. `ember.png`, `ember_victory.png`)
2. In `Character.js → _drawBody()`, replace the emoji draw block with:
```js
const img = new Image();
img.src = `assets/characters/${this.charData.id}.png`;
ctx.drawImage(img, x, y, w, h);
```
For production, preload images in an `AssetManager` before the game starts.

3. For character select/profile portraits, update the `char-card-portrait` divs in `CharacterSelect.js` to use `<img>` tags.

---

## How to Add Audio

Place audio files in `assets/audio/`. Expected filenames:

| File | Purpose |
|------|---------|
| `menu_music.mp3` | Main menu background music |
| `battle_music.mp3` | Standard battle music |
| `boss_music.mp3` | Boss battle music |
| `victory.mp3` | Victory fanfare |
| `defeat.mp3` | Defeat music |
| `unlock.mp3` | Character unlock music |
| `btn_click.mp3` | Button click SFX |
| `attack_hit.mp3` | Hit impact SFX |
| `skill_fire.mp3` | Fire skill SFX |
| `skill_ice.mp3` | Ice skill SFX |
| `skill_lightning.mp3` | Lightning skill SFX |
| `ultimate.mp3` | Ultimate activation SFX |
| `block.mp3` | Block SFX |
| `ko.mp3` | KO SFX |
| `round_start.mp3` | Round start SFX |
| `countdown.mp3` | Countdown tick SFX |
| `star_reveal.mp3` | Star reveal SFX |
| `unlock_chime.mp3` | Unlock chime SFX |
| `combo.mp3` | Combo hit SFX |
| `critical.mp3` | Critical hit SFX |
| `navigate.mp3` | Menu navigation SFX |

The game runs fully without audio files — `AudioManager` fails gracefully.

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| A / ← | Move Left |
| D / → | Move Right |
| W / ↑ | Jump |
| S | Block |
| J | Basic Attack |
| K | Skill 1 |
| L | Skill 2 |
| U | Skill 3 |
| I | Ultimate (requires 100 energy) |
| ESC | Pause |
| M | Toggle Sound |

---

## Testing Checklist

- [ ] Main menu loads, all 5 buttons work
- [ ] Story Mode opens chapter list
- [ ] Chapter 1 available, others locked
- [ ] Ember starts as only unlocked character
- [ ] Level 1 opens cutscene
- [ ] Battle starts, player can move
- [ ] Player can jump, attack, block
- [ ] All 5 skills work with cooldowns
- [ ] Energy fills and depletes correctly
- [ ] Ultimate only fires at 100 energy
- [ ] CPU AI moves and attacks
- [ ] HP bars update correctly
- [ ] Round timer counts down
- [ ] KO triggers round end
- [ ] Best of 3 rounds works
- [ ] Victory screen shows EXP/coins/stars
- [ ] Frost unlocks after Level 1
- [ ] Unlock popup displays correctly
- [ ] All 10 levels playable
- [ ] Boss phase changes trigger
- [ ] Final boss (Level 10) has 3 phases
- [ ] Story Complete screen shows all characters
- [ ] Save persists after browser refresh
- [ ] Reset save works with confirmation
- [ ] Quick Battle mode works
- [ ] Settings volume sliders work
- [ ] Mobile touch controls work
- [ ] Responsive layout on small screens
- [ ] Pause/resume works mid-battle
- [ ] No console errors on normal play

---

## Known Limitations

1. **Character artwork:** All characters use emoji placeholders. Replace with sprite sheets for production.
2. **Audio:** No audio files included. Drop MP3s into `assets/audio/` to enable sound.
3. **Backgrounds:** Arena background is procedurally drawn on canvas. Replace with artwork images for visual polish.
4. **Animations:** Characters are drawn as stylised geometric shapes. A full sprite sheet system is architecturally ready — see `Character.js _drawBody()` and the animation state machine.
5. **Save reset on Quick Battle:** Quick battle wins don't advance story progression, only earn XP/coins.
6. **Perfect block:** The 0.2s window is implemented but requires precise timing — may feel tight on mobile.

---

## Credits

Built with: HTML5 · CSS3 · JavaScript ES6+ · Web Audio API · Canvas 2D API

Design reference: Fighting Arena Wireframe (16 panels) + Master Specification v1.0
