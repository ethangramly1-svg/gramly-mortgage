/**
 * The cinematic experience plays across 4 beats, each occupying 100vh
 * of pinned scroll inside the hero-spacer. Beat indexes:
 *
 *   0 — Sky approach:        user in sky, first white penthouse comes into view
 *   1 — Penthouse interior:  camera glides through gold-trimmed interior
 *   2 — Transit sky:         exit, soar upward through golden clouds
 *   3 — Penthouse finale:    descend to face second penthouse on a cliff
 *
 * Global cinematic progress = scrollY / (BEAT_COUNT * vh), clamped [0, 1].
 * Each scene reads `getBeat()` in `useFrame` and self-hides via
 * `group.visible` when it isn't the active beat.
 */

import { clamp01 } from "./scroll";

export const BEAT_COUNT = 4;
export const VH_PER_BEAT = 1;

export type Beat = {
  /** Active beat index, clamped 0..BEAT_COUNT-1. */
  index: number;
  /** 0..1 progress within the active beat. */
  localProgress: number;
  /** 0..1 progress across the entire cinematic. */
  journeyProgress: number;
  /** False once we've scrolled past the cinematic into the warm-light site. */
  cinematic: boolean;
};

export function getBeat(scrollY: number, vh: number): Beat {
  const vhSafe = Math.max(vh, 1);
  const t = scrollY / vhSafe;
  const cinematic = t < BEAT_COUNT;
  const journeyProgress = clamp01(t / BEAT_COUNT);
  const indexRaw = Math.floor(t);
  const index =
    indexRaw < 0 ? 0 : indexRaw >= BEAT_COUNT ? BEAT_COUNT - 1 : indexRaw;
  const localProgress = clamp01(t - index);
  return { index, localProgress, journeyProgress, cinematic };
}

/**
 * Back-compat shim for SceneSky, which was written when the cinematic was
 * a single beat. While we're in beat 0 it behaves identically; past beat 0
 * it returns 1 so SceneSky stays at its end-state until the BeatGate hides it.
 */
export function sceneSkyLocalProgress(globalScrollY: number, vh: number): number {
  const b = getBeat(globalScrollY, vh);
  return b.index === 0 ? b.localProgress : 1;
}
