import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";

// EKADHANTHA brand blues (see src/index.css --blue / --blue-dark), matching
// ChatLoadingOrb, instead of the portfolio's cyan/purple.
const BLUE = "#1d5fe0";
const BLUE_LIGHT = "#5b9dff";

// Tiny per-message avatar orb — deep blue for the visitor's own messages,
// lighter blue for the assistant's — sized to sit inline with each chat
// bubble like a mini avatar. No Bloom/EffectComposer here: at ~24px on
// screen the extra postprocessing pass isn't visible and isn't worth
// paying for on every single message in a growing conversation.
function Orb({ color }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 1.2;
  });

  return (
    <Sphere ref={meshRef} args={[0.9, 20, 20]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} roughness={0.3} />
    </Sphere>
  );
}

export default function MessageOrb({ accent = "user" }) {
  const color = accent === "assistant" ? BLUE_LIGHT : BLUE;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <Orb color={color} />
        <ambientLight intensity={0.7} />
        <pointLight position={[1, 1, 1]} intensity={1} color={color} />
      </Canvas>
    </div>
  );
}
