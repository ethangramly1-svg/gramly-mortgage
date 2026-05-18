import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScroll } from "../../lib/scroll";
import { getBeat } from "../../lib/pageBounds";

/**
 * Mounts its children inside a `<group>` and toggles `visible` based on
 * whether the current scroll beat matches `index`. Toggling via ref avoids
 * the per-frame React re-render that `useState` would cause.
 *
 * Once scroll passes the cinematic (BEAT_COUNT × 100vh), every gate hides
 * so the warm-light site sections own the viewport visually.
 */
export default function BeatGate({
  index,
  children
}: {
  index: number;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const { scrollY, vh } = getScroll();
    const beat = getBeat(scrollY, vh);
    group.current.visible = beat.cinematic && beat.index === index;
  });

  return <group ref={group}>{children}</group>;
}
