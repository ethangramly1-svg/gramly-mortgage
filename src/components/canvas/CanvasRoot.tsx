import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import SceneSky from "./scenes/SceneSky";
import ScenePenthouseInterior from "./scenes/ScenePenthouseInterior";
import SceneTransitSky from "./scenes/SceneTransitSky";
import ScenePenthouseFinale from "./scenes/ScenePenthouseFinale";
import BeatGate from "./BeatGate";

const CA_OFFSET = new THREE.Vector2(0.001, 0.001);

/**
 * Single, fixed-position <Canvas> for the entire site. Hosts the four
 * cinematic beats, each wrapped in a BeatGate so only the active beat is
 * visible. See `lib/pageBounds.ts` for beat indexes.
 */
export default function CanvasRoot() {
  return (
    <div id="canvas-root">
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true
        }}
        camera={{ position: [0, 200, 0], fov: 38, near: 0.1, far: 1200 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <Suspense fallback={null}>
          <BeatGate index={0}>
            <SceneSky />
          </BeatGate>
          <BeatGate index={1}>
            <ScenePenthouseInterior />
          </BeatGate>
          <BeatGate index={2}>
            <SceneTransitSky />
          </BeatGate>
          <BeatGate index={3}>
            <ScenePenthouseFinale />
          </BeatGate>
        </Suspense>

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.7} luminanceThreshold={0.5} luminanceSmoothing={0.05} mipmapBlur />
          <ChromaticAberration offset={CA_OFFSET} blendFunction={BlendFunction.NORMAL} radialModulation={false} modulationOffset={0} />
          <Vignette darkness={0.8} offset={0.5} blendFunction={BlendFunction.NORMAL} />
          <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
