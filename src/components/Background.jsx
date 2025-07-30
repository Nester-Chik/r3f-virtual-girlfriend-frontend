import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export function Background() {
  const texture = useTexture("/storefriendly-background.jpg");
  const meshRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 2, height: 2 });

  // Ensure the texture is properly configured
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  useEffect(() => {
    // Calculate aspect ratio when texture is loaded
    if (texture.image) {
      const aspectRatio = texture.image.width / texture.image.height;
      const baseHeight = 10; // Base height in Three.js units
      const baseWidth = baseHeight * aspectRatio;
      
      setDimensions({
        width: baseWidth,
        height: baseHeight
      });
    }
  }, [texture]);

  useFrame((state) => {
    if (meshRef.current && texture.image) {
      // Position the background relative to the camera
      const camera = state.camera;
      const distance = 10; // Distance from camera
      
      // Calculate the position in front of the camera
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      
      meshRef.current.position.copy(camera.position).add(direction.multiplyScalar(distance));
      
      // Make the background face the camera
      meshRef.current.lookAt(camera.position);
      
      // Calculate viewport dimensions
      const fov = camera.fov * (Math.PI / 180);
      const viewportHeight = 2 * Math.tan(fov / 2) * distance;
      const viewportWidth = viewportHeight * camera.aspect;
      
      // Calculate image aspect ratio
      const imageAspectRatio = texture.image.width / texture.image.height;
      const viewportAspectRatio = viewportWidth / viewportHeight;
      
      // Scale to fit height and maintain aspect ratio (width can be cropped)
      const scaleY = viewportHeight / dimensions.height;
      const scaleX = scaleY; // Keep aspect ratio by using same scale for both dimensions
      
      meshRef.current.scale.set(scaleX, scaleY, 1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[dimensions.width, dimensions.height]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        transparent={false}
      />
    </mesh>
  );
} 