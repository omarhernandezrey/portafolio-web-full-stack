import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// Tipos específicos para el componente Lanyard
export interface LanyardGLTF extends GLTF {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
  };
}

// Tipo para RigidBody con métodos específicos de Rapier
export interface LanyardRigidBody {
  lerped?: THREE.Vector3;
  wakeUp(): void;
  setNextKinematicTranslation(translation: { x: number; y: number; z: number }): void;
  translation(): THREE.Vector3;
  rotation(): THREE.Euler;
  angvel(): THREE.Vector3;
  setAngvel(angvel: { x: number; y: number; z: number }): void;
}

// Tipos para eventos de puntero 3D
export interface ThreePointerEvent {
  point: THREE.Vector3;
  pointerId?: number;
  nativeEvent?: PointerEvent;
  target?: {
    setPointerCapture: (pointerId: number) => void;
    releasePointerCapture: (pointerId: number) => void;
    hasPointerCapture: (pointerId: number) => boolean;
  };
  stopPropagation?: () => void;
}

// Tipos para MeshLine (extendiendo los tipos existentes)
export interface MeshLineGeometryProps {
  attach?: string;
}

export interface MeshLineMaterialProps {
  color?: string | THREE.Color;
  depthTest?: boolean;
  resolution?: [number, number];
  useMap?: boolean;
  map?: THREE.Texture;
  repeat?: [number, number];
  lineWidth?: number;
  attach?: string;
}

// Tipos para componentes JSX personalizados ya están definidos en global.d.ts