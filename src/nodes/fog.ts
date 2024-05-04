import { color, float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

import { Object3D, PerspectiveCamera, Scene } from 'three';

import {
  buffer,
  BufferNode,
  fog,
  modelPosition,
  NodeBuilder,
  positionView,
  positionWorld,
  range,
  RangeNode,
  timerLocal,
  triNoise3D,
} from 'three/examples/jsm/nodes/Nodes';

export const sceneFogNode = (camera: PerspectiveCamera) => {
  const timer = timerLocal(0.5);

  const fogNoiseA = triNoise3D(modelPosition, 0.01, 0);
  const fogNoiseC = triNoise3D(positionWorld.mul(0.01), 0.3, timer).add(color(0x2c6a99));

  return fog(fogNoiseA, fogNoiseC);
};
