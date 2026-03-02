/**
 * platformFormatter
 *
 * Converts arrays of RAWG platform IDs to condensed human-readable labels.
 * For example, IDs for PS3, PS4 and PS5 are collapsed into a single "PS 3/4/5" label.
 */

import { PLATFORM_IDS, PLATFORM_DISPLAY_NAMES } from '../constants/platforms';

/** Short generation suffixes used to build condensed PlayStation labels. */
const PS_GENS: Record<number, string> = {
  [PLATFORM_IDS.PS1]: '1',
  [PLATFORM_IDS.PS2]: '2',
  [PLATFORM_IDS.PS3]: '3',
  [PLATFORM_IDS.PS4]: '4',
  [PLATFORM_IDS.PS5]: '5',
};

/** Short generation suffixes used to build condensed Xbox labels. */
const XBOX_GENS: Record<number, string> = {
  [PLATFORM_IDS.XBOX]: 'OG',
  [PLATFORM_IDS.XBOX_360]: '360',
  [PLATFORM_IDS.XBOX_ONE]: 'One',
  [PLATFORM_IDS.XBOX_SERIES]: 'Series',
};

/**
 * Converts an array of RAWG platform IDs to condensed display labels.
 *
 * PlayStation and Xbox platforms with multiple generations present are merged into
 * a single label (e.g. `"PS 3/4/5"`, `"Xbox One/Series"`). All other platforms
 * use their full display name from `PLATFORM_DISPLAY_NAMES`.
 *
 * @param platformIds - Array of RAWG numeric platform IDs
 * @returns Array of condensed label strings ready for display
 *
 * @example
 * ```typescript
 * formatPlatformLabels([4, 187, 18, 16]); // ['PC', 'PS 3/4/5']
 * formatPlatformLabels([1, 186]);          // ['Xbox One/Series']
 * ```
 */
export function formatPlatformLabels(platformIds: number[]): string[] {
  const idSet = new Set(platformIds);
  const labels: string[] = [];
  const consumed = new Set<number>();

  // Collapse PlayStation generations
  const psGens = Object.entries(PS_GENS)
    .filter(([id]) => idSet.has(Number(id)))
    .map(([, gen]) => gen);
  if (psGens.length > 1) {
    Object.keys(PS_GENS).forEach((id) => consumed.add(Number(id)));
    labels.push(`PS ${psGens.join('/')}`);
  }

  // Collapse Xbox generations
  const xboxGens = Object.entries(XBOX_GENS)
    .filter(([id]) => idSet.has(Number(id)))
    .map(([, gen]) => gen);
  if (xboxGens.length > 1) {
    Object.keys(XBOX_GENS).forEach((id) => consumed.add(Number(id)));
    labels.push(`Xbox ${xboxGens.join('/')}`);
  }

  // Add remaining platforms using their display names
  for (const id of platformIds) {
    if (!consumed.has(id)) {
      labels.push(PLATFORM_DISPLAY_NAMES[id] ?? `Platform ${id}`);
    }
  }

  return labels;
}
