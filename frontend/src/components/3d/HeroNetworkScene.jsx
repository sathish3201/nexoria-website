import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Brand palette pulled from src/index.css design tokens — no invented
// colors. --blue is the primary accent; --blue-dark and a lightened tint
// of --blue give the scene some depth without introducing a new hue.
const BLUE = "#1d5fe0";
const BLUE_LIGHT = "#5b8bef";
const BLUE_DARK = "#154cb8";

// Abstract network / pipeline node-graph — generic (not tied to any one
// project) but on-brand for a company doing web/app dev, data engineering,
// analytics, and IT services: a small hub-and-spoke graph reads as
// "systems talking to each other" without depicting anything literal.
const NODES = [
  { angle: 0, color: BLUE_LIGHT, size: 0.3 },
  { angle: Math.PI / 2.5, color: BLUE, size: 0.22 },
  { angle: Math.PI, color: BLUE_LIGHT, size: 0.34 },
  { angle: Math.PI + Math.PI / 2.5, color: BLUE_DARK, size: 0.24 },
  { angle: (3 * Math.PI) / 2, color: BLUE, size: 0.2 },
];
const ORBIT_RADIUS = 2.6;

function Node({ position, color, size }) {
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.7}>
      <Sphere args={[size, 24, 24]} position={position}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} roughness={0.3} />
      </Sphere>
    </Float>
  );
}

// Pulsing emissive core standing in for the "hub" tying the graph together.
function CoreNode() {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.3) * 0.08;
    meshRef.current.scale.setScalar(pulse);
    meshRef.current.material.emissiveIntensity = 1.4 + Math.sin(t * 1.3) * 0.5;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={1.4} roughness={0.2} />
      </Sphere>
    </Float>
  );
}

function NetworkGraph() {
  const groupRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  const nodePositions = useMemo(
    () =>
      NODES.map((n) => [
        Math.cos(n.angle) * ORBIT_RADIUS,
        Math.sin(n.angle) * ORBIT_RADIUS * 0.5,
        Math.sin(n.angle) * 0.8,
      ]),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Ambient auto-rotation is the base motion. Pointer tilt is tracked
    // separately in userData and ADDED to the ambient value each frame —
    // never assign rotation.y = baseY alone, or any pointer-tilt offset
    // gets silently discarded before it's ever visible.
    const baseY = t * 0.07;
    const tiltX = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.current.y * 0.08, 0.05);
    const tiltYOffset = THREE.MathUtils.lerp(
      groupRef.current.userData.tiltYOffset ?? 0,
      mouse.current.x * 0.08,
      0.05
    );

    groupRef.current.rotation.x = tiltX;
    groupRef.current.rotation.y = baseY + tiltYOffset;
    groupRef.current.userData.tiltYOffset = tiltYOffset;

    if (state.pointer) {
      mouse.current = { x: state.pointer.x, y: state.pointer.y };
    }
  });

  return (
    <group ref={groupRef}>
      <CoreNode />

      {nodePositions.map((pos, i) => (
        <group key={i}>
          <Node position={pos} color={NODES[i].color} size={NODES[i].size} />
          <Line points={[[0, 0, 0], pos]} color={NODES[i].color} transparent opacity={0.38} lineWidth={2} />
        </group>
      ))}

      <ambientLight intensity={0.55} />
      <pointLight position={[4, 4, 4]} intensity={1.3} color={BLUE_LIGHT} />
      <pointLight position={[-4, -2, 3]} intensity={1} color={BLUE_DARK} />
    </group>
  );
}

// Hero background scene: sits absolutely positioned behind the hero copy at
// low opacity, pointer-events-none, gated through <Scene3D>. No orbit
// controls — this is a passive ambient backdrop, not an interactive object.
export default function HeroNetworkScene() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <NetworkGraph />
        <EffectComposer>
          <Bloom intensity={1} luminanceThreshold={0.2} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
