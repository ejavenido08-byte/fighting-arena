// ═══════════════════════════════════════════════════════════════
// FIGHTING ARENA — CHARACTER DATA  (v4 — sprite-matched)
//
// Skills, names, and descriptions are based on the ACTUAL
// sprite sheet animations for each character.
//
// SPRITE ROW ORDER (all sheets):
//   0=idle  1=walk  2=jump  3=attack  4=skill1  5=skill2
//   6=ultimate  7=hit  8=knockdown  9=block  10=victory  11=defeat
//
// Frame counts per character are reflected in AssetManager.js
// CHAR_FRAME_COUNTS (updated below to match).
// ═══════════════════════════════════════════════════════════════

const CHARACTERS = {

  // ─────────────────────────────────────────────
  // CHARACTER 01 — EMBER  (Starter)
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(7f)  2=jump(3f)
  //   3=attack — fire punch combo (5f)
  //   4=skill1 — fireball launch (5f)
  //   5=skill2 — rising fire pillar burst (6f)  ← used as skill2 AND ultimate anim
  //   6=hit(2f)  7=knockdown(3f)  8=block(2f)
  //   9=victory(4f)  10=defeat(3f)
  // ─────────────────────────────────────────────
  ember: {
    id:          'ember',
    name:        'EMBER',
    element:     'Fire',
    role:        'Balanced',
    description: 'A balanced fire fighter who masters both offense and defense. Burns harder with every hit landed.',
    unlockLevel: 0,
    isStarter:   true,
    emoji:       '🔥',
    color:       '#ff6b2b',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(255,107,43,0.3) 0%, transparent 65%)',

    stats: {
      hp:        1000,
      attack:    100,
      defense:   80,
      speed:     100,
      maxEnergy: 100,
    },
    displayStats: { hp: 7, energy: 7, speed: 6, attack: 7, defense: 6 },

    passive: {
      id:          'heat',
      name:        'HEAT',
      description: 'Every 3 successful hits stacks HEAT, increasing damage by 5% per stack (max 3 stacks, 5 sec).',
      maxStacks:   3,
      stackBonus:  0.05,
      duration:    5000,
    },

    skills: [
      {
        // Row 3 — fire punch combo, 5 frames
        id:          'fire_punch',
        name:        'Fire Punch',
        type:        'basic',
        emoji:       '👊',
        damage:      80,
        cooldown:    350,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'A rapid fire-infused punch combo. Short range but fast startup.',
        hitEffect:   'fire_small',
        startup:     100,
        active:      120,
        recovery:    180,
      },
      {
        // Row 4 — fireball launch, 5 frames: wind-up → release fireball
        id:          'fireball',
        name:        'Fireball',
        type:        'skill',
        emoji:       '🔥',
        damage:      140,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'medium',
        knockback:   'light',
        description: 'Charges and launches a blazing fireball projectile at the enemy.',
        hitEffect:   'fire_medium',
        isProjectile: true,
        projectileSpeed: 8,
        startup:     150,
        active:      800,
        recovery:    300,
      },
      {
        // Row 4 continued (re-use skill anim) — dash forward strike
        id:          'flame_dash',
        name:        'Flame Dash',
        type:        'skill',
        emoji:       '💨',
        damage:      120,
        cooldown:    6000,
        energyCost:  25,
        energyGain:  5,
        range:       'close',
        knockback:   'medium',
        description: 'Dashes forward engulfed in flames and strikes the enemy at close range.',
        hitEffect:   'fire_dash',
        isDash:      true,
        dashDistance: 180,
        startup:     80,
        active:      200,
        recovery:    250,
      },
      {
        // Row 5 — rising fire pillar burst, 6 frames: crouch → explosive pillar eruption
        id:          'fire_pillar',
        name:        'Fire Pillar',
        type:        'skill',
        emoji:       '🌋',
        damage:      190,
        cooldown:    9000,
        energyCost:  35,
        energyGain:  5,
        range:       'close',
        knockback:   'heavy',
        description: 'Slams the ground to erupt a towering pillar of fire directly under the enemy.',
        hitEffect:   'fire_large',
        isAoe:       true,
        aoeRadius:   80,
        launchesEnemy: true,
        startup:     200,
        active:      300,
        recovery:    400,
      },
      {
        // Row 5 (ultimate anim) — full fire explosion engulfs screen
        id:          'inferno_blast',
        name:        'Inferno Blast',
        type:        'ultimate',
        emoji:       '☀️',
        damage:      350,
        cooldown:    20000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Releases all stored heat in a massive firestorm explosion that engulfs the entire arena.',
        hitEffect:   'fire_ultimate',
        isUltimate:  true,
        screenFlash: 'red',
        isAoe:       true,
        aoeRadius:   160,
        startup:     300,
        active:      500,
        recovery:    600,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 02 — FROST
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(6f)  2=jump(3f)
  //   3=attack — cross-arm ice strike (5f)
  //   4=skill1 — ice star/shard throw (5f)
  //   5=skill2 — ice lance beam projectile (4f)
  //   6=ultimate — blizzard ice pillars erupt (6f)
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f, ice shield wall)
  //   10=victory(3f)  11=defeat(3f)
  // ─────────────────────────────────────────────
  frost: {
    id:          'frost',
    name:        'FROST',
    element:     'Ice',
    role:        'Defense',
    description: 'A defensive ice controller who slows enemies and hides behind frozen barriers. Hard to kill.',
    unlockLevel: 1,
    isStarter:   false,
    emoji:       '❄️',
    color:       '#38bdf8',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.25) 0%, transparent 65%)',

    stats: {
      hp:        1150,
      attack:    90,
      defense:   110,
      speed:     80,
      maxEnergy: 100,
    },
    displayStats: { hp: 8, energy: 6, speed: 5, attack: 6, defense: 8 },

    passive: {
      id:          'frozen_armor',
      name:        'FROZEN ARMOR',
      description: 'Blocking reduces incoming damage by an extra 10%. Ice armor visibly forms on block.',
      blockBonus:  0.10,
    },

    skills: [
      {
        // Row 3 — cross-arm ice strike, 5 frames
        id:          'ice_strike',
        name:        'Ice Strike',
        type:        'basic',
        emoji:       '🧊',
        damage:      75,
        cooldown:    400,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'A sharp ice-infused cross strike. Leaves frost on the enemy slowing them briefly.',
        hitEffect:   'ice_small',
        startup:     110,
        active:      130,
        recovery:    200,
      },
      {
        // Row 4 — ice star/snowflake shard throw, 5 frames: wind-up → release spinning shard
        id:          'ice_shard',
        name:        'Ice Star',
        type:        'skill',
        emoji:       '❄️',
        damage:      130,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'medium',
        knockback:   'light',
        description: 'Conjures and hurls a razor-sharp spinning ice star that pierces through.',
        hitEffect:   'ice_medium',
        isProjectile: true,
        projectileSpeed: 7,
        slowDuration: 800,
        slowAmount:   0.3,
        startup:     180,
        active:      800,
        recovery:    300,
      },
      {
        // Row 5 — ice lance beam: charges → fires long ice lance projectile, 4 frames
        id:          'ice_lance',
        name:        'Ice Lance',
        type:        'skill',
        emoji:       '🏔️',
        damage:      160,
        cooldown:    6000,
        energyCost:  30,
        energyGain:  5,
        range:       'long',
        knockback:   'medium',
        description: 'Extends arms forward and fires a long piercing lance of solid ice across the arena.',
        hitEffect:   'ice_lance',
        isProjectile: true,
        projectileSpeed: 10,
        slowDuration: 1500,
        slowAmount:   0.5,
        startup:     200,
        active:      900,
        recovery:    350,
      },
      {
        // Row 9 — block anim shows ice wall forming, repurposed as skill
        id:          'frost_wall',
        name:        'Frost Barrier',
        type:        'skill',
        emoji:       '🛡️',
        damage:      60,
        cooldown:    9000,
        energyCost:  35,
        energyGain:  5,
        range:       'close',
        knockback:   'light',
        description: 'Summons a wall of ice crystals that blocks incoming projectiles and deals contact damage.',
        hitEffect:   'ice_wall',
        isBarrier:   true,
        barrierDuration: 3000,
        barrierAbsorb: 250,
        startup:     200,
        active:      400,
        recovery:    400,
      },
      {
        // Row 6 — blizzard: ice pillars erupt all around, 6 frames
        id:          'absolute_zero',
        name:        'Absolute Zero',
        type:        'ultimate',
        emoji:       '🌨️',
        damage:      320,
        cooldown:    20000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Raises hands to the sky and erupts a blizzard of massive ice spikes across the entire arena.',
        hitEffect:   'ice_ultimate',
        isUltimate:  true,
        screenFlash: 'white',
        isAoe:       true,
        aoeRadius:   180,
        slowDuration: 2000,
        slowAmount:   0.6,
        startup:     350,
        active:      600,
        recovery:    700,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 03 — BLAZE
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(6f)  2=jump(3f)
  //   3=attack — spinning fire swipe (5f)
  //   4=skill1 — fire wheel/ring spin attack (5f)
  //   5=skill2 — fire pillar summon from ground (5f)
  //   6=ultimate — full body firestorm eruption (6f)
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f)
  //   10=victory(3f)  11=defeat(3f)
  // ─────────────────────────────────────────────
  blaze: {
    id:          'blaze',
    name:        'BLAZE',
    element:     'Fire',
    role:        'Berserker',
    description: 'A wild fire berserker who hits harder as HP drops. Unstoppable at low health — pure aggression.',
    unlockLevel: 2,
    isStarter:   false,
    emoji:       '🌪️',
    color:       '#f97316',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.3) 0%, transparent 65%)',

    stats: {
      hp:        900,
      attack:    125,
      defense:   65,
      speed:     105,
      maxEnergy: 100,
    },
    displayStats: { hp: 6, energy: 6, speed: 7, attack: 9, defense: 4 },

    passive: {
      id:          'burning_rage',
      name:        'BURNING RAGE',
      description: 'Damage increases by 2% for every 10% HP lost. At 30% HP Blaze\'s hair ignites fully.',
      bonusPerTenPercent: 0.02,
    },

    skills: [
      {
        // Row 3 — spinning fire swipe with both arms, 5 frames
        id:          'fire_swipe',
        name:        'Fire Swipe',
        type:        'basic',
        emoji:       '🔥',
        damage:      95,
        cooldown:    300,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'A wild spinning fire swipe with both burning fists. Fast and relentless.',
        hitEffect:   'fire_small',
        startup:     80,
        active:      120,
        recovery:    150,
      },
      {
        // Row 4 — fire wheel ring: spins body forward as a ring of fire, 5 frames
        id:          'fire_wheel',
        name:        'Fire Wheel',
        type:        'skill',
        emoji:       '🔄',
        damage:      160,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'medium',
        knockback:   'medium',
        description: 'Blaze spins into a rolling wheel of fire that crashes into the enemy.',
        hitEffect:   'fire_medium',
        isDash:      true,
        dashDistance: 180,
        startup:     120,
        active:      200,
        recovery:    280,
      },
      {
        // Row 5 — fire pillar from ground: stomps ground, pillars erupt upward, 5 frames
        id:          'flame_pillars',
        name:        'Flame Pillars',
        type:        'skill',
        emoji:       '⬆️',
        damage:      185,
        cooldown:    7000,
        energyCost:  30,
        energyGain:  5,
        range:       'close',
        knockback:   'heavy',
        description: 'Stomps the ground to erupt multiple flame pillars that launch the enemy skyward.',
        hitEffect:   'fire_large',
        isAoe:       true,
        aoeRadius:   90,
        launchesEnemy: true,
        startup:     150,
        active:      300,
        recovery:    400,
      },
      {
        // Re-use walk/dash anim — burning rush charge
        id:          'burning_rush',
        name:        'Burning Rush',
        type:        'skill',
        emoji:       '💨',
        damage:      210,
        cooldown:    9000,
        energyCost:  35,
        energyGain:  5,
        range:       'close',
        knockback:   'medium',
        description: 'Ignites both fists and charges full-speed across the screen in a blazing tackle.',
        hitEffect:   'fire_dash',
        isDash:      true,
        dashDistance: 220,
        startup:     100,
        active:      300,
        recovery:    400,
      },
      {
        // Row 6 — full body firestorm: body engulfed, fire vortex explodes outward, 6 frames
        id:          'dragon_flare',
        name:        'Dragon Flare',
        type:        'ultimate',
        emoji:       '🐉',
        damage:      400,
        cooldown:    22000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Blaze\'s body becomes pure fire. A massive dragon-shaped flare erupts and engulfs everything.',
        hitEffect:   'fire_ultimate',
        isUltimate:  true,
        screenFlash: 'red',
        isAoe:       true,
        aoeRadius:   180,
        startup:     400,
        active:      600,
        recovery:    700,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 04 — VOLT
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(6f)  2=jump(3f — leap + ground smash landing)
  //   3=attack — lightning dash punch, 5 frames
  //   4=skill1 — lightning dash strike (teleport behind), 4 frames
  //   5=skill2 — chain lightning wave, 4 frames
  //   6=ultimate — electric field / boulder rain storm, 6 frames
  //   7=hit(3f)  8=knockdown(3f)  9=block(2f)
  //   10=victory(3f)  11=defeat(3f)
  // ─────────────────────────────────────────────
  volt: {
    id:          'volt',
    name:        'VOLT',
    element:     'Lightning',
    role:        'Speed',
    description: 'Lightning-fast fighter who overwhelms with rapid strikes and electric bursts. Hardest to catch.',
    unlockLevel: 3,
    isStarter:   false,
    emoji:       '⚡',
    color:       '#facc15',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(250,204,21,0.25) 0%, transparent 65%)',

    stats: {
      hp:        850,
      attack:    105,
      defense:   65,
      speed:     135,
      maxEnergy: 100,
    },
    displayStats: { hp: 5, energy: 7, speed: 9, attack: 7, defense: 4 },

    passive: {
      id:          'overcharge',
      name:        'OVERCHARGE',
      description: 'Every 3rd skill has a 20% chance to instantly reset its cooldown with a static discharge.',
      skillCounter:  0,
      triggerEvery:  3,
      cdReduction:   1.0,
      chance:        0.20,
    },

    skills: [
      {
        // Row 3 — lightning punch dash, 5 frames: rush forward → electric punch
        id:          'thunder_strike',
        name:        'Thunder Strike',
        type:        'basic',
        emoji:       '⚡',
        damage:      70,
        cooldown:    250,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'A blindingly fast electric punch that crackles with static on impact.',
        hitEffect:   'lightning_small',
        startup:     60,
        active:      100,
        recovery:    120,
      },
      {
        // Row 4 — lightning dash strike: dashes through enemy leaving afterimage, 4 frames
        id:          'flash_step',
        name:        'Flash Step',
        type:        'skill',
        emoji:       '💫',
        damage:      130,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'close',
        knockback:   'medium',
        description: 'Moves at lightning speed to dash through the enemy, leaving a trail of electric burns.',
        hitEffect:   'lightning_dash',
        isDash:      true,
        dashDistance: 220,
        teleport:    true,
        startup:     50,
        active:      150,
        recovery:    200,
      },
      {
        // Row 5 — chain lightning: extends fist, lightning arcs horizontally, 4 frames
        id:          'chain_lightning',
        name:        'Chain Lightning',
        type:        'skill',
        emoji:       '🌩️',
        damage:      175,
        cooldown:    6000,
        energyCost:  30,
        energyGain:  5,
        range:       'long',
        knockback:   'medium',
        description: 'Fires a massive arc of chain lightning that bounces and damages the enemy multiple times.',
        hitEffect:   'lightning_large',
        isProjectile: true,
        projectileSpeed: 14,
        startup:     150,
        active:      500,
        recovery:    300,
      },
      {
        // Jump anim (row 2) — ground slam: Volt leaps and crashes down with electric impact
        id:          'lightning_drop',
        name:        'Lightning Drop',
        type:        'skill',
        emoji:       '⬇️',
        damage:      200,
        cooldown:    9000,
        energyCost:  35,
        energyGain:  5,
        range:       'close',
        knockback:   'heavy',
        description: 'Leaps high into the air then crashes down with a devastating lightning ground slam.',
        hitEffect:   'lightning_medium',
        isAoe:       true,
        aoeRadius:   80,
        screenShake: true,
        startup:     200,
        active:      300,
        recovery:    400,
      },
      {
        // Row 6 — electric field + boulder storm: massive golden electric shockwave, 6 frames
        id:          'thunder_god',
        name:        'Thunder God',
        type:        'ultimate',
        emoji:       '⛈️',
        damage:      370,
        cooldown:    20000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Volt ascends and unleashes the full power of a thunder god — a catastrophic electric storm.',
        hitEffect:   'lightning_ultimate',
        isUltimate:  true,
        screenFlash: 'white',
        isAoe:       true,
        aoeRadius:   200,
        startup:     300,
        active:      600,
        recovery:    600,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 05 — LUNA
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(7f)  2=jump(3f)
  //   3=attack — moon orb swipe strike (4f)
  //   4=skill1 — crescent energy slash wave (4f)
  //   5=skill2 — moon beam projectile launch (5f)
  //   6=ultimate — full moonfall wave (6f)
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f)
  //   10=victory(3f)  11=defeat(3f)
  // ─────────────────────────────────────────────
  luna: {
    id:          'luna',
    name:        'LUNA',
    element:     'Moon',
    role:        'Magic',
    description: 'A mystical moon sorceress who regenerates energy passively and strikes with lunar magic.',
    unlockLevel: 4,
    isStarter:   false,
    emoji:       '🌙',
    color:       '#c084fc',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(192,132,252,0.25) 0%, transparent 65%)',

    stats: {
      hp:        950,
      attack:    110,
      defense:   75,
      speed:     95,
      maxEnergy: 120,
    },
    displayStats: { hp: 6, energy: 9, speed: 6, attack: 7, defense: 5 },

    passive: {
      id:          'moonlight',
      name:        'MOONLIGHT',
      description: 'Passively regenerates 3 energy every 2 seconds. Glowing moon orbs orbit Luna at max energy.',
      regenAmount:   3,
      regenInterval: 2000,
    },

    skills: [
      {
        // Row 3 — orb swipe: sweeps hand to launch close-range moon orb, 4 frames
        id:          'moon_strike',
        name:        'Moon Strike',
        type:        'basic',
        emoji:       '🌙',
        damage:      75,
        cooldown:    400,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'A graceful sweep that launches a close-range moon orb at the enemy.',
        hitEffect:   'moon_small',
        startup:     110,
        active:      130,
        recovery:    200,
      },
      {
        // Row 4 — crescent slash: sweeps arm in crescent arc releasing a wave, 4 frames
        id:          'crescent_slash',
        name:        'Crescent Slash',
        type:        'skill',
        emoji:       '🌛',
        damage:      140,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'medium',
        knockback:   'light',
        description: 'Slashes through the air releasing a crescent-shaped wave of moon energy.',
        hitEffect:   'moon_medium',
        isProjectile: true,
        projectileSpeed: 7,
        startup:     160,
        active:      700,
        recovery:    280,
      },
      {
        // Row 5 — moon beam: extends hand → fires a long beam of purple moon energy, 5 frames
        id:          'moon_beam',
        name:        'Moon Beam',
        type:        'skill',
        emoji:       '✨',
        damage:      170,
        cooldown:    7000,
        energyCost:  30,
        energyGain:  5,
        range:       'long',
        knockback:   'medium',
        description: 'Channels and fires a sustained beam of pure moonlight that pierces through defenses.',
        hitEffect:   'moon_beam',
        isProjectile: true,
        projectileSpeed: 9,
        startup:     200,
        active:      900,
        recovery:    350,
      },
      {
        // Block anim (row 9) — lunar shield forms: re-used as barrier skill
        id:          'lunar_shield',
        name:        'Lunar Shield',
        type:        'skill',
        emoji:       '🛡️',
        damage:      50,
        cooldown:    9000,
        energyCost:  25,
        energyGain:  5,
        range:       'close',
        knockback:   'light',
        description: 'Summons a radiant lunar shield that absorbs damage and reflects light energy at the enemy.',
        hitEffect:   'moon_shield',
        isBarrier:   true,
        barrierDuration: 4000,
        barrierAbsorb: 220,
        startup:     100,
        active:      300,
        recovery:    250,
      },
      {
        // Row 6 — moonfall wave: raises arms → giant moon forms → tidal wave of lunar energy, 6 frames
        id:          'moonfall',
        name:        'Moonfall',
        type:        'ultimate',
        emoji:       '🌕',
        damage:      340,
        cooldown:    20000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Summons a full moon above the arena and crashes it down as a devastating lunar tidal wave.',
        hitEffect:   'moon_ultimate',
        isUltimate:  true,
        screenFlash: 'white',
        isAoe:       true,
        aoeRadius:   200,
        startup:     350,
        active:      600,
        recovery:    650,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 06 — TERRA
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(6f)  2=jump(3f)
  //   3=attack — stone ground slam fist (5f)
  //   4=skill1 — rock spin smash (spinning boulder swing), 5f
  //   5=skill2 — earth spike eruption from ground, 5f
  //   6=ultimate — boulder barrage (rocks orbit then explode), 6f
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f, stone shield)
  //   10=victory(3f)  11=defeat(3f — curls into boulder)
  // ─────────────────────────────────────────────
  terra: {
    id:          'terra',
    name:        'TERRA',
    element:     'Earth',
    role:        'Tank',
    description: 'The ultimate tank. Stone skin, massive HP, and earth-shattering power. Near-impossible to knock down.',
    unlockLevel: 5,
    isStarter:   false,
    emoji:       '🪨',
    color:       '#84cc16',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(132,204,22,0.2) 0%, transparent 65%)',

    stats: {
      hp:        1400,
      attack:    100,
      defense:   130,
      speed:     65,
      maxEnergy: 100,
    },
    displayStats: { hp: 10, energy: 5, speed: 3, attack: 6, defense: 10 },

    passive: {
      id:          'earth_armor',
      name:        'EARTH ARMOR',
      description: 'Stone skin permanently reduces all incoming damage by 8%. Armor glows green when active.',
      damageReduction: 0.08,
    },

    skills: [
      {
        // Row 3 — stone fist ground slam: raises massive fist and slams down, 5 frames
        id:          'stone_slam',
        name:        'Stone Slam',
        type:        'basic',
        emoji:       '✊',
        damage:      90,
        cooldown:    500,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'medium',
        description: 'A crushing boulder fist slam that sends shockwaves through the ground on impact.',
        hitEffect:   'earth_small',
        startup:     150,
        active:      160,
        recovery:    260,
      },
      {
        // Row 4 — rock spin smash: spins body with boulder fists in wide arc, 5 frames
        id:          'rock_spin',
        name:        'Rock Spin',
        type:        'skill',
        emoji:       '🌀',
        damage:      160,
        cooldown:    5000,
        energyCost:  20,
        energyGain:  5,
        range:       'close',
        knockback:   'medium',
        description: 'Terra spins with both boulder fists extended, hitting anyone caught in the wide arc.',
        hitEffect:   'earth_medium',
        isAoe:       true,
        aoeRadius:   100,
        startup:     200,
        active:      350,
        recovery:    400,
      },
      {
        // Row 5 — earth spikes erupt: slams ground, sharp rock spikes erupt in a line, 5 frames
        id:          'earth_spikes',
        name:        'Earth Spikes',
        type:        'skill',
        emoji:       '🗻',
        damage:      195,
        cooldown:    8000,
        energyCost:  35,
        energyGain:  5,
        range:       'medium',
        knockback:   'heavy',
        description: 'Slams the earth to erupt a row of jagged rock spikes that impale the enemy.',
        hitEffect:   'earth_large',
        isAoe:       true,
        aoeRadius:   110,
        launchesEnemy: true,
        screenShake: true,
        startup:     300,
        active:      400,
        recovery:    500,
      },
      {
        // Block anim (row 9) — stone shield: re-used as defensive skill
        id:          'stone_wall',
        name:        'Stone Wall',
        type:        'skill',
        emoji:       '🏔️',
        damage:      50,
        cooldown:    10000,
        energyCost:  25,
        energyGain:  5,
        range:       'close',
        knockback:   'light',
        description: 'Raises a thick slab of stone as an impenetrable wall that blocks all incoming attacks.',
        hitEffect:   'earth_wall',
        isBarrier:   true,
        barrierDuration: 5000,
        barrierAbsorb: 350,
        startup:     200,
        active:      400,
        recovery:    300,
      },
      {
        // Row 6 — boulder barrage: rocks orbit Terra then explode outward in all directions, 6 frames
        id:          'meteor_crush',
        name:        'Boulder Barrage',
        type:        'ultimate',
        emoji:       '☄️',
        damage:      420,
        cooldown:    23000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Terra summons a storm of massive boulders that orbit and then explode outward in all directions.',
        hitEffect:   'earth_ultimate',
        isUltimate:  true,
        screenFlash: 'red',
        screenShake: true,
        isAoe:       true,
        aoeRadius:   220,
        startup:     500,
        active:      700,
        recovery:    800,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 07 — KAI
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(6f)  2=jump(4f)
  //   3=attack — blade slash combo (5f)
  //   4=skill1 — shadow dash blade strike (5f)
  //   5=skill2 — void blade sweep (wide arc slash), 5f
  //   6=ultimate — shadow explosion burst (6f)
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f)
  //   10=victory(4f — stands over phantom clones)
  //   11=defeat(3f)
  // ─────────────────────────────────────────────
  kai: {
    id:          'kai',
    name:        'KAI',
    element:     'Shadow',
    role:        'Assassin',
    description: 'A shadow ninja who strikes from blind spots with a purple blade. Disappears and reappears at will.',
    unlockLevel: 6,
    isStarter:   false,
    emoji:       '🥷',
    color:       '#818cf8',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(129,140,248,0.25) 0%, transparent 65%)',

    stats: {
      hp:        800,
      attack:    135,
      defense:   60,
      speed:     125,
      maxEnergy: 100,
    },
    displayStats: { hp: 5, energy: 6, speed: 8, attack: 9, defense: 3 },

    passive: {
      id:          'backstab',
      name:        'BACKSTAB',
      description: 'Attacks from behind the enemy deal 25% additional damage. Blade glows brighter on trigger.',
      bonusDamage:  0.25,
    },

    skills: [
      {
        // Row 3 — quick blade slash combo: two fast slashes with purple blade, 5 frames
        id:          'blade_slash',
        name:        'Blade Slash',
        type:        'basic',
        emoji:       '🗡️',
        damage:      100,
        cooldown:    300,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'A precise double slash with the shadow blade. Fast and can chain into other attacks.',
        hitEffect:   'shadow_small',
        startup:     80,
        active:      110,
        recovery:    160,
      },
      {
        // Row 4 — shadow dash strike: dashes forward leaving purple trail, slashes through, 5 frames
        id:          'shadow_dash',
        name:        'Shadow Dash',
        type:        'skill',
        emoji:       '🌑',
        damage:      150,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'close',
        knockback:   'medium',
        description: 'Vanishes into shadow and reappears behind the enemy with a devastating slash.',
        hitEffect:   'shadow_dash',
        isDash:      true,
        dashDistance: 200,
        teleport:    true,
        startup:     60,
        active:      200,
        recovery:    220,
      },
      {
        // Row 5 — void blade sweep: wide horizontal arc with massive blade, 5 frames
        id:          'void_sweep',
        name:        'Void Sweep',
        type:        'skill',
        emoji:       '🌀',
        damage:      185,
        cooldown:    7000,
        energyCost:  30,
        energyGain:  5,
        range:       'medium',
        knockback:   'heavy',
        description: 'Draws a massive void blade and sweeps it in a wide arc, cutting through everything.',
        hitEffect:   'shadow_medium',
        isAoe:       true,
        aoeRadius:   120,
        startup:     180,
        active:      300,
        recovery:    380,
      },
      {
        // Dark clone / phantom — brief invisibility before next strike
        id:          'phantom_step',
        name:        'Phantom Step',
        type:        'skill',
        emoji:       '👥',
        damage:      130,
        cooldown:    9000,
        energyCost:  35,
        energyGain:  5,
        range:       'close',
        knockback:   'medium',
        description: 'Creates a shadow clone decoy then instantly teleports to strike from a different angle.',
        hitEffect:   'shadow_large',
        isInvisible:  true,
        invisDuration: 800,
        isDash:       true,
        dashDistance: 160,
        startup:     120,
        active:      250,
        recovery:    350,
      },
      {
        // Row 6 — shadow explosion: purple energy erupts from body in massive burst, 6 frames
        id:          'nightmare',
        name:        'Shadow Burst',
        type:        'ultimate',
        emoji:       '💜',
        damage:      430,
        cooldown:    22000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Releases all shadow energy in a catastrophic purple explosion that consumes the entire arena.',
        hitEffect:   'shadow_ultimate',
        isUltimate:  true,
        screenFlash: 'red',
        isAoe:       true,
        aoeRadius:   200,
        startup:     350,
        active:      550,
        recovery:    700,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 08 — KIRA
  // Sheet rows observed:
  //   0=idle(4f)  1=walk(6f)  2=jump(3f)
  //   3=attack — wind kick combo (4f)
  //   4=skill1 — wind slash dash (dashes leaving green trail), 4f
  //   5=skill2 — wind spiral kick (spinning kick with wind ring), 5f
  //   6=ultimate — tornado storm (massive green cyclone), 6f
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f)
  //   10=victory(3f)  11=defeat(3f)
  // ─────────────────────────────────────────────
  kira: {
    id:          'kira',
    name:        'KIRA',
    element:     'Wind',
    role:        'Speed / Mobility',
    description: 'The fastest fighter in the arena. Every dodge boosts her speed further for relentless wind combos.',
    unlockLevel: 7,
    isStarter:   false,
    emoji:       '🌪️',
    color:       '#34d399',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(52,211,153,0.25) 0%, transparent 65%)',

    stats: {
      hp:        900,
      attack:    105,
      defense:   70,
      speed:     145,
      maxEnergy: 100,
    },
    displayStats: { hp: 6, energy: 6, speed: 10, attack: 7, defense: 4 },

    passive: {
      id:          'wind_step',
      name:        'WIND STEP',
      description: 'Successfully dodging an attack increases movement speed by 20% for 2 seconds.',
      speedBonus:  0.20,
      duration:    2000,
    },

    skills: [
      {
        // Row 3 — wind kick combo: two swift kicks leaving wind trails, 4 frames
        id:          'wind_kick',
        name:        'Wind Kick',
        type:        'basic',
        emoji:       '🦶',
        damage:      75,
        cooldown:    250,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'A razor-fast kick infused with wind energy. Fastest basic attack in the game.',
        hitEffect:   'wind_small',
        startup:     60,
        active:      100,
        recovery:    130,
      },
      {
        // Row 4 — wind slash dash: dashes forward leaving green slash trail, 4 frames
        id:          'wind_slash',
        name:        'Wind Slash',
        type:        'skill',
        emoji:       '🌿',
        damage:      135,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'medium',
        knockback:   'medium',
        description: 'Dashes forward with explosive wind speed, slashing through the enemy with a green wind blade.',
        hitEffect:   'wind_medium',
        isDash:      true,
        dashDistance: 200,
        startup:     80,
        active:      200,
        recovery:    220,
      },
      {
        // Row 5 — wind spiral kick: jumps into spinning kick surrounded by wind ring, 5 frames
        id:          'spiral_kick',
        name:        'Spiral Kick',
        type:        'skill',
        emoji:       '🌀',
        damage:      175,
        cooldown:    7000,
        energyCost:  30,
        energyGain:  5,
        range:       'close',
        knockback:   'heavy',
        description: 'Leaps and spins into a devastating spiral kick surrounded by a vortex of cutting wind.',
        hitEffect:   'wind_large',
        isAoe:       true,
        aoeRadius:   85,
        launchesEnemy: true,
        startup:     120,
        active:      350,
        recovery:    320,
      },
      {
        // Wind blade projectile variant
        id:          'air_blade',
        name:        'Air Blade',
        type:        'skill',
        emoji:       '💨',
        damage:      155,
        cooldown:    9000,
        energyCost:  35,
        energyGain:  5,
        range:       'long',
        knockback:   'medium',
        description: 'Compresses wind into a thin invisible blade and fires it at high velocity across the arena.',
        hitEffect:   'wind_blade',
        isProjectile: true,
        projectileSpeed: 13,
        startup:     100,
        active:      600,
        recovery:    280,
      },
      {
        // Row 6 — tornado storm: massive green cyclone erupts from ground, 6 frames
        id:          'storm_dance',
        name:        'Storm Dance',
        type:        'ultimate',
        emoji:       '⛈️',
        damage:      360,
        cooldown:    20000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Kira spins at max speed to conjure a massive green tornado that tears through the battlefield.',
        hitEffect:   'wind_ultimate',
        isUltimate:  true,
        screenFlash: 'white',
        isAoe:       true,
        aoeRadius:   200,
        startup:     300,
        active:      500,
        recovery:    600,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 09 — SHADOW
  // Sheet rows observed:
  //   0=idle(4f — hovering, dark tendrils)
  //   1=walk(5f — gliding with trench coat)
  //   2=jump(3f)
  //   3=attack — dark orb flick strike (4f)
  //   4=skill1 — dark beam: extends hand → fires purple beam, 4f
  //   5=skill2 — void dash claw: lunges forward in claw pose, 5f
  //   6=ultimate — dark vortex: black hole opens then explodes, 6f
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f)
  //   10=victory(4f — dark energy swirls in victory pose)
  //   11=defeat(3f)
  // ─────────────────────────────────────────────
  shadow: {
    id:          'shadow',
    name:        'SHADOW',
    element:     'Dark',
    role:        'Critical / Assassin',
    description: 'A dark entity born from the void. Every strike carries a chance for catastrophic critical damage.',
    unlockLevel: 8,
    isStarter:   false,
    emoji:       '👻',
    color:       '#a78bfa',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(167,139,250,0.25) 0%, transparent 65%)',

    stats: {
      hp:        850,
      attack:    145,
      defense:   65,
      speed:     120,
      maxEnergy: 100,
    },
    displayStats: { hp: 5, energy: 6, speed: 8, attack: 10, defense: 4 },

    passive: {
      id:          'dark_critical',
      name:        'DARK CRITICAL',
      description: 'All attacks have a 15% chance to deal 1.8x damage. Eyes flash white when triggered.',
      critChance:  0.15,
      critMulti:   1.8,
    },

    skills: [
      {
        // Row 3 — dark orb flick: raises hand and flicks a dark energy orb at close range, 4 frames
        id:          'dark_orb',
        name:        'Dark Orb',
        type:        'basic',
        emoji:       '🌑',
        damage:      105,
        cooldown:    300,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'light',
        description: 'Materializes a dark energy orb and flicks it at the enemy with void-infused force.',
        hitEffect:   'dark_small',
        startup:     80,
        active:      110,
        recovery:    160,
      },
      {
        // Row 4 — dark beam: extends hand, fires a sustained purple energy beam, 4 frames
        id:          'dark_beam',
        name:        'Dark Beam',
        type:        'skill',
        emoji:       '🔮',
        damage:      160,
        cooldown:    4000,
        energyCost:  20,
        energyGain:  5,
        range:       'long',
        knockback:   'medium',
        description: 'Extends a hand and fires a piercing beam of concentrated dark energy across the arena.',
        hitEffect:   'dark_medium',
        isProjectile: true,
        projectileSpeed: 8,
        startup:     160,
        active:      900,
        recovery:    300,
      },
      {
        // Row 5 — void dash claw: lunges forward in predatory claw pose, 5 frames
        id:          'void_claw',
        name:        'Void Claw',
        type:        'skill',
        emoji:       '🌀',
        damage:      170,
        cooldown:    6000,
        energyCost:  30,
        energyGain:  5,
        range:       'close',
        knockback:   'medium',
        description: 'Shadow dissolves into void and lunges forward with outstretched dark claws.',
        hitEffect:   'dark_dash',
        isDash:      true,
        dashDistance: 200,
        teleport:    true,
        startup:     50,
        active:      200,
        recovery:    200,
      },
      {
        // Victory anim inspiration — dark tendrils wrap enemy
        id:          'soul_drain',
        name:        'Soul Drain',
        type:        'skill',
        emoji:       '💀',
        damage:      210,
        cooldown:    10000,
        energyCost:  40,
        energyGain:  5,
        range:       'close',
        knockback:   'heavy',
        description: 'Reaches into the enemy\'s chest with dark tendrils to drain their soul, healing Shadow slightly.',
        hitEffect:   'dark_large',
        healsUser:   true,
        healAmount:  80,
        startup:     250,
        active:      350,
        recovery:    500,
      },
      {
        // Row 6 — dark vortex: black hole opens, dark matter swirls, then explodes outward, 6 frames
        id:          'eternal_darkness',
        name:        'Dark Vortex',
        type:        'ultimate',
        emoji:       '🕳️',
        damage:      460,
        cooldown:    23000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Opens a black hole that pulls the enemy in, then detonates in a cataclysmic dark matter explosion.',
        hitEffect:   'dark_ultimate',
        isUltimate:  true,
        screenFlash: 'red',
        isAoe:       true,
        aoeRadius:   200,
        startup:     400,
        active:      700,
        recovery:    750,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CHARACTER 10 — INFERNO
  // Sheet rows observed (large sprites, fewer frames):
  //   0=idle(3f)  1=walk(4f)  2=jump(2f)
  //   3=attack — magma fist punch (3f)
  //   4=skill1 — lava wing slam (3f — fire wings spread then slam)
  //   5=skill2 — hellfire rain (4f — raises arms, pillars of fire fall)
  //   6=ultimate — volcanic eruption (4f — full body lava explosion with wings)
  //   7=hit(2f)  8=knockdown(3f)  9=block(2f)
  //   10=victory(2f)  11=defeat(2f — collapses into lava pile)
  // ─────────────────────────────────────────────
  inferno: {
    id:          'inferno',
    name:        'INFERNO',
    element:     'Ultimate Fire',
    role:        'Boss / Power',
    description: 'The final boss. A volcanic titan clad in magma armor with fire wings. Near death makes him lethal.',
    unlockLevel: 9,
    isStarter:   false,
    emoji:       '🌋',
    color:       '#dc2626',
    bgGradient:  'radial-gradient(ellipse at 50% 30%, rgba(220,38,38,0.3) 0%, transparent 65%)',

    stats: {
      hp:        1500,
      attack:    150,
      defense:   100,
      speed:     90,
      maxEnergy: 120,
    },
    displayStats: { hp: 10, energy: 8, speed: 6, attack: 10, defense: 7 },

    passive: {
      id:          'inferno_core',
      name:        'INFERNO CORE',
      description: 'When HP drops below 30%, fire wings fully ignite and attack increases by 25%.',
      threshold:   0.30,
      attackBonus: 0.25,
    },

    skills: [
      {
        // Row 3 — magma fist punch: rears back and delivers a single crushing lava punch, 3 frames
        id:          'magma_fist',
        name:        'Magma Fist',
        type:        'basic',
        emoji:       '🌋',
        damage:      110,
        cooldown:    400,
        energyCost:  0,
        energyGain:  8,
        range:       'close',
        knockback:   'medium',
        description: 'A devastating punch with a volcanic rock fist dripping with molten magma.',
        hitEffect:   'fire_small',
        startup:     120,
        active:      150,
        recovery:    220,
      },
      {
        // Row 4 — lava wing slam: fire wings spread wide then crash down on enemy, 3 frames
        id:          'wing_slam',
        name:        'Wing Slam',
        type:        'skill',
        emoji:       '🔥',
        damage:      190,
        cooldown:    5000,
        energyCost:  20,
        energyGain:  5,
        range:       'medium',
        knockback:   'heavy',
        description: 'Spreads massive fire wings and crashes them down, creating a shockwave of molten rock.',
        hitEffect:   'fire_medium',
        isAoe:       true,
        aoeRadius:   120,
        screenShake: true,
        startup:     200,
        active:      300,
        recovery:    400,
      },
      {
        // Row 5 — hellfire rain: raises arms, columns of fire rain down from above, 4 frames
        id:          'hellfire_rain',
        name:        'Hellfire Rain',
        type:        'skill',
        emoji:       '☄️',
        damage:      240,
        cooldown:    8000,
        energyCost:  35,
        energyGain:  5,
        range:       'medium',
        knockback:   'heavy',
        description: 'Raises volcanic arms to the sky, calling down a rain of hellfire columns on the enemy.',
        hitEffect:   'fire_large',
        isAoe:       true,
        aoeRadius:   130,
        screenShake: true,
        startup:     300,
        active:      500,
        recovery:    500,
      },
      {
        // Magma projectile — launches lava ball
        id:          'magma_shot',
        name:        'Magma Shot',
        type:        'skill',
        emoji:       '💧',
        damage:      200,
        cooldown:    10000,
        energyCost:  30,
        energyGain:  5,
        range:       'long',
        knockback:   'medium',
        description: 'Hurls a superheated ball of molten magma that explodes on contact.',
        hitEffect:   'fire_medium',
        isProjectile: true,
        projectileSpeed: 6,
        isAoe:       true,
        aoeRadius:   70,
        startup:     250,
        active:      600,
        recovery:    400,
      },
      {
        // Row 6 — volcanic eruption: entire body becomes a volcano, fire wings explode, 4 frames
        id:          'world_burn',
        name:        'World Burn',
        type:        'ultimate',
        emoji:       '☀️',
        damage:      500,
        cooldown:    25000,
        energyCost:  100,
        energyGain:  5,
        range:       'long',
        knockback:   'heavy',
        description: 'Inferno becomes a living volcano. Fire wings ignite fully as a catastrophic eruption obliterates everything.',
        hitEffect:   'fire_ultimate',
        isUltimate:  true,
        screenFlash: 'red',
        screenShake: true,
        isAoe:       true,
        aoeRadius:   250,
        startup:     600,
        active:      700,
        recovery:    900,
      },
    ],
  },

}; // end CHARACTERS

// ─────────────────────────────────────────────────────────────
// CHARACTER ROSTER ORDER (matches wireframe Panel 7 & Panel 15)
// ─────────────────────────────────────────────────────────────
const CHARACTER_ORDER = [
  'ember', 'frost', 'blaze', 'kira', 'kai',    // Row 1
  'shadow', 'terra', 'volt', 'luna', 'inferno'  // Row 2
];

// Unlock chain order:
// ember(start)→frost(1)→blaze(2)→volt(3)→luna(4)→terra(5)→kai(6)→kira(7)→shadow(8)→inferno(9)

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getCharacter(id) {
  return CHARACTERS[id] || null;
}

function getAllCharacters() {
  return CHARACTER_ORDER.map(id => CHARACTERS[id]).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────
// DAMAGE FORMULA (Master Spec)
// finalDamage = baseDamage * (attackerAttack/100) * (100/(100+defenderDefense))
// ─────────────────────────────────────────────────────────────
function calcDamage(baseDamage, attackerAttack, defenderDefense, options = {}) {
  let dmg = baseDamage * (attackerAttack / 100) * (100 / (100 + defenderDefense));

  if (options.isCritical)        dmg *= (options.critMultiplier || 1.5);
  if (options.passiveMultiplier) dmg *= options.passiveMultiplier;

  if (options.isBlocking) {
    const baseReduction  = options.isPerfectBlock ? 0.90 : 0.65;
    const extraReduction = options.extraBlockReduction || 0;
    const totalReduction = Math.min(baseReduction + extraReduction, 0.95);
    dmg *= (1 - totalReduction);
  }

  return Math.max(1, Math.round(dmg));
}

// ─────────────────────────────────────────────────────────────
// ELEMENT COLOR MAP
// ─────────────────────────────────────────────────────────────
const ELEMENT_COLORS = {
  'Fire':          '#ff6b2b',
  'Ice':           '#7dd3fc',
  'Lightning':     '#facc15',
  'Wind':          '#86efac',
  'Moon':          '#c4b5fd',
  'Earth':         '#a8a29e',
  'Shadow':        '#a78bfa',
  'Dark':          '#a78bfa',
  'Ultimate Fire': '#dc2626',
};
