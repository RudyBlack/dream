import { color, float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

import { PerspectiveCamera } from 'three';

import {
  fog,
  modelPosition,
  normalWorld,
  positionView,
  positionWorld,
  timerLocal,
  triNoise3D,
} from 'three/examples/jsm/nodes/Nodes';

export const sceneFogNode = (camera: PerspectiveCamera) => {
  const timer = timerLocal(0.5);

  const fogNoiseA = triNoise3D(modelPosition, 0.01, 0);
  const fogNoiseC = triNoise3D(positionWorld.mul(0.01), 0.3, timer).add(color(0x2c6a99));

  return fog(fogNoiseA, fogNoiseC);
};

export const sceneFogNode2 = (camera: PerspectiveCamera) => {
  const skyColor = color(0xf0f5f5);
  const groundColor = color(0xd0dee7);

  const fogNoiseDistance = positionView.z.negate().smoothstep(0, camera.far - 300);

  const distance = fogNoiseDistance.mul(20).max(4);
  const alpha = 0.98;
  const groundFogArea = float(distance).sub(positionWorld.y).div(distance).pow(3).saturate().mul(alpha);

  // a alternative way to create a TimerNode
  const timer = timerLocal();

  const fogNoiseA = triNoise3D(positionWorld.mul(0.005), 0.2, timer);
  const fogNoiseB = triNoise3D(positionWorld.mul(0.01), 0.2, timer.mul(1.2));

  const fogNoise = fogNoiseA.add(fogNoiseB).mul(groundColor);

  // apply custom fog

  return {
    fogNode: fog(fogNoiseDistance.oneMinus().mix(groundColor, fogNoise), groundFogArea),
    backgroundNode: normalWorld.y.max(0).mix(groundColor, skyColor),
  };
};
