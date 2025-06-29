"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import { ThreePointerEvent } from "../../types/three-types";

extend({ MeshLineGeometry, MeshLineMaterial });

const cardGLB = "/Lanyard/card.glb";

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
}

function Band({ maxSpeed = 50, minSpeed = 0 }: BandProps) {
  const band = useRef<THREE.Mesh<MeshLineGeometry>>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: Omit<RigidBodyProps, 'type'> = {
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(cardGLB) as any;
  const texture = useTexture("/Lanyard/lanyard.png");
  
  // 🎨 Texturas personalizadas del carnet
  const [carnetFrontTexture, carnetBackTexture] = useTexture([
    "/Lanyard/carnet1.png", // Cara frontal
    "/Lanyard/carnet2.png"  // Cara trasera
  ]);
  
  // 🔧 Configuración de texturas mejorada
  useEffect(() => {
    // Configurar textura frontal
    carnetFrontTexture.flipY = false;
    carnetFrontTexture.needsUpdate = true;
    carnetFrontTexture.wrapS = THREE.ClampToEdgeWrapping;
    carnetFrontTexture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Hacer la imagen un poquitito más pequeña y estirada hacia abajo
    const frontScale = 1.7; // Escala horizontal (un poco más pequeña)
    const frontScaleY = 1.3; // Escala vertical (menor = más estirada hacia abajo)
    carnetFrontTexture.repeat.set(frontScale, frontScaleY);
    carnetFrontTexture.offset.set(0.08, -0.002); // Ajuste casi imperceptible hacia arriba
    
    // Ajustar el brillo y contraste de la textura
    carnetFrontTexture.minFilter = THREE.LinearFilter;
    carnetFrontTexture.magFilter = THREE.LinearFilter;
    
    if ('colorSpace' in carnetFrontTexture) {
      (carnetFrontTexture as any).colorSpace = THREE.SRGBColorSpace;
    }
    
    // Configurar textura trasera
    carnetBackTexture.flipY = false;
    carnetBackTexture.needsUpdate = true;
    carnetBackTexture.wrapS = THREE.ClampToEdgeWrapping;
    carnetBackTexture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Hacer la imagen un poquitito más pequeña y estirada hacia abajo
    const backScale = 1.7; // Escala horizontal (un poco más pequeña)
    const backScaleY = 1.3; // Escala vertical (menor = más estirada hacia abajo)
    carnetBackTexture.repeat.set(backScale, backScaleY);
    carnetBackTexture.offset.set(0.08, -0.002); // Ajuste casi imperceptible hacia arriba
    
    // Ajustar el brillo y contraste de la textura
    carnetBackTexture.minFilter = THREE.LinearFilter;
    carnetBackTexture.magFilter = THREE.LinearFilter;
    
    if ('colorSpace' in carnetBackTexture) {
      (carnetBackTexture as any).colorSpace = THREE.SRGBColorSpace;
    }
  }, [carnetFrontTexture, carnetBackTexture]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  const [isSmall, setIsSmall] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
             ('ontouchstart' in window) || 
             (navigator.maxTouchPoints > 0);
    }
    return false;
  });

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmall(window.innerWidth < 1024);
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 ('ontouchstart' in window) || 
                 (navigator.maxTouchPoints > 0));
    };

    const preventDefaultTouch = (e: TouchEvent) => {
      if (isMobile && dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const preventDefaultWheel = (e: WheelEvent) => {
      if (isMobile && dragged) {
        e.preventDefault();
      }
    };

    window.addEventListener("resize", handleResize);
    if (isMobile) {
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
      document.addEventListener('wheel', preventDefaultWheel, { passive: false });
    }
    
    return (): void => {
      window.removeEventListener("resize", handleResize);
      if (isMobile) {
        document.removeEventListener('touchmove', preventDefaultTouch);
        document.removeEventListener('wheel', preventDefaultWheel);
      }
    };
  }, [isMobile, dragged]);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      [j1, j2].forEach((ref) => {
        if (ref.current && !ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation()
          );
        }
        if (ref.current && ref.current.lerped) {
          const clampedDistance = Math.max(
            0.1,
            Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
          );
          ref.current.lerped.lerp(
            ref.current.translation(),
            delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
          );
        }
      });
      if (j1.current?.lerped && j2.current?.lerped) {
        curve.points[0].copy(j3.current.translation());
        curve.points[1].copy(j2.current.lerped);
        curve.points[2].copy(j1.current.lerped);
        curve.points[3].copy(fixed.current.translation());
        band.current.geometry.setPoints(curve.getPoints(32));
        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody
          ref={fixed}
          {...segmentProps}
          type={"fixed" as RigidBodyProps["type"]}
        />
        <RigidBody
          position={[0.5, 0, 0]}
          ref={j1}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1, 0, 0]}
          ref={j2}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.5, 0, 0]}
          ref={j3}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={
            dragged
              ? ("kinematicPosition" as RigidBodyProps["type"])
              : ("dynamic" as RigidBodyProps["type"])
          }
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.75}
            position={[0, -1.8, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreePointerEvent) => {
              e.stopPropagation?.();
              if (e.nativeEvent && !e.nativeEvent.defaultPrevented) {
                try { e.nativeEvent.preventDefault(); } catch {}
              }
              const pointerId = e.pointerId ?? e.nativeEvent?.pointerId ?? 0;
              if (e.target?.hasPointerCapture && e.target.hasPointerCapture(pointerId)) {
                e.target.releasePointerCapture(pointerId);
              }
              drag(false);
            }}
            onPointerDown={(e: ThreePointerEvent) => {
              e.stopPropagation?.();
              if (e.nativeEvent && !e.nativeEvent.defaultPrevented) {
                try { e.nativeEvent.preventDefault(); } catch {}
              }
              
              if (e.target?.setPointerCapture) {
                const pointerId = e.pointerId ?? e.nativeEvent?.pointerId ?? 0;
                e.target.setPointerCapture(pointerId);
              }
              
              if (card.current) {
                const cardPosition = card.current.translation();
                drag(
                  new THREE.Vector3()
                    .copy(e.point)
                    .sub(cardPosition)
                );
              }
            }}
            onPointerMove={(e: ThreePointerEvent) => {
              if (dragged) {
                e.stopPropagation?.();
                if (e.nativeEvent && !e.nativeEvent.defaultPrevented) {
                  try { e.nativeEvent.preventDefault(); } catch {}
                }
              }
            }}
          >
            {/* Cara FRONTAL */}
            <mesh 
              geometry={nodes.card.geometry}
              renderOrder={2}
            >
              <meshBasicMaterial
                map={carnetFrontTexture}
                side={THREE.FrontSide}
                transparent={false}
                depthWrite={true}
                depthTest={true}
                toneMapped={false}
              />
            </mesh>
            
            {/* Cara TRASERA */}
            <mesh 
              geometry={nodes.card.geometry}
              rotation={[0, Math.PI, 0]}
              renderOrder={1}
            >
              <meshBasicMaterial
                map={carnetBackTexture}
                side={THREE.FrontSide}
                transparent={false}
                depthWrite={true}
                depthTest={true}
                toneMapped={false}
              />
            </mesh>
            
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        {/* @ts-expect-error - MeshLine components not in types */}
        <meshLineGeometry />
        {/* @ts-expect-error - MeshLine components not in types */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [512, 1024] : isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={0.4}
        />
      </mesh>
    </>
  );
}

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export default function LanyardFinal({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}: LanyardProps) {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      ('ontouchstart' in window) || 
                      (navigator.maxTouchPoints > 0);
      setIsMobileDevice(isMobile);
    };
    
    checkMobile();
  }, []);

  return (
    // @ts-ignore
    <div 
      className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center"
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <Canvas
        camera={{ position, fov }}
        gl={{ 
          alpha: transparent,
          antialias: !isMobileDevice,
          preserveDrawingBuffer: false,
          powerPreference: isMobileDevice ? "low-power" : "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2));
          
          if (isMobileDevice && gl.domElement) {
            gl.domElement.style.touchAction = 'none';
          }
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        <directionalLight position={[5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 10]} intensity={0.6} />
        <Physics 
          gravity={gravity} 
          timeStep={1 / 60} 
          paused={false}
          numSolverIterations={isMobileDevice ? 4 : 8}
          numAdditionalFrictionIterations={isMobileDevice ? 2 : 4}
        >
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={0.3}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={0.3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={0.3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={1}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    {/* @ts-ignore */}
    </div>
  );
}