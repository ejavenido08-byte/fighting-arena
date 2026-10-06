FIGHTING ARENA — BACKGROUND IMAGE FILES
========================================

Place your background image files in THIS folder.
The game will automatically detect and use them.


REQUIRED FILENAMES (exact — case sensitive):
=============================================

BATTLE ARENA BACKGROUNDS:
--------------------------
arena_bg.png           ← Default background (used if no level-specific one found)

LEVEL-SPECIFIC BACKGROUNDS (optional — overrides arena_bg.png per level):
--------------------------------------------------------------------------
level1_bg.png          → Level 1: The First Flame (Stone arena)
level2_bg.png          → Level 2: Burning Rival (Fire arena)
level3_bg.png          → Level 3: Thunder Trial (Storm arena)
level4_bg.png          → Level 4: Moonlit Arena (Moon arena)
level5_bg.png          → Level 5: Earth Guardian (Ancient ruins)
level6_bg.png          → Level 6: Shadow Assassin (Dark arena)
level7_bg.png          → Level 7: Eye of the Storm (Wind arena)
level8_bg.png          → Level 8: Dark Challenger (Shadow realm)
level9_bg.png          → Level 9: The Inferno (Volcano arena)
level10_bg.png         → Level 10: Final Arena (Apocalyptic arena)

CUTSCENE BACKGROUNDS (optional):
---------------------------------
cutscene_bg.png        ← Default cutscene background
level1_cutscene.png    → Cutscene background for Level 1
level2_cutscene.png    → Cutscene background for Level 2
level3_cutscene.png    → Cutscene background for Level 3
level4_cutscene.png    → Cutscene background for Level 4
level5_cutscene.png    → Cutscene background for Level 5
level6_cutscene.png    → Cutscene background for Level 6
level7_cutscene.png    → Cutscene background for Level 7
level8_cutscene.png    → Cutscene background for Level 8
level9_cutscene.png    → Cutscene background for Level 9
level10_cutscene.png   → Cutscene background for Level 10

MENU BACKGROUND (optional):
----------------------------
menu_bg.png            ← Main menu background image


IMAGE FORMAT REQUIREMENTS:
===========================
Format         : PNG or JPEG (both work)
Recommended size: 1920 x 1080 pixels (Full HD)
Minimum size   : 800 x 600 pixels
Orientation    : Landscape (horizontal) — VERY IMPORTANT
Transparency   : Not needed (full image)


WHAT TO GENERATE IN DOLA AI / GEMINI:
======================================

ARENA BACKGROUND (arena_bg.png):
---------------------------------
2D fighting game arena background.
Dark fantasy arena, ancient stone floor with cracks,
large stone pillars on both sides, torches burning on the walls,
dramatic orange and red lighting from torches,
crowd silhouettes visible in the background stands.
Wide horizontal format 1920x1080.
No characters. No text. Background scene only.
Dark atmospheric colors — deep navy, dark stone grey, warm torch orange.

FIRE ARENA (level2_bg.png):
-----------------------------
2D fighting game arena background.
Fire arena, ground covered in lava cracks glowing orange-red,
fire pillars on the sides, volcanic sky in the background,
embers and sparks flying upward.
Wide horizontal format 1920x1080. No characters. No text.

STORM ARENA (level3_bg.png):
------------------------------
2D fighting game arena background.
Storm arena, dark stormy sky with lightning flashing,
rain pouring down, stone arena floor wet and reflective,
electric blue and grey colors.
Wide horizontal format 1920x1080. No characters. No text.

MOON ARENA (level4_bg.png):
-----------------------------
2D fighting game arena background.
Moon arena at night, full moon in the sky,
stone arena floor with silver-purple glow,
mystical floating crystals in the background,
dark navy and purple colors.
Wide horizontal format 1920x1080. No characters. No text.

ANCIENT RUINS (level5_bg.png):
--------------------------------
2D fighting game arena background.
Ancient ruins arena, broken stone columns,
vines and moss on the walls, green earth energy glowing
through the ground cracks, forest visible in the background.
Wide horizontal format 1920x1080. No characters. No text.

SHADOW ARENA (level6_bg.png / level8_bg.png):
----------------------------------------------
2D fighting game arena background.
Dark shadow arena, near complete darkness,
purple shadow energy swirling in the background,
faint outline of stone walls barely visible.
Wide horizontal format 1920x1080. No characters. No text.

WIND ARENA (level7_bg.png):
-----------------------------
2D fighting game arena background.
Wind arena in the sky, floating stone platforms,
dramatic wind currents visible as light streaks,
cloudy sky background, green and white colors.
Wide horizontal format 1920x1080. No characters. No text.

VOLCANO ARENA (level9_bg.png):
--------------------------------
2D fighting game arena background.
Volcanic arena, active volcano erupting in the background,
lava rivers on the sides, smoke and ash in the air,
ground is cracked stone with glowing lava underneath.
Wide horizontal format 1920x1080. No characters. No text.

FINAL ARENA (level10_bg.png):
-------------------------------
2D fighting game arena background.
Apocalyptic final arena, sky is on fire with red and orange,
massive cracks in the ground with lava showing,
crumbling ancient stone structures on both sides,
the most dramatic and intense background of all levels.
Wide horizontal format 1920x1080. No characters. No text.


HOW THE GAME USES THESE FILES:
================================
1. When a battle starts, the game checks for level1_bg.png, level2_bg.png, etc.
2. If the level-specific file is found, it uses that as the arena background.
3. If NOT found, it uses arena_bg.png as the default.
4. If arena_bg.png is also not found, the game draws a procedural dark arena background automatically.
5. You do NOT need all files — add them one at a time as you create them.


NOTES:
======
- JPEG files also work — just rename to .jpg extension
- Higher resolution = better quality but larger file size
- PNG is better for images with sharp edges
- JPEG is better for photo-realistic AI-generated backgrounds
- The game will work perfectly fine without any background files
