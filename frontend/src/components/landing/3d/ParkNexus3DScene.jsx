import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, SoftShadows, Box, Plane, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Real 3D Car component using McLaren P1 GTR GLTF
const CarModel = ({ progress, theme }) => {
  const group = useRef();
  const [carScale, setCarScale] = useState([0.040, 0.040, 0.040]);
  const [carY, setCarY] = useState(0.184);
  
  // Load real McLaren P1 GTR 3D model
  const { scene } = useGLTF('/mclaren_p1_gtr_2015-gltf/scene.gltf');
  
  useEffect(() => {
    if (scene) {
      // 1. Calculate the exact bounding box of the raw GLTF
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      // 2. The car is oriented along the X-axis natively. 
      // We want it to be exactly 3.6 units long to fit the 4-unit parking spot.
      const targetScale = 3.6 / size.x;
      setCarScale([targetScale, targetScale, targetScale]);
      
      // 3. Shift it up so the bottom of the tires (min.y) sits exactly at Y=0
      setCarY(-box.min.y * targetScale);

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;

          // Safely access the material
          const mat = Array.isArray(child.material) ? child.material[0] : child.material;
          if (mat) {
            const r = mat.color?.r || 0;
            const g = mat.color?.g || 0;
            const b = mat.color?.b || 0;
            const name = mat.name || '';

            // Match the original purplish or reddish body paint from the GLTF
            if ((r > 0.2 && g < 0.2 && b > 0.6) || (r > 0.8 && g < 0.2 && b < 0.2) || name.includes('.014') || name.includes('.005')) {
              // Change to Premium Deep Burgundy / Maroon matching the user's reference image
              if (mat.color) mat.color.set('#4A0E17');
              if (mat.metalness !== undefined) mat.metalness = 0.85;
              if (mat.roughness !== undefined) mat.roughness = 0.15;
            }
          }
        }
      });
    }
  }, [scene]);

  return (
    <group ref={group} position={[-4, 0.01, -12]} rotation={[0, Math.PI / 2, 0]}>
      {/* 
         We rotate by -Math.PI / 2 because the GLTF natively faces +X. 
         This makes it face +Z (forward).
         The parent group is rotated Math.PI / 2, so the car ultimately faces -X (parked straight into the slot).
      */}
      <primitive object={scene} scale={carScale} rotation={[0, -Math.PI / 2, 0]} position={[0, carY, 0]} />
    </group>
  );
};

useGLTF.preload('/mclaren_p1_gtr_2015-gltf/scene.gltf');

// Parking Spot markings and indicators
const ParkingSpots = ({ progress, theme }) => {
  const spots = [-6, -12, -18]; // Z positions
  const indicatorColor = theme === 'dark' ? '#D6A37A' : '#D6A37A';
  const lineColor = theme === 'dark' ? '#D6A37A' : '#D6A37A';

  return (
    <group>
      {/* Road */}
      <Plane args={[10, 40]} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#000000" roughness={0.85} metalness={0.15} />
      </Plane>
      
      {/* Parking Spaces */}
      {spots.map((z, i) => (
        <group key={i} position={[-4, 0.02, z]}>
           {/* Parking space outline */}
          <Box args={[4, 0.02, 0.2]} position={[0, 0, -1.5]} receiveShadow>
             <meshStandardMaterial color={lineColor} />
          </Box>
          <Box args={[4, 0.02, 0.2]} position={[0, 0, 1.5]} receiveShadow>
             <meshStandardMaterial color={lineColor} />
          </Box>
          <Box args={[0.2, 0.02, 3]} position={[-2, 0, 0]} receiveShadow>
             <meshStandardMaterial color={lineColor} />
          </Box>
          {/* Smart Indicator */}
          {i === 1 && (
            <group position={[0, 0.03, 0]}>
               <IndicatorLight progress={progress} indicatorColor={indicatorColor} />
            </group>
          )}
        </group>
      ))}
    </group>
  );
};

const IndicatorLight = ({ progress, indicatorColor }) => {
  const materialRef = useRef();

  useFrame(() => {
    const p = progress.current;
    if (p < 0.6) {
      materialRef.current.color.set(indicatorColor);
      materialRef.current.emissive.set(indicatorColor);
      materialRef.current.emissiveIntensity = 2;
    } else {
      materialRef.current.color.set('#7B2F2F'); // Turns primary muted red for reserved/parked
      materialRef.current.emissive.set('#7B2F2F');
      materialRef.current.emissiveIntensity = 1.5;
    }
  });

  return (
    <mesh>
      <circleGeometry args={[0.4, 32]} />
      <meshStandardMaterial 
        ref={materialRef} 
        rotation={[-Math.PI/2, 0, 0]} 
        transparent 
        opacity={0.8}
        toneMapped={false}
      />
    </mesh>
  );
}

// Camera Rig
const CameraRig = ({ progress }) => {
  useFrame((state) => {
    const p = progress.current;
    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let lookAtX = 0;
    let lookAtY = 0;
    let lookAtZ = 0;

    if (p < 0.2) {
      // Scene 1: Arrival
      targetX = 12;
      targetY = 6;
      targetZ = 20;
      lookAtX = -5;
      lookAtY = 0;
      lookAtZ = 10;
    } else if (p < 0.5) {
      // Scene 2: Moving deeper
      const localP = (p - 0.2) / 0.3;
      targetX = 12 - (localP * 4); // 12 to 8
      targetY = 6 - (localP * 2);  // 6 to 4
      targetZ = 20 - (localP * 15); // 20 to 5
      lookAtX = -5 + (localP * 5); // -5 to 0
      lookAtY = 0;
      lookAtZ = 10 - (localP * 15); // 10 to -5
    } else if (p < 0.8) {
      // Scene 3: Approaching space
      const localP = (p - 0.5) / 0.3;
      targetX = 8;
      targetY = 4 + (localP * 2); // 4 to 6
      targetZ = 5 - (localP * 10); // 5 to -5
      lookAtX = 0 - (localP * 4); // 0 to -4
      lookAtY = 0;
      lookAtZ = -5 - (localP * 7); // -5 to -12
    } else {
      // Scene 4: Wide reveal
      const localP = (p - 0.8) / 0.2;
      targetX = 8 + (localP * 4); // 8 to 12
      targetY = 6 + (localP * 4); // 6 to 10
      targetZ = -5 + (localP * 5); // -5 to 0
      lookAtX = -4;
      lookAtY = 0;
      lookAtZ = -12;
    }

    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
    
    // Smooth LookAt
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const targetLookAt = new THREE.Vector3(lookAtX, lookAtY, lookAtZ);
    // Since we can't directly lerp the lookAt target trivially without state, we'll interpolate a ref vector
    // For simplicity, we just use lookAt on the interpolated vector directly.
    // To make it smoother, we'd need to store the lookAt vector.
    if (!state.camera.userData.lookAt) {
        state.camera.userData.lookAt = new THREE.Vector3(lookAtX, lookAtY, lookAtZ);
    }
    state.camera.userData.lookAt.lerp(targetLookAt, 0.05);
    state.camera.lookAt(state.camera.userData.lookAt);
  });
  return null;
};


const ParkNexus3DScene = () => {
  const [theme, setTheme] = useState('dark');
  const progress = useRef(0);

  // Read theme from DOM
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'dark' : 'light');
    };
    updateTheme(); // initial
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress 0 to 1 based on page height
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        progress.current = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      } else {
        progress.current = 0;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas shadows camera={{ position: [12, 6, 20], fov: 45 }}>
        <color attach="background" args={[theme === 'dark' ? '#0A0A0B' : '#FAF9F6']} />
        
        {/* Lighting */}
        <ambientLight intensity={theme === 'dark' ? 0.4 : 0.8} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={theme === 'dark' ? 1.2 : 1.5} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        >
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>
        {/* Fill light from the left side to highlight the car against black road */}
        <pointLight position={[-10, 5, 0]} intensity={theme === 'dark' ? 0.6 : 0.3} color="#FAF9F6" />
        <pointLight position={[10, 2, 5]} intensity={0.4} color="#D6A37A" />
        
        <SoftShadows size={10} samples={16} />

        {/* Environment Grid Removed */}
        
        <ParkingSpots progress={progress} theme={theme} />
        
        <Environment preset={theme === 'dark' ? 'city' : 'city'} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={[theme === 'dark' ? '#0A0A0B' : '#FAF9F6', 15, 40]} />
      </Canvas>
    </div>
  );
};

export default ParkNexus3DScene;
