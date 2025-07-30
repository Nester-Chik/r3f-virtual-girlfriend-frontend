import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export function Background() {
  const texture = useTexture("/storefriendly-design-background.jpg");
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
      
      // Scale to fill both dimensions while maintaining aspect ratio
      // The image will be scaled up until it covers both width and height
      // Any overflow will be cropped, keeping the image centered
      let scale;
      
      if (imageAspectRatio > viewportAspectRatio) {
        // Image is wider than viewport - scale to fit height, width will be cropped
        scale = viewportHeight / dimensions.height;
      } else {
        // Image is taller than viewport - scale to fit width, height will be cropped
        scale = viewportWidth / dimensions.width;
      }
      
      const scaleX = scale;
      const scaleY = scale;
      
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