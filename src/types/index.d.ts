// Add your global TypeScript types here

// Example type
export interface GeoJsonData {
  type: string;
  features: Array<{
    type: string;
    properties: {
      name: string;
    };
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }>;
}

export interface Root {
  type: string;
  bbox: number[];
  transform: Transform;
  objects: Objects;
  arcs: number[][][];
}

export interface Transform {
  scale: number[];
  translate: number[];
}

export interface Objects {
  counties: Counties;
  states: States;
  nation: Nation;
}

export interface Counties {
  type: string;
  geometries: Geometry[];
}

export interface Geometry {
  type: string;
  arcs: any[][];
  id: string;
  properties: Properties;
}

export interface Properties {
  name: string;
}

export interface States {
  type: string;
  geometries: Geometry2[];
}

export interface Geometry2 {
  type: string;
  arcs: number[][][];
  id: string;
  properties: Properties2;
}

export interface Properties2 {
  name: string;
}

export interface Nation {
  type: string;
  geometries: Geometry3[];
}

export interface Geometry3 {
  type: string;
  arcs: number[][][];
}
