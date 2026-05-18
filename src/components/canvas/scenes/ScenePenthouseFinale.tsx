import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../../../lib/palette";

/**
 * Beat 3 shell — placeholder for the second white penthouse perched on a
 * cliff above an infinity pool. Real geometry, cliff, pool, and approach
 * camera land in a later step.
 */
export default function ScenePenthouseFinale() {
  const tower = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (tower.current) {
      tower.current.rotation.y = Math.sin(clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <group ref={tower} position={[0, 0, -60]}>
      <mesh position={[0, -10, 0]}>
        <boxGeometry args={[80, 4, 80]} />
        <meshBasicMaterial color={palette.creamDeep} />
      </mesh>
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[28, 26, 22]} />
        <meshBasicMaterial color={palette.marbleWhite} wireframe />
      </mesh>
      <mesh position={[18, -7.6, 0]}>
        <planeGeometry args={[24, 12]} />
        <meshBasicMaterial color={palette.goldGlow} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
