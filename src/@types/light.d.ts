export interface ResLightData {
  [uuid: string]:
    | BaseLightData
    | HemisphereLightData
    | PointLightData
    | DirectionalLightData
    | SpotLightData;
}

interface BaseLightData {
  type: 'HemisphereLight' | 'PointLight' | 'DirectionalLight' | 'SpotLight';
  uuid: string;
  color: { r: number; g: number; b: number };
  position: number[];
  rotation: number[];
}

interface HemisphereLightData extends BaseLightData {
  type: 'HemisphereLight';
  groundColor: { r: number; g: number; b: number };
  intensity: number;
}

interface PointLightData extends BaseLightData {
  type: 'PointLight';
  distance: number;
  decay: number;
  power: number;
}

interface DirectionalLightData extends BaseLightData {
  type: 'DirectionalLight';
  intensity: number;
}

interface SpotLightData extends BaseLightData {
  type: 'SpotLight';
  decay: number;
  penumbra: number;
  power: number;
  intensity: number;
}
