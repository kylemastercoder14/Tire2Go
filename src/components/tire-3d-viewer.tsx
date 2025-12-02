"use client";

import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF, Html } from "@react-three/drei";
import { Group } from "three";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { IconZoomIn, IconZoomOut, IconRotateClockwise, IconBrightness, IconInfoCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";

interface Tire3DViewerProps {
  tireImage?: string;
  tireName: string;
  tireSize?: string;
  threeDModel?: string | null; // URL to the actual 3D model (.glb file)
}

// Helper function to get tire 3D model path
// Uses threeDModel URL if provided, otherwise falls back to name-based mapping
function getTireModelPath(tireName: string, threeDModel?: string | null): string | null {
  // If threeDModel URL is provided, use it directly
  if (threeDModel && threeDModel.trim() !== "") {
    return threeDModel;
  }

  // Fallback to name-based mapping (for backward compatibility)
  const normalizedName = tireName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const tireModels: Record<string, string> = {
    "SP-SPORT-2030": "/tire-3d/SP-Sport-2030.glb",
    "SP-SPORT2030": "/tire-3d/SP-Sport-2030.glb",
    "SPORT-2030": "/tire-3d/SP-Sport-2030.glb",
    "SPORT2030": "/tire-3d/SP-Sport-2030.glb",
    "SPORT": "/tire-3d/ENASAVE-EC300+.glb",
  };

  if (tireModels[normalizedName]) {
    return tireModels[normalizedName];
  }

  const matchingKey = Object.keys(tireModels).find(key =>
    normalizedName.includes(key.replace(/-/g, "")) ||
    key.replace(/-/g, "").includes(normalizedName)
  );

  if (matchingKey) {
    return tireModels[matchingKey];
  }

  // Return null if no model found (will show empty state)
  return null;
}

// Store wheel positions and metadata
interface WheelInfo {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  object: THREE.Object3D;
}

// Load and display the car model, extract wheel positions
function CarModel({ onWheelsFound }: { onWheelsFound: (wheels: WheelInfo[]) => void }) {
  const { scene } = useGLTF("/car-model-3d.glb");
  const carRef = useRef<Group>(null);
  const onWheelsFoundRef = useRef(onWheelsFound);
  const hasCalledRef = useRef(false);

  // Update ref when callback changes
  useEffect(() => {
    onWheelsFoundRef.current = onWheelsFound;
  }, [onWheelsFound]);

  useEffect(() => {
    if (carRef.current && scene) {
      // Clone the scene to avoid modifying the original
      const clonedScene = scene.clone();

      const wheelInfos: WheelInfo[] = [];
      const wheelNames = [
        'wheel', 'tyre', 'tire', 'rim', 'whl', 'wh',
        'wheel_FL', 'wheel_FR', 'wheel_RL', 'wheel_RR',
        'wheel_front', 'wheel_rear', 'wheel_left', 'wheel_right',
        'fl_wheel', 'fr_wheel', 'rl_wheel', 'rr_wheel',
        'front_left_wheel', 'front_right_wheel', 'rear_left_wheel', 'rear_right_wheel',
        'Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR',
        'wheel_front_left', 'wheel_front_right', 'wheel_rear_left', 'wheel_rear_right',
        'FL', 'FR', 'RL', 'RR', 'fl', 'fr', 'rl', 'rr',
        'front_left', 'front_right', 'rear_left', 'rear_right',
        // Common naming patterns in various formats
        'whl_fl', 'whl_fr', 'whl_rl', 'whl_rr',
        'tire_fl', 'tire_fr', 'tire_rl', 'tire_rr',
        'tyre_fl', 'tyre_fr', 'tyre_rl', 'tyre_rr'
      ];

      // Find and hide wheels, extract their positions
      // We'll do this in two passes: first identify wheels, then get positions after centering
      const wheelObjects: THREE.Object3D[] = [];

      // First, log all object names to help debug
      const allObjectNames: string[] = [];
      clonedScene.traverse((child) => {
        if (child.name) {
          allObjectNames.push(child.name);
        }
      });
      // Debug: Uncomment for debugging wheel detection
      // console.log('All object names in car model:', allObjectNames);

      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Brighten car materials for better visibility
          if (child instanceof THREE.Mesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial ||
                  mat instanceof THREE.MeshPhysicalMaterial) {
                // Increase material brightness significantly
                mat.emissive = new THREE.Color(0x444444); // Increased emissive glow
                mat.emissiveIntensity = 0.4; // Increased from 0.2 to 0.4
                // Reduce roughness for more reflectivity (brighter appearance)
                if (mat.roughness !== undefined) {
                  mat.roughness = Math.min(mat.roughness * 0.6, 0.7); // More reflective
                }
                // Increase metalness slightly for more shine
                if (mat.metalness !== undefined) {
                  mat.metalness = Math.min(mat.metalness * 1.2, 0.8);
                }
                mat.needsUpdate = true;
              }
            });
          }

          // Check if this is a wheel by name
          const nameLower = child.name.toLowerCase().trim();
          const isWheel = wheelNames.some(wheelName =>
            nameLower.includes(wheelName.toLowerCase()) ||
            nameLower === wheelName.toLowerCase()
          );

          // Also check parent groups that might contain wheels
          let parentIsWheel = false;
          if (child.parent) {
            const parentNameLower = child.parent.name.toLowerCase().trim();
            parentIsWheel = wheelNames.some(wheelName =>
              parentNameLower.includes(wheelName.toLowerCase())
            );
          }

          if (isWheel || parentIsWheel) {
            wheelObjects.push(child);

            // Hide the original wheel
            child.visible = false;

            // Also hide children if it's a group
            child.traverse((descendant) => {
              if (descendant instanceof THREE.Mesh) {
                descendant.visible = false;
              }
            });
          }
        }
      });

      // Debug: Uncomment for debugging
      // console.log(`Found ${wheelObjects.length} wheel objects in car model`);

      // If we didn't find wheels by name, try to detect them by geometry
      if (wheelObjects.length === 0) {
        // Debug: Uncomment for debugging
        // console.log('No wheels found by name, trying geometry-based detection...');

        // Try to find cylindrical objects (wheels/tires are typically cylindrical)
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const geometry = child.geometry;

            // Check if it's a cylinder (wheels are typically cylinders)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const geomParams = (geometry as any).parameters;
            const isCylinder = geometry.type === 'CylinderGeometry' ||
                (geomParams &&
                 (geomParams.radiusTop !== undefined || geomParams.radius !== undefined));

            if (isCylinder) {

              // Get bounding box to check size - wheels should be roughly circular
              const box = new THREE.Box3().setFromObject(child);
              const size = box.getSize(new THREE.Vector3());

              // Wheels typically have: diameter (x or z) > height (y), and reasonable size
              const maxDim = Math.max(size.x, size.y, size.z);
              const minDim = Math.min(size.x, size.y, size.z);
              const aspectRatio = maxDim / (minDim + 0.001);

              // Check if it's wheel-sized (between 0.2 and 1.5 units diameter)
              // and positioned at wheel height (negative Y, typically between -0.8 and -0.2)
              const worldPos = new THREE.Vector3();
              child.getWorldPosition(worldPos);

              if (maxDim > 0.2 && maxDim < 1.5 &&
                  aspectRatio > 1.2 && aspectRatio < 5 &&
                  worldPos.y < 0.5 && worldPos.y > -1.0) {

                // Debug: Uncomment for debugging
                // console.log(`Potential wheel found by geometry: "${child.name}" at position`, worldPos, 'size:', size);
                wheelObjects.push(child);

                // Hide it
                child.visible = false;
              }
            }
          }
        });

        if (wheelObjects.length === 0) {
          // Debug: Uncomment for debugging
          // console.log('No wheels found by geometry either, will use fallback positions');
        }
      }

      // Clear any existing children and add the cloned scene
      while (carRef.current.children.length > 0) {
        carRef.current.remove(carRef.current.children[0]);
      }
      carRef.current.add(clonedScene);

      // Scale up the car model slightly for better visibility FIRST
      const carScaleFactor = 1.15; // 15% larger
      clonedScene.scale.multiplyScalar(carScaleFactor);

      // Calculate bounding box and center AFTER scaling
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = box.getCenter(new THREE.Vector3());

      // Adjust position to center the car perfectly at origin (0,0,0)
      const carLiftAmount = 0.55; // Amount to lift the car
      clonedScene.position.x = -center.x;
      clonedScene.position.y = -center.y + carLiftAmount; // Lift car up so it sits on the floor
      clonedScene.position.z = -center.z;

      // Recalculate center after positioning to ensure it's at origin
      const finalBox = new THREE.Box3().setFromObject(clonedScene);
      const finalCenter = finalBox.getCenter(new THREE.Vector3());

      // Fine-tune centering if needed (should be close to 0,0,0)
      if (Math.abs(finalCenter.x) > 0.01 || Math.abs(finalCenter.z) > 0.01) {
        clonedScene.position.x -= finalCenter.x;
        clonedScene.position.z -= finalCenter.z;
      }

      // Calculate car dimensions for wheel positioning
      const carBox = new THREE.Box3().setFromObject(clonedScene);
      const carSize = carBox.getSize(new THREE.Vector3());

      // Debug: Uncomment for debugging
      // console.log('Car dimensions:', {
      //   length: carSize.x.toFixed(3),
      //   height: carSize.y.toFixed(3),
      //   width: carSize.z.toFixed(3),
      //   min: `x: ${carMin.x.toFixed(3)}, y: ${carMin.y.toFixed(3)}, z: ${carMin.z.toFixed(3)}`,
      //   max: `x: ${carMax.x.toFixed(3)}, y: ${carMax.y.toFixed(3)}, z: ${carMax.z.toFixed(3)}`
      // });

      // Recalculate wheel positions AFTER centering the car
      const finalWheelInfos: WheelInfo[] = [];

      wheelObjects.forEach((wheelObj) => {
        const worldPos = new THREE.Vector3();
        const worldRot = new THREE.Euler();
        const worldScale = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();

        wheelObj.getWorldPosition(worldPos);
        wheelObj.getWorldQuaternion(worldQuat);
        worldRot.setFromQuaternion(worldQuat);
        wheelObj.getWorldScale(worldScale);

        // Get bounding box to find the actual wheel center
        const wheelBox = new THREE.Box3().setFromObject(wheelObj);
        const wheelCenter = wheelBox.getCenter(new THREE.Vector3());

        // Use the bounding box center as the actual wheel position
        wheelObj.getWorldPosition(wheelCenter);

        finalWheelInfos.push({
          position: wheelCenter.clone(),
          rotation: worldRot.clone(),
          scale: worldScale.clone(),
          object: wheelObj
        });

        // Debug: Uncomment for debugging
        // console.log(`Wheel "${wheelObj.name}" at position:`,
        //   `x: ${wheelCenter.x.toFixed(3)}, y: ${wheelCenter.y.toFixed(3)}, z: ${wheelCenter.z.toFixed(3)}`,
        //   `rotation: x: ${worldRot.x.toFixed(3)}, y: ${worldRot.y.toFixed(3)}, z: ${worldRot.z.toFixed(3)}`,
        //   `scale: x: ${worldScale.x.toFixed(3)}, y: ${worldScale.y.toFixed(3)}, z: ${worldScale.z.toFixed(3)}`
        // );
      });

      // If no wheels detected, calculate positions based on car dimensions
      // Note: car is now centered, so positions are relative to origin
      if (finalWheelInfos.length === 0) {
        // Debug: Uncomment for debugging
        // console.log('Calculating wheel positions from car dimensions...');
        // console.log('Car size details:', {
        //   length: carSize.x,
        //   width: carSize.z,
        //   height: carSize.y,
        //   center: { x: center.x, y: center.y, z: center.z }
        // });

        // Since car is centered, positions are now relative to (0,0,0)
        // Car extends from -size/2 to +size/2 in each dimension

        // Fine-tune these values based on your car model:
        // You can adjust these percentages if wheels don't align correctly
        const wheelRadius = Math.min(carSize.x, carSize.z) * 0.03; // Estimate wheel radius (~6% of smallest dimension)
        const carLiftAmount = 0.55; // Match the car lift amount
        const wheelY = -carSize.y / 2 + wheelRadius * 1 + carLiftAmount; // Bottom of centered car + wheel radius + car lift
        const wheelZOffset = carSize.z * 0.26; // Distance from center to wheel (28% of width - already adjusted)

        // Front and rear wheel positions (X-axis is typically front-to-back)
        // Adjust these percentages based on typical car wheelbase
        // Increase/decrease to move wheels forward/backward
        const frontAxleX = carSize.x * 0.42; // Front wheels at ~42% from front
        const rearAxleX = -carSize.x * 0.30; // Rear wheels at ~30% from rear

        // Create dummy objects for positioning
        const dummyObject = new THREE.Object3D();

        const wheelPositions = [
          { name: 'Front Left', position: new THREE.Vector3(frontAxleX, wheelY, -wheelZOffset) },
          { name: 'Front Right', position: new THREE.Vector3(frontAxleX, wheelY, wheelZOffset) },
          { name: 'Rear Left', position: new THREE.Vector3(rearAxleX, wheelY, -wheelZOffset) },
          { name: 'Rear Right', position: new THREE.Vector3(rearAxleX, wheelY, wheelZOffset) },
        ];

        wheelPositions.forEach((wp) => {
          finalWheelInfos.push({
            position: wp.position.clone(),
            rotation: new THREE.Euler(0, 0, 0), // Default rotation (will be adjusted by tire component)
            scale: new THREE.Vector3(1, 1, 1),
            object: dummyObject.clone()
          });

          // Debug: Uncomment for debugging
          // console.log(`${wp.name} calculated at: x: ${wp.position.x.toFixed(3)}, y: ${wp.position.y.toFixed(3)}, z: ${wp.position.z.toFixed(3)}`);
        });

        // Debug: Uncomment for debugging
        // console.log(`Calculated ${finalWheelInfos.length} wheel positions based on car size`);
      }

      // Store reference for later use (optional, for debugging)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (carRef.current as any).clonedScene = clonedScene;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (carRef.current as any).carCenter = center;

      // Use final wheel infos if we found any, otherwise use original
      const wheelsToUse = finalWheelInfos.length > 0 ? finalWheelInfos : wheelInfos;

      // Notify parent component of found wheels (only once)
      if (!hasCalledRef.current) {
        hasCalledRef.current = true;
        if (wheelsToUse.length > 0) {
          // Debug: Uncomment for debugging
          // console.log(`Found ${wheelsToUse.length} wheels in car model`);
          onWheelsFoundRef.current(wheelsToUse);
        } else {
          // Fallback to default positions if no wheels found
          // Debug: Uncomment for debugging
          // console.warn('No wheels detected in car model, using default positions');
          onWheelsFoundRef.current([]);
        }
      }
    }
  }, [scene]); // Remove onWheelsFound from dependencies

  return <group ref={carRef} />;
}

// Individual tire instance component - optimized to use preprocessed scene
function TireInstance({
  tireScene,
  tireSize,
  position,
  rotation,
  scale = [1, 1, 1],
  wheelInfo
}: {
  tireScene: THREE.Group;
  tireSize: THREE.Vector3;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  wheelInfo?: WheelInfo;
}) {
  // Use a ref to track wheelInfo to avoid infinite loops
  const wheelInfoRef = useRef(wheelInfo);
  useEffect(() => {
    wheelInfoRef.current = wheelInfo;
  }, [wheelInfo]);

  // Normalize scale to prevent unnecessary recalculations when scale array is recreated
  const scaleX = scale[0];
  const scaleY = scale[1];
  const scaleZ = scale[2];

  // Much faster clone - scene is already preprocessed
  const clonedTire = useMemo(() => {
    const clone = tireScene.clone();

    let finalScale: number;

    // If we have wheel info, scale to match the original wheel size
    const currentWheelInfo = wheelInfoRef.current;
    if (currentWheelInfo && currentWheelInfo.object.children.length > 0) {
      // Get the original wheel's bounding box
      const wheelBox = new THREE.Box3().setFromObject(currentWheelInfo.object);
      const wheelSize = wheelBox.getSize(new THREE.Vector3());
      const wheelDiameter = Math.max(wheelSize.x, wheelSize.y, wheelSize.z);

      // Scale tire to match original wheel size (slightly smaller to ensure it fits)
      const tireDiameter = Math.max(tireSize.x, tireSize.y, tireSize.z);
      finalScale = tireDiameter > 0 ? (wheelDiameter * 0.95) / tireDiameter : 1;
    } else {
      // Fallback scaling if no wheel info
      const carLength = 1.22; // From car model logs
      const estimatedWheelDiameter = carLength * 0.45; // ~45% of car length
      const tireDiameter = Math.max(tireSize.x, tireSize.y, tireSize.z);

      if (tireDiameter > 0) {
        finalScale = estimatedWheelDiameter / tireDiameter;
      } else {
        finalScale = 0.25; // Default fallback
      }

      // Clamp scale to reasonable range (0.15 to 1.0)
      finalScale = Math.max(0.15, Math.min(finalScale, 1.0));
    }

    // Apply scale - materials already processed, just scale
    clone.scale.set(finalScale * scaleX, finalScale * scaleY, finalScale * scaleZ);

    // Reset position for now
    clone.position.set(0, 0, 0);

    return clone;
  }, [tireScene, tireSize, scaleX, scaleY, scaleZ]); // Use pre-calculated tireSize

  useEffect(() => {
    // Use wheel info if available, otherwise use provided position/rotation
    if (wheelInfo) {
      // Get the wheel's world position (already in car-centered coordinate space)
      const wheelWorldPos = wheelInfo.position.clone();

      // Reset position and rotation first
      clonedTire.position.set(0, 0, 0);
      clonedTire.rotation.set(0, 0, 0);

      // Apply tire model rotation correction FIRST
      // Most tire models are exported lying flat (Y-up), so rotate 90° on X axis to stand them up
      clonedTire.rotateX(Math.PI / 2);

      // Apply wheel rotation if it has one
      if (wheelInfo.rotation) {
        clonedTire.rotation.copy(wheelInfo.rotation);
        // Re-apply the X rotation after setting wheel rotation
        clonedTire.rotateX(Math.PI / 2);
      }

      // Calculate tire center AFTER all rotations and scaling are applied
      const tireBox = new THREE.Box3().setFromObject(clonedTire);
      const tireCenter = tireBox.getCenter(new THREE.Vector3());

      // Set tire position to wheel position, offset by tire center
      // Add small adjustments to fine-tune positioning
      clonedTire.position.copy(wheelWorldPos);
      clonedTire.position.sub(tireCenter);

      // Fine-tune adjustments (can be adjusted based on viewing angle)
      // These small offsets help align tires better from different angles
      // Adjust these values if tires don't align perfectly from all angles
      clonedTire.position.y += 0.03; // Slight upward adjustment (increased from 0.02)

      // Adjust Z to move tires outward (positive) or inward (negative)
      // Using Math.sign to ensure we push outward in the correct direction
      const zDirection = Math.sign(clonedTire.position.z); // +1 for right side, -1 for left side
      clonedTire.position.z += zDirection * 0.06; // Move outward by 0.03 units

      // Optional: Adjust X if tires need to move forward/backward slightly
      // Positive values move forward, negative values move backward
      // clonedTire.position.x += 0.0; // Uncomment and adjust if needed

      // Ensure tire is visible
      clonedTire.visible = true;
      clonedTire.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
          child.visible = true;
          if (child instanceof THREE.Mesh && child.material) {
            // Ensure materials are not transparent and brighten them
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              if (mat && (mat instanceof THREE.MeshStandardMaterial ||
                          mat instanceof THREE.MeshPhysicalMaterial ||
                          mat instanceof THREE.MeshBasicMaterial)) {
                mat.opacity = 1.0;
                mat.transparent = false;

                // Brighten tire materials for better visibility
                if (mat instanceof THREE.MeshStandardMaterial ||
                    mat instanceof THREE.MeshPhysicalMaterial) {
                  // Add stronger emissive glow to make tires brighter
                  mat.emissive = new THREE.Color(0x333333); // Increased from 0x111111
                  mat.emissiveIntensity = 0.35; // Increased from 0.15 to 0.35
                  // Reduce roughness for more reflectivity
                  if (mat.roughness !== undefined) {
                    mat.roughness = Math.min(mat.roughness * 0.7, 0.85); // More reflective
                  }
                  mat.needsUpdate = true;
                }
              }
            });
          }
        }
      });

      // Debug: Uncomment for debugging
      // console.log(`Tire positioned at: x: ${clonedTire.position.x.toFixed(3)}, y: ${clonedTire.position.y.toFixed(3)}, z: ${clonedTire.position.z.toFixed(3)}, wheel at: x: ${wheelWorldPos.x.toFixed(3)}, y: ${wheelWorldPos.y.toFixed(3)}, z: ${wheelWorldPos.z.toFixed(3)}, tire size: x: ${tireSize.x.toFixed(3)}, y: ${tireSize.y.toFixed(3)}, z: ${tireSize.z.toFixed(3)}`);
    } else if (position) {
      clonedTire.position.set(...position);
      clonedTire.visible = true;
      if (rotation) {
        clonedTire.rotation.set(...rotation);
      } else {
        // Apply default rotation correction for fallback positions
        clonedTire.rotation.set(Math.PI / 2, 0, 0); // Rotate 90° on X axis
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedTire, position, rotation]); // Only depend on stable values, wheelInfo is handled via refs

  // Ensure tire is always visible
  useEffect(() => {
    if (clonedTire) {
      clonedTire.visible = true;
      clonedTire.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
          child.visible = true;
        }
      });
    }
  }, [clonedTire]);

  return <primitive object={clonedTire} />;
}

