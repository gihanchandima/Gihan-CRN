import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleNetworkProps {
  count?: number;
  connectionDistance?: number;
}

function ParticleNetwork({ count = 60, connectionDistance = 2.5 }: ParticleNetworkProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.005
      ));
    }
    
    return { positions, velocities };
  }, [count]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * count * 6);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const linePositions = linesRef.current.geometry.attributes.position.array as Float32Array;
    
    // Update particle positions
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i].x;
      positions[i * 3 + 1] += particles.velocities[i].y;
      positions[i * 3 + 2] += particles.velocities[i].z;
      
      // Boundary check
      if (Math.abs(positions[i * 3]) > 7.5) particles.velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 5) particles.velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 2.5) particles.velocities[i].z *= -1;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Update connections
    let lineIndex = 0;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < connectionDistance && lineIndex < count * count * 6 - 6) {
          linePositions[lineIndex++] = positions[i * 3];
          linePositions[lineIndex++] = positions[i * 3 + 1];
          linePositions[lineIndex++] = positions[i * 3 + 2];
          linePositions[lineIndex++] = positions[j * 3];
          linePositions[lineIndex++] = positions[j * 3 + 1];
          linePositions[lineIndex++] = positions[j * 3 + 2];
        }
      }
    }
    
    // Clear remaining line positions
    while (lineIndex < count * count * 6) {
      linePositions[lineIndex++] = 0;
    }
    
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Gentle rotation based on scroll
    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    pointsRef.current.rotation.y = scrollProgress * 0.3;
    linesRef.current.rotation.y = scrollProgress * 0.3;
  });

  const positionsAttribute = useMemo(() => {
    return new THREE.BufferAttribute(particles.positions, 3);
  }, [particles.positions]);

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <primitive object={positionsAttribute} attach="attributes-position" />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#3b82f6"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
      </lineSegments>
    </>
  );
}

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((child, i) => {
      child.position.y = Math.sin(time * 0.5 + i * 2) * 0.3;
      child.rotation.y = time * 0.2 + i;
    });
  });

  const orbs = [
    { position: [3, 1.5, 0], color: '#3b82f6', text: 'AI Score: 94' },
    { position: [-3, -1, 0.5], color: '#8b5cf6', text: '+127 leads' },
    { position: [2, -2, -0.5], color: '#14b8a6', text: '$2.4M' },
  ];

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position as [number, number, number]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshBasicMaterial 
            color={orb.color} 
            transparent 
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function NeuralBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && containerRef.current) {
      containerRef.current.style.display = 'none';
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 -z-10"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)' }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <ParticleNetwork count={50} connectionDistance={2.2} />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}
