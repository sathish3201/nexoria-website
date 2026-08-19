import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// EKADHANTHA brand blues (see src/index.css --blue / --blue-dark) instead
// of the portfolio's cyan/purple — keeps the chat's 3D accents consistent
// with the rest of the site's palette.
const BLUE = "#1d5fe0";
const BLUE_LIGHT = "#5b9dff";

// Replaces the flat "Thinking…" text indicator while the chat is waiting
// on a model reply — a small orbiting/pulsing sphere pair standing in for
// the request "thinking," instead of a generic loading spinner.
function Orb() {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 3;
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[0.32, 20, 20]}>
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={1.4} roughness={0.25} />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[0.5, 0, 0]}>
        <meshStandardMaterial
          color={BLUE_LIGHT}
          emissive={BLUE_LIGHT}
          emissiveIntensity={1.4}
          roughness={0.25}
        />
      </Sphere>
    </group>
  );
}

export default function ChatLoadingOrb() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Canvas camera={{ position: [0, 0, 1.8], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <Orb />
        <ambientLight intensity={0.6} />
        <pointLight position={[1, 1, 1]} intensity={1.2} color={BLUE} />
        <EffectComposer>
          <Bloom intensity={1} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
