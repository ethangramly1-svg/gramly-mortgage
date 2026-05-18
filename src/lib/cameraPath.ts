/**
 * Camera waypoints for the four-beat cinematic.
 *
 * Each beat owns a (start, end) pose pair; `CameraController` cubic-eases
 * between them based on the beat's local scroll progress. Beats are
 * gated (only one is visible at a time), so the camera can teleport
 * between beats at the boundary — pose continuity across beats is a
 * nice-to-have, not a requirement.
 *
 * Coordinate notes:
 * - Beat 0: world coords inherited from SceneSky's original rail so the
 *   sky/clouds/particles still frame correctly.
 * - Beats 1–3: shells live in their own local origin, so poses are
 *   sized to the shell geometry in
 *   `components/canvas/scenes/ScenePenthouse*.tsx` and `SceneTransitSky.tsx`.
 *
 * Values are a starting point; tune in-browser once we can scroll the
 * journey end-to-end.
 */

export type Vec3 = readonly [number, number, number];

export type CameraPose = {
  position: Vec3;
  lookAt: Vec3;
};

export type BeatCamera = {
  start: CameraPose;
  end: CameraPose;
};

export const CAMERA_PATH: readonly BeatCamera[] = [
  {
    start: { position: [0, 200, 0],  lookAt: [0, 150, -200] },
    end:   { position: [0, 80,  30], lookAt: [0, 30,  -150] }
  },
  {
    start: { position: [0, 0,  -10], lookAt: [0, 0,   -50]  },
    end:   { position: [0, 0,  -50], lookAt: [0, 0,  -100]  }
  },
  {
    start: { position: [0, 0,  -30], lookAt: [0, 10,  -80]  },
    end:   { position: [0, 35, -20], lookAt: [0, 8,   -60]  }
  },
  {
    start: { position: [0, 30,  15], lookAt: [0, 6,   -60]  },
    end:   { position: [0, 8,  -15], lookAt: [0, 6,   -60]  }
  }
];