// Default scale constant to prevent array recreation
const DEFAULT_SCALE: [number, number, number] = [1, 1, 1];

// Memoize TireInstance to prevent unnecessary re-renders
const MemoizedTireInstance = React.memo(TireInstance);

// Pre-process tire scene once - optimize materials and settings
function usePreprocessedTireScene(tireScene: THREE.Group | null) {
  return useMemo(() => {
    if (!tireScene) return null;

    // Create a lightweight template - just calculate size once
    const box = new THREE.Box3().setFromObject(tireScene);
    const size = box.getSize(new THREE.Vector3());

    // Pre-process materials once - this is expensive, so do it once
    const processedScene = tireScene.clone();

    processedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Fix materials - ensure tires are not white and have proper properties
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          const newMaterials = materials.map((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial ||
                mat instanceof THREE.MeshPhysicalMaterial ||
                mat instanceof THREE.MeshBasicMaterial) {
              // Clone material to avoid modifying the original
              const newMat = mat.clone();

              // If material is white or very light, change to tire black
              const currentColor = newMat.color || new THREE.Color(0xffffff);
              const brightness = (currentColor.r + currentColor.g + currentColor.b) / 3;

              // If brightness is too high (white/light colored), set to tire black
              if (brightness > 0.7 || !newMat.map) {
                newMat.color = new THREE.Color(0x1a1a1a); // Dark gray/black for tire
                // Set material properties for PBR materials only
                if (newMat instanceof THREE.MeshStandardMaterial || newMat instanceof THREE.MeshPhysicalMaterial) {
                  newMat.roughness = 0.9; // Tires are not glossy
                  newMat.metalness = 0.1; // Tires are not metallic
                }
              }

              // Ensure material is not transparent and has proper opacity
              newMat.transparent = false;
              newMat.opacity = 1.0;
              newMat.alphaTest = 0.1; // Discard very transparent pixels

              // Set side to DoubleSide to prevent white backfaces from showing
              newMat.side = THREE.DoubleSide;

              return newMat;
            }
            return mat;
          });

          child.material = Array.isArray(child.material) ? newMaterials : newMaterials[0];
        }
      }
    });

    return { processedScene, size };
  }, [tireScene]);
}

