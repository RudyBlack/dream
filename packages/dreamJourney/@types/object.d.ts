export interface ResObjectData {
  [uuid: string]: ObjectData;
}

export interface ObjectData {
  uuid: string;
  type: string;
  position: number[];
  path?: string;
  scale: number[];
  rotation: (string | number | undefined)[];
  opacity: number;
}
