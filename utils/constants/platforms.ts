/**
 * platforms
 *
 * RAWG platform ID mappings and groupings.
 * Provides human-readable names and family groupings for all major gaming platforms.
 *
 * Platform IDs sourced from: https://rawg.io/apidocs#tag/platforms
 */

/**
 * Numeric RAWG platform IDs for all major platforms.
 */
export const PLATFORM_IDS = {
  PC: 4,
  PS5: 187,
  PS4: 18,
  PS3: 16,
  PS2: 15,
  PS1: 27,
  XBOX_SERIES: 186,
  XBOX_ONE: 1,
  XBOX_360: 14,
  XBOX: 80,
  NINTENDO_SWITCH: 7,
  WII_U: 10,
  WII: 11,
  GAMECUBE: 105,
  N64: 83,
  GAME_BOY_ADVANCE: 24,
  NDS: 9,
  N3DS: 8,
  ANDROID: 21,
  IOS: 3,
  MACOS: 5,
  LINUX: 6,
} as const;

/**
 * Maps RAWG platform IDs to their human-readable display names.
 */
export const PLATFORM_DISPLAY_NAMES: Record<number, string> = {
  [PLATFORM_IDS.PC]: 'PC',
  [PLATFORM_IDS.PS5]: 'PS5',
  [PLATFORM_IDS.PS4]: 'PS4',
  [PLATFORM_IDS.PS3]: 'PS3',
  [PLATFORM_IDS.PS2]: 'PS2',
  [PLATFORM_IDS.PS1]: 'PS1',
  [PLATFORM_IDS.XBOX_SERIES]: 'Xbox Series',
  [PLATFORM_IDS.XBOX_ONE]: 'Xbox One',
  [PLATFORM_IDS.XBOX_360]: 'Xbox 360',
  [PLATFORM_IDS.XBOX]: 'Xbox',
  [PLATFORM_IDS.NINTENDO_SWITCH]: 'Switch',
  [PLATFORM_IDS.WII_U]: 'Wii U',
  [PLATFORM_IDS.WII]: 'Wii',
  [PLATFORM_IDS.GAMECUBE]: 'GameCube',
  [PLATFORM_IDS.N64]: 'N64',
  [PLATFORM_IDS.GAME_BOY_ADVANCE]: 'GBA',
  [PLATFORM_IDS.NDS]: 'DS',
  [PLATFORM_IDS.N3DS]: '3DS',
  [PLATFORM_IDS.ANDROID]: 'Android',
  [PLATFORM_IDS.IOS]: 'iOS',
  [PLATFORM_IDS.MACOS]: 'macOS',
  [PLATFORM_IDS.LINUX]: 'Linux',
};

/**
 * Groups platform IDs by manufacturer/family for condensed label generation.
 * Used by `formatPlatformLabels` to produce labels like "PS 3/4/5".
 */
export const PLATFORM_FAMILIES: Record<string, number[]> = {
  PlayStation: [
    PLATFORM_IDS.PS5,
    PLATFORM_IDS.PS4,
    PLATFORM_IDS.PS3,
    PLATFORM_IDS.PS2,
    PLATFORM_IDS.PS1,
  ],
  Xbox: [
    PLATFORM_IDS.XBOX_SERIES,
    PLATFORM_IDS.XBOX_ONE,
    PLATFORM_IDS.XBOX_360,
    PLATFORM_IDS.XBOX,
  ],
  Nintendo: [
    PLATFORM_IDS.NINTENDO_SWITCH,
    PLATFORM_IDS.WII_U,
    PLATFORM_IDS.WII,
    PLATFORM_IDS.GAMECUBE,
    PLATFORM_IDS.N64,
    PLATFORM_IDS.GAME_BOY_ADVANCE,
    PLATFORM_IDS.NDS,
    PLATFORM_IDS.N3DS,
  ],
  Mobile: [PLATFORM_IDS.ANDROID, PLATFORM_IDS.IOS],
  Desktop: [PLATFORM_IDS.PC, PLATFORM_IDS.MACOS, PLATFORM_IDS.LINUX],
};