// Hook to get signed URL for private S3 files
function useSignedUrl(tirePath: string): string {
  const [actualPath, setActualPath] = React.useState<string>(tirePath);

  React.useEffect(() => {
    // Automatically get signed URL for S3 files in ecr/ folder (private files)
    if (tirePath && tirePath.includes('/ecr/')) {
      fetch(`/api/s3/signed-url?url=${encodeURIComponent(tirePath)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.signedUrl) {
            setActualPath(data.signedUrl);
          }
        })
        .catch(() => {
          // If signed URL fails, use original path (will show error)
        });
    }
  }, [tirePath]);

  return actualPath;
}

// Component that loads and renders a single tire model with error handling
function LoadedTireWheels({ tirePath, wheelInfos, onLoad, tireName }: { tirePath: string; wheelInfos: WheelInfo[]; onLoad?: () => void; tireName: string }) {
  const actualPath = useSignedUrl(tirePath);
  const { scene: tireScene } = useGLTF(actualPath);
  const preprocessed = usePreprocessedTireScene(tireScene);
  const onLoadRef = React.useRef(onLoad);
  const hasLoadedRef = React.useRef(false);

  // Update ref when onLoad changes
  React.useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  React.useEffect(() => {
    if (preprocessed && onLoadRef.current && wheelInfos.length > 0 && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // Delay to ensure tires are rendered
      const timer = setTimeout(() => {
        onLoadRef.current?.();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [preprocessed, wheelInfos.length]);

  // Fallback wheel positions if no wheels were detected in the car model
  const fallbackPositions = useMemo(() => [
    { position: [-0.85, -0.35, 0.75] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },   // Front Left
    { position: [-0.85, -0.35, -0.75] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },  // Front Right
    { position: [0.85, -0.35, 0.75] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },    // Rear Left
    { position: [0.85, -0.35, -0.75] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },   // Rear Right
  ], []);

  if (!preprocessed) return null;

  // Use detected wheel positions if available, otherwise use fallback
  const wheelsToRender = wheelInfos.length > 0 ? wheelInfos : fallbackPositions.map((pos) => ({
    position: new THREE.Vector3(...pos.position),
    rotation: new THREE.Euler(...pos.rotation),
    scale: new THREE.Vector3(...pos.scale),
    object: new THREE.Object3D()
  }));

  return (
    <>
      {wheelsToRender.map((wheelInfo, index) => (
        <MemoizedTireInstance
          key={`tire-${index}-${tireName}`}
          tireScene={preprocessed.processedScene}
          tireSize={preprocessed.size}
          wheelInfo={wheelInfos.length > 0 ? wheelInfo : undefined}
          position={wheelInfos.length === 0 ? fallbackPositions[index]?.position : undefined}
          rotation={wheelInfos.length === 0 ? fallbackPositions[index]?.rotation : undefined}
          scale={DEFAULT_SCALE}
        />
      ))}
    </>
  );
}

// Load and display tire model at specific positions
function TireWheels({ tireName, wheelInfos, onLoad, threeDModel }: { tireName: string; wheelInfos: WheelInfo[]; onLoad?: () => void; threeDModel?: string | null }) {
  const tirePath = getTireModelPath(tireName, threeDModel);

  // If no tire path, don't render anything
  if (!tirePath) {
    return null;
  }

  // Render the loaded tire wheels component
  return (
    <LoadedTireWheels
      tirePath={tirePath}
      wheelInfos={wheelInfos}
      onLoad={onLoad}
      tireName={tireName}
    />
  );
}

// Main component that combines car and tires
function FordRangerWithTires({ tireName, onCarLoad, onTiresLoad, threeDModel }: { tireName: string; onCarLoad?: () => void; onTiresLoad?: () => void; threeDModel?: string | null }) {
  const [wheelInfos, setWheelInfos] = React.useState<WheelInfo[]>([]);
  const carLoadedRef = React.useRef(false);
  const onCarLoadRef = React.useRef(onCarLoad);

  // Update refs when callbacks change
  React.useEffect(() => {
    onCarLoadRef.current = onCarLoad;
  }, [onCarLoad]);

  const handleWheelsFound = React.useCallback((wheels: WheelInfo[]) => {
    setWheelInfos(wheels);
    if (!carLoadedRef.current && onCarLoadRef.current) {
      carLoadedRef.current = true;
      // Small delay to ensure car is rendered
      setTimeout(() => {
        onCarLoadRef.current?.();
      }, 100);
    }
  }, []); // Empty deps - callback is stable

  const tirePath = getTireModelPath(tireName, threeDModel);

  return (
    <group>
      <CarModel onWheelsFound={handleWheelsFound} />
      {tirePath && (
        <Suspense fallback={null}>
          {wheelInfos.length >= 0 && (
            <TireWheels
              tireName={tireName}
              wheelInfos={wheelInfos}
              onLoad={onTiresLoad}
              threeDModel={threeDModel}
            />
          )}
        </Suspense>
      )}
    </group>
  );
}

// Preload models for better performance - only preload essential models
// Removed global preloads to reduce initial load time - models will be loaded on demand

// Garage background component using 3D GLB model
function GarageBackground({ onLoad }: { onLoad?: () => void }) {
  const { scene } = useGLTF("/car-garage-bg.glb");
  const onLoadRef = React.useRef(onLoad);
  const hasLoadedRef = React.useRef(false);

  // Update ref when onLoad changes
  React.useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  React.useEffect(() => {
    if (scene && onLoadRef.current && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      // Delay to ensure garage is rendered
      const timer = setTimeout(() => {
        onLoadRef.current?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scene]); // Only depend on scene, not onLoad
  const garageRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid modifying the original
  const clonedGarage = useMemo(() => {
    const cloned = scene.clone();
    return cloned;
  }, [scene]);

  // Position and scale the garage appropriately
  useEffect(() => {
    if (clonedGarage) {
      // Calculate bounding box first to understand the garage's dimensions
      const box = new THREE.Box3().setFromObject(clonedGarage);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Debug: Uncomment for debugging
      // console.log('Garage loaded - BEFORE positioning:');
      // console.log('  visible:', clonedGarage.visible);
      // console.log('  originalCenter x:', center.x.toFixed(3), 'y:', center.y.toFixed(3), 'z:', center.z.toFixed(3));
      // console.log('  originalSize x:', size.x.toFixed(3), 'y:', size.y.toFixed(3), 'z:', size.z.toFixed(3));
      // console.log('  children:', clonedGarage.children.length);

      // Calculate if garage needs centering or scaling
      const needsCentering = Math.abs(center.x) > 1 || Math.abs(center.y) > 1 || Math.abs(center.z) > 1;
      const isTooLarge = size.x > 20 || size.y > 20 || size.z > 20;
      const isTooSmall = size.x < 0.1 || size.y < 0.1 || size.z < 0.1;

      // Try positioning at origin first
      clonedGarage.position.set(0, 0, 0);

      // Scale the garage to ensure it fills the viewport (make it larger to cover full view)
      let scale = 1;
      if (isTooLarge) {
        scale = 15 / Math.max(size.x, size.y, size.z);
        // Debug: Uncomment for debugging
        // console.log('Garage is too large, scaling down by:', scale.toFixed(3));
      } else if (isTooSmall) {
        scale = 15 / Math.min(size.x, size.y, size.z);
        // Debug: Uncomment for debugging
        // console.log('Garage is too small, scaling up by:', scale.toFixed(3));
      } else {
        // If size is reasonable, scale it up slightly to ensure full coverage
        scale = 15 / Math.max(size.x, size.y, size.z);
        // Debug: Uncomment for debugging
        // console.log('Scaling garage to ensure full viewport coverage:', scale.toFixed(3));
      }
      clonedGarage.scale.set(scale, scale, scale);
      clonedGarage.visible = true;

      // If the garage is far from origin, center it (after scaling)
      if (needsCentering) {
        // Debug: Uncomment for debugging
        // console.log('Garage is far from origin, centering it...');
        // Recalculate center after scaling
        const scaledBox = new THREE.Box3().setFromObject(clonedGarage);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        clonedGarage.position.set(-scaledCenter.x, -scaledCenter.y, -scaledCenter.z);
      }

      // Configure shadows and ensure visibility
      // Make garage static (doesn't move/rotate with camera)
      clonedGarage.matrixAutoUpdate = false;
      clonedGarage.updateMatrix();

      clonedGarage.traverse((child) => {
        child.visible = true;
        child.frustumCulled = false; // Disable frustum culling to ensure it's always rendered

        if (child instanceof THREE.Mesh) {
          // Allow garage to cast shadows for more realism (but minimal impact)
          child.castShadow = false;
          child.receiveShadow = true;

          // Ensure materials render properly and are visible
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial ||
                  mat instanceof THREE.MeshPhysicalMaterial ||
                  mat instanceof THREE.MeshBasicMaterial) {
                mat.needsUpdate = true;
                // Ensure material is not transparent
                if ('opacity' in mat) {
                  mat.opacity = 1.0;
                  mat.transparent = false;
                }
                // Ensure material is not emissive-only (which would make it invisible in some lighting)
                if ('emissive' in mat && mat.emissive) {
                  // Keep emissive but ensure base color is visible
                }
              }
            });
          }
        }
      });

      // Recalculate bounding box after positioning (for debugging if needed)
      // const newBox = new THREE.Box3().setFromObject(clonedGarage);
      // const newSize = newBox.getSize(new THREE.Vector3());
      // const newCenter = newBox.getCenter(new THREE.Vector3());

      // Debug: Uncomment for debugging
      // console.log(`Garage has ${meshCount} mesh objects`);
      // console.log('Garage after centering:');
      // console.log('  position x:', clonedGarage.position.x.toFixed(3), 'y:', clonedGarage.position.y.toFixed(3), 'z:', clonedGarage.position.z.toFixed(3));
      // console.log('  newCenter x:', newCenter.x.toFixed(3), 'y:', newCenter.y.toFixed(3), 'z:', newCenter.z.toFixed(3));
      // console.log('  newSize x:', newSize.x.toFixed(3), 'y:', newSize.y.toFixed(3), 'z:', newSize.z.toFixed(3));
      // console.log('  scale:', clonedGarage.scale.x.toFixed(3));
      //
      // // Check if garage is visible from camera position [5, 3, 5]
      // const cameraPos = new THREE.Vector3(5, 3, 5);
      // const distance = cameraPos.distanceTo(newCenter);
      // console.log('  distance from camera:', distance.toFixed(3));
      // console.log('  camera position x:', cameraPos.x, 'y:', cameraPos.y, 'z:', cameraPos.z);
    }
  }, [clonedGarage]);

  if (!clonedGarage) {
    // Debug: Uncomment for debugging
    // console.log('Garage: clonedGarage is null');
    return null;
  }

  // Ensure the garage is added to the scene
  // Use the cloned garage directly without wrapping in group
  return (
    <primitive
      object={clonedGarage}
      ref={garageRef}
      renderOrder={-1} // Render garage before car
    />
  );
}

function Scene({ tireName, onLoadComplete, brightness = 1.0, controlsRef, threeDModel }: { tireName: string; onLoadComplete?: () => void; brightness?: number; controlsRef?: React.RefObject<{ dollyTo: (distance: number, animate: boolean) => void; target: THREE.Vector3; update: () => void } | null>; threeDModel?: string | null }) {
  const { gl } = useThree();
  const [modelsLoaded, setModelsLoaded] = React.useState({ garage: false, car: false, tires: false });
  const onLoadCompleteRef = React.useRef(onLoadComplete);
  const hasCalledCompleteRef = React.useRef(false);

  // Set clear color to match garage background and ensure full coverage
  React.useEffect(() => {
    gl.setClearColor("#e8e8e8", 1); // Light gray to match garage interior
    gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
  }, [gl]);

  // Update ref when onLoadComplete changes
  React.useEffect(() => {
    onLoadCompleteRef.current = onLoadComplete;
  }, [onLoadComplete]);

  // Track when models are loaded - show viewer as soon as car loads, don't wait for tires
  React.useEffect(() => {
    // Show viewer as soon as car loads (most important), don't wait for tires
    if (modelsLoaded.garage && modelsLoaded.car && onLoadCompleteRef.current && !hasCalledCompleteRef.current) {
      hasCalledCompleteRef.current = true;
      // Small delay to ensure everything is rendered
      const timer = setTimeout(() => {
        onLoadCompleteRef.current?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modelsLoaded.garage, modelsLoaded.car]); // Only wait for garage and car

  // Add a timeout fallback - if loading takes too long, show anyway
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasCalledCompleteRef.current && onLoadCompleteRef.current) {
        hasCalledCompleteRef.current = true;
        onLoadCompleteRef.current?.();
      }
    }, 5000); // 5 second timeout - show viewer even if models aren't fully loaded

    return () => clearTimeout(timeout);
  }, []);

  // Calculate brightness multipliers
  const brightnessMultiplier = brightness || 1.0;

  return (
    <>
      {/* Improved lighting for better visibility of car and tire details - brightness adjustable */}
      <ambientLight intensity={1.5 * brightnessMultiplier} color="#ffffff" />
      <directionalLight
        position={[10, 8, 5]}
        intensity={2.5 * brightnessMultiplier}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 6, -3]} intensity={1.2 * brightnessMultiplier} color="#ffffff" />
      <directionalLight position={[0, 10, 0]} intensity={1.5 * brightnessMultiplier} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={1.0 * brightnessMultiplier} color="#ffffff" />
      <pointLight position={[5, 4, 5]} intensity={0.8 * brightnessMultiplier} color="#ffffff" />
      <pointLight position={[-5, 4, -5]} intensity={0.8 * brightnessMultiplier} color="#ffffff" />

      {/* Skybox background planes to ensure full coverage from all angles */}
      <group renderOrder={-2}>
        {/* Back wall */}
        <mesh position={[0, 0, -20]} renderOrder={-2}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#e8e8e8" side={THREE.FrontSide} depthWrite={false} />
        </mesh>
        {/* Left wall */}
        <mesh position={[-20, 0, 0]} rotation={[0, Math.PI / 2, 0]} renderOrder={-2}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#e8e8e8" side={THREE.FrontSide} depthWrite={false} />
        </mesh>
        {/* Right wall */}
        <mesh position={[20, 0, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={-2}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#e8e8e8" side={THREE.FrontSide} depthWrite={false} />
        </mesh>
        {/* Top */}
        <mesh position={[0, 20, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-2}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#e8e8e8" side={THREE.FrontSide} depthWrite={false} />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -20, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={-2}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="#e8e8e8" side={THREE.FrontSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Garage 3D Background - loaded first so it appears behind the car */}
      <group renderOrder={0}>
        <Suspense fallback={null}>
          <GarageBackground onLoad={() => setModelsLoaded(prev => ({ ...prev, garage: true }))} />
        </Suspense>
      </group>

      {/* Ford Ranger with selected tire - render after garage */}
      <group renderOrder={1}>
        <Suspense fallback={null}>
          <FordRangerWithTires
            tireName={tireName}
            onCarLoad={() => setModelsLoaded(prev => ({ ...prev, car: true }))}
            onTiresLoad={() => setModelsLoaded(prev => ({ ...prev, tires: true }))}
            threeDModel={threeDModel}
          />
        </Suspense>
      </group>

      {/* Camera controls - restricted to right side only and 45 degrees up to show only the good viewing angle */}
      <OrbitControls
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={controlsRef as React.RefObject<any>}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        panSpeed={0.8} // Pan speed multiplier (0.8 = slightly slower for better control)
        screenSpacePanning={true} // Pan in screen space (easier to control)
        keyPanSpeed={7.0} // Keyboard pan speed (arrow keys)
        minPolarAngle={Math.PI / 6} // Prevent upside-down view (30 degrees from horizontal, looking down)
        maxPolarAngle={Math.PI / 2 - Math.PI / 12} // Prevent looking from below (75 degrees from horizontal, looking up)
        minAzimuthAngle={Math.PI / 3} // Start from 60 degrees (between front and right side)
        maxAzimuthAngle={Math.PI / 2} // End at right side (90 degrees, straight right)
        target={[0, 0, 0]} // Explicitly set target to origin where car is centered
        // Panning: Middle mouse button or right-click + drag to move the view
        // Pan limits to keep the car in view (optional - can be adjusted)
        // maxPolarAngle and other limits keep viewing angle restricted
        // This allows rotation only on the right side, excluding the front view
        // Prevents upside-down viewing and looking from below
      />

      <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />
    </>
  );
}

// Loading indicator component for Suspense fallback
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white/90 rounded-lg shadow-lg">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div
            className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
        </div>
        <p className="text-base font-medium text-gray-700">Loading 3D Model...</p>
      </div>
    </Html>
  );
}

// Empty state component when no 3D model is available
function EmptyState() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-5 p-10 bg-white/90 rounded-lg shadow-lg max-w-lg">
        <div className="text-7xl">🎯</div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No 3D Model Available
          </h3>
          <p className="text-base text-gray-600">
            This product doesn&apos;t have a 3D model uploaded yet. Please check back later or contact support for more information.
          </p>
        </div>
      </div>
    </Html>
  );
}

// Control bar component
function ControlBar({
  brightness,
  onBrightnessChange,
  onZoomIn,
  onZoomOut,
  onReset,
  hasReferencePanel = false
}: {
  brightness: number;
  onBrightnessChange: (value: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  hasReferencePanel?: boolean;
}) {
  return (
    <div
      className="absolute bottom-0 left-0 bg-black/80 backdrop-blur-sm border-t border-white/10"
      style={{ right: hasReferencePanel ? '320px' : '0' }}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-6">
        {/* Panning Hint */}
        <div className="hidden lg:flex items-center gap-2 text-white/60 text-xs">
          <span>🖱️ Right-click or Middle-click + drag to pan</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="default"
            onClick={onZoomOut}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            aria-label="Zoom out"
          >
            <IconZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-white text-base font-medium">Zoom</span>
          <Button
            variant="ghost"
            size="default"
            onClick={onZoomIn}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            aria-label="Zoom in"
          >
            <IconZoomIn className="h-5 w-5" />
          </Button>
        </div>

        {/* Reset Button */}
        <Button
          variant="ghost"
          size="default"
          onClick={onReset}
          className="text-white hover:bg-white/20 h-10"
          aria-label="Reset view"
        >
          <IconRotateClockwise className="h-5 w-5 mr-2" />
          Reset
        </Button>

        {/* Brightness Control */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <IconBrightness className="h-5 w-5 text-white" />
          <span className="text-white text-base font-medium min-w-[100px]">Brightness</span>
          <Slider
            value={[brightness * 100]}
            min={50}
            max={200}
            step={5}
            onValueChange={(values) => onBrightnessChange(values[0] / 100)}
            className="flex-1"
          />
          <span className="text-white text-base font-medium min-w-[45px] text-right">
            {Math.round(brightness * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Disclaimer Component
function DisclaimerBanner() {
  return (
    <div className="absolute top-3 left-3 right-3 z-20 w-[calc(100%-320px)] bg-amber-500/90 backdrop-blur-sm border border-amber-400/50 rounded-lg p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <IconInfoCircle className="h-5 w-5 text-amber-900 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900 leading-relaxed">
            <strong>Disclaimer:</strong> This 3D model is for visual reference only. Detailed textures, colors, and exact dimensions may not be accurate.
            This tool is designed to help you visualize how the tire looks on the vehicle model and assist with your purchasing decision.
            Please refer to product specifications and images for accurate details.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reference Image Panel Component
function ReferenceImagePanel({ tireImage }: { tireImage?: string }) {
  if (!tireImage) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-sm border-l border-white/10 z-10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-white text-base font-semibold">Reference Image</h3>
      </div>
      <div className="flex-1 p-6 h-full flex flex-col items-between overflow-auto">
        <div className="relative w-full aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-white/10">
          <Image
            src={tireImage}
            alt="Tire Reference"
            fill
            className="object-contain"
            sizes="(max-width: 320px) 100vw, 320px"
          />
        </div>
        <div className="mt-auto p-5 bg-zinc-800 rounded-lg overflow-hidden border border-white/10">
        <h3 className="text-white text-base font-semibold mb-4">Model Parameters</h3>
        <div className="space-y-3">
          <div className="flex text-base items-center justify-between">
          <span className='text-gray-300'>Triangles: </span>
          <span className='text-white font-medium'>80k</span>
        </div>
        <div className="flex text-base items-center justify-between">
          <span className='text-gray-300'>Quality: </span>
          <span className='text-white font-medium'>Standard</span>
        </div>
        <div className="flex text-base items-center justify-between">
          <span className='text-gray-300'>Texture: </span>
          <span className='text-white font-medium'>No Texture</span>
        </div>
        <div className="flex text-base items-center justify-between">
          <span className='text-gray-300'>Size: </span>
          <span className='text-white font-medium'>120MB</span>
        </div>
        </div>
      </div>
      </div>

    </div>
  );
}

export function Tire3DViewer({ tireName, tireImage, threeDModel }: Tire3DViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<Error | null>(null);
  const [brightness, setBrightness] = React.useState(1.0);

  // Timeout fallback - hide loading after max 8 seconds
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  // Check if model URL is accessible before loading
  React.useEffect(() => {
    const tirePath = getTireModelPath(tireName, threeDModel);
    if (tirePath && tirePath.startsWith('http')) {
      // Check if S3 URL is accessible (async check)
      fetch(tirePath, { method: 'HEAD' })
        .then((response) => {
          if (!response.ok && response.status === 403) {
            setLoadError(new Error('3D model file is not publicly accessible (403 Forbidden). Please check S3 bucket permissions.'));
            setIsLoading(false);
          }
        })
        .catch(() => {
          // CORS or network error - will show when GLTF loader fails
        });
    }
  }, [tireName, threeDModel]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Check if 3D model is available
  const hasModel = getTireModelPath(tireName, threeDModel) !== null;

  const handleZoomIn = () => {
    if (cameraRef.current) {
      // Calculate direction from camera to origin (target)
      const target = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3()
        .subVectors(cameraRef.current.position, target)
        .normalize();
      const currentDistance = cameraRef.current.position.distanceTo(target);
      const newDistance = Math.max(3, currentDistance * 0.9);
      // Move camera closer along the same direction
      cameraRef.current.position.copy(target).add(direction.multiplyScalar(newDistance));
      // Force controls to update
      if (controlsRef.current?.update) {
        controlsRef.current.update();
      }
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      // Calculate direction from camera to origin (target)
      const target = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3()
        .subVectors(cameraRef.current.position, target)
        .normalize();
      const currentDistance = cameraRef.current.position.distanceTo(target);
      const newDistance = Math.min(20, currentDistance * 1.1);
      // Move camera farther along the same direction
      cameraRef.current.position.copy(target).add(direction.multiplyScalar(newDistance));
      // Force controls to update
      if (controlsRef.current?.update) {
        controlsRef.current.update();
      }
    }
  };

  const handleReset = () => {
    if (cameraRef.current) {
      // Reset camera position
      cameraRef.current.position.set(5, 3, 5);
      // Reset controls target if available
      if (controlsRef.current?.target) {
        controlsRef.current.target.set(0, 0, 0);
      }
      // Force controls to update
      if (controlsRef.current?.update) {
        controlsRef.current.update();
      }
    }
  };

  return (
    <div className="relative w-full h-[800px] rounded-lg overflow-hidden flex" style={{ backgroundColor: '#e8e8e8' }}>
      {/* 3D Viewer Container - takes remaining space */}
      <div className="flex-1 relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-lg shadow-lg">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div
                  className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                ></div>
              </div>
              <p className="text-base font-medium text-gray-700">Loading 3D Model...</p>
              <p className="text-sm text-gray-500">Please wait</p>
            </div>
          </div>
        )}

        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: false, // Disable alpha to avoid black artifacts
            powerPreference: "high-performance"
          }}
          camera={{ position: [5, 3, 5], fov: 50 }}
          onCreated={({ camera }) => {
            cameraRef.current = camera as THREE.PerspectiveCamera;
            // Ensure camera looks at the origin where car is centered
            camera.lookAt(0, 0, 0);
          }}
        >
          {loadError ? (
          <Html center>
            <div className="flex flex-col items-center justify-center gap-5 p-10 bg-white/90 rounded-lg shadow-lg max-w-lg">
              <div className="text-7xl">⚠️</div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Model Loading Error
                </h3>
                <p className="text-base text-gray-600 mb-4">
                  {loadError.message || 'Failed to load 3D model. The file may not be publicly accessible.'}
                </p>
                <p className="text-sm text-gray-500">
                  Error: 403 Forbidden - Please check S3 bucket permissions or contact support.
                </p>
              </div>
            </div>
          </Html>
        ) : hasModel ? (
            <Suspense fallback={<Loader />}>
              <Scene
                tireName={tireName}
                onLoadComplete={() => setIsLoading(false)}
                brightness={brightness}
                controlsRef={controlsRef}
                threeDModel={threeDModel}
              />
            </Suspense>
          ) : (
            <EmptyState />
          )}
        </Canvas>

        {/* Control Bar - only show if model is available */}
        {!isLoading && hasModel && (
          <ControlBar
            brightness={brightness}
            onBrightnessChange={setBrightness}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            hasReferencePanel={!!tireImage}
          />
        )}
      </div>

      {/* Reference Image Panel */}
      {!isLoading && <ReferenceImagePanel tireImage={tireImage} />}

      {/* Disclaimer Banner */}
      {!isLoading && <DisclaimerBanner />}
    </div>
  );
}


