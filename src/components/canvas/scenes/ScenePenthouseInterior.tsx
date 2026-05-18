import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../../../lib/palette";

/**
 * Beat 1 shell — placeholder geometry for the gold-trimmed penthouse interior.
 * Real geometry lands in a later step; this exists so the BeatGate has
 * something to mount and we can verify the scroll wiring.
 */
export default function ScenePenthouseInterior() {
  const room = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (room.current) {
      room.current.rotation.y = clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={room} position={[0, 0, -40]}>
      <mesh>
        <boxGeometry args={[40, 22, 28]} />
        <meshBasicMaterial color={palette.marbleWhite} wireframe />
      </mesh>
      <mesh position={[0, -11, 0]}>
        <boxGeometry args={[36, 0.4, 24]} />
        <meshBasicMaterial color={palette.goldGlow} />
      </mesh>
      <mesh position={[0, 10.5, 0]}>
        <boxGeometry args={[10, 0.3, 10]} />
        <meshBasicMaterial color={palette.goldDeep} />
      </mesh>
    </group>
  );
}
