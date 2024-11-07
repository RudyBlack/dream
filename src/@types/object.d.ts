export interface OceanData {
  type: 'Ocean';
  uuid: string;
}

export interface Sky {
  type: 'Star';
}

export interface MoonData {
  type: 'Moon';
  uuid: string;
  position: number[];
  opacity: number;
  scale: number[];
}

export interface CloudData {
  type: 'Cloud';
  objects: CloudObject[];
}

export interface CloudObject {
  uuid: string;
  position: number[];
  path: string;
  scale: number[];
  rotation: number[];
}
