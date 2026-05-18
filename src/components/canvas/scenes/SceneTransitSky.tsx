import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../../../lib/palette";

/**
 * Beat 2 shell — placeholder for the upward-soar-through-clouds transit.
 * A few floating cloud-tinted spheres sketch the volume; real volumetric
 * clouds and camera motion arrive later.
 */
export default function SceneTransitSky() {
  const clouds = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (clouds.current) {
      clouds.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 1.2;
    }
  });

  return (
    <group ref={clouds}>
      {[-30, -10, 12, 28].map((x, i) => (
        <mesh key={i} position={[x, -2 + i * 1.4, -50 - i * 8]}>
          <sphereGeometry args={[6 + i * 0.6, 16, 12]} />
          <meshBasicMaterial color={palette.skyWarmHaze} transparent opacity={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0, -120]}>
        <planeGeometry args={[400, 200]} />
        <meshBasicMaterial color={palette.skyWarmMid} />
      </mesh>
    </group>
  );
}
