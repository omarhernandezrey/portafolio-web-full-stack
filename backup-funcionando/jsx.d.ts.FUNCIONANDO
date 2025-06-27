// Declaraciones JSX específicas para solucionar errores de div

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      canvas: React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      meshLineGeometry: any;
      meshLineMaterial: any;
      [elemName: string]: any;
    }
  }
}

// Declaración específica para Physics de Rapier
declare module '@react-three/rapier' {
  interface PhysicsProps {
    gravity?: [number, number, number];
    timeStep?: number;
    paused?: boolean;
    numSolverIterations?: number;
    numAdditionalFrictionIterations?: number;
    children?: React.ReactNode;
  }
  
  export function Physics(props: PhysicsProps): JSX.Element;
}

export {};