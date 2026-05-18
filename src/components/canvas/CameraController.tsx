import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getScroll, easeInOutCubic } from "../../lib/scroll";
import { getBeat } from "../../lib/pageBounds";
import { CAMERA_PATH, type Vec3 } from "../../lib/cameraPath";

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const startPos = new THREE.Vector3();
const endPos = new THREE.Vector3();
const startLook = new THREE.Vector3();
const endLook = new THREE.Vector3();

function setFromTuple(v: THREE.Vector3, t: Vec3) {
  v.set(t[0], t[1], t[2]);
}

/**
 * Owns the camera for the entire cinematic. Replaces the per-scene
 * camera rails that lived in `SceneSky`; that scene now only drives
 * its own sky / clouds / particles.
 *
 * Per frame:
 *   1. Read scroll, derive active beat + localProgress.
 *   2. Cubic-ease localProgress.
 *   3. Lerp start→end pose for the active beat; apply position + lookAt.
 *
 * Mounted last in `CanvasRoot` so its `useFrame` runs after every scene's
 * `useFrame`, giving it final say on the camera each frame.
 */
export default function CameraController() {
  const { camera } = useThree();

  useFrame(() => {
    const { scrollY, vh } = getScroll();
    const beat = getBeat(scrollY, vh);
    const pose = CAMERA_PATH[beat.index];
    if (!pose) return;

    const t = easeInOutCubic(beat.localProgress);

    setFromTuple(startPos, pose.start.position);
    setFromTuple(endPos,   pose.end.position);
    setFromTuple(startLook, pose.start.lookAt);
    setFromTuple(endLook,   pose.end.lookAt);

    tmpPos.lerpVectors(startPos, endPos, t);
    tmpLook.lerpVectors(startLook, endLook, t);

    camera.position.copy(tmpPos);
    camera.lookAt(tmpLook);
  });

  return null;
}
