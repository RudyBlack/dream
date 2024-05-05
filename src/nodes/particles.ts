import * as THREE from 'three';
import {
  attribute,
  color,
  ComputeNode,
  instanceIndex,
  PointsNodeMaterial,
  storage,
  StorageBufferNode,
  tslFn,
  uniform,
  vec2,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';

// @ts-ignore
import StorageInstancedBufferAttribute from 'three/addons/renderers/common/StorageInstancedBufferAttribute.js';

import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

export const particles = () => {
  const particleNum = 100;
  const particleSize = 2; // vec2

  const particleBuffer = new StorageInstancedBufferAttribute(particleNum, particleSize);
  const velocityBuffer = new StorageInstancedBufferAttribute(particleNum, particleSize);

  const particleBufferNode = storage(particleBuffer, 'vec2', particleNum);
  const velocityBufferNode = storage(velocityBuffer, 'vec2', particleNum);

  const pointerVector = new THREE.Vector2(-5, 5); // Out of bounds first
  const scaleVector = new THREE.Vector2(10, 10);

  // @ts-ignore
  const computeShaderFn = tslFn(() => {
    // create buffers

    const particle = particleBufferNode.element(instanceIndex);
    const velocity = velocityBufferNode.element(instanceIndex);

    const limit = uniform(scaleVector);

    //temp 함수는 셰이더 로직 내에서 특정 연산을 수행하기 위해 임시 변수를 생성하고, 이 변수를 통해 다양한 셰이더 연산을 체인(chain) 방식으로 적용할 수 있게 해줍니다.
    const position = particle.add(velocity).temp();

    velocity.x = position.x.abs().greaterThanEqual(limit.x).cond(velocity.x.negate(), velocity.x);
    velocity.y = position.y.abs().greaterThanEqual(limit.y).cond(velocity.y.negate(), velocity.y);

    position.assign(position.min(limit).max(limit.negate()));

    const pointer = uniform(pointerVector);
    // const pointerSize = 0.1;
    // const distanceFromPointer = pointer.sub(position).length();

    particle.assign(position);
  });

  // @ts-ignore
  const computeNode = computeShaderFn().compute(particleNum);
  computeNode.onInit = ({ renderer }: { renderer: WebGPURenderer }) => {
    // @ts-ignore
    const precomputeShaderNode = tslFn(() => {
      const particleIndex = float(instanceIndex);

      const randomAngle = particleIndex.mul(0.005).mul(Math.PI * 2);
      const randomSpeed = particleIndex.mul(0.00001).add(0.0000001);

      const velX = randomAngle.sin().mul(randomSpeed);
      const velY = randomAngle.cos().mul(randomSpeed);

      const velocity = velocityBufferNode.element(instanceIndex);
      velocity.xy = vec2(velX, velY);
    });
    // @ts-ignore
    renderer.compute(precomputeShaderNode().compute(particleNum));
  };

  const particleNode = attribute('particle', 'vec2');

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3)); // single vertex ( not triangle )
  pointsGeometry.setAttribute('particle', particleBuffer); // dummy the position points as instances
  pointsGeometry.drawRange.count = 1; // force render points as instances ( not triangle )

  const pointsMaterial = new PointsNodeMaterial();
  pointsMaterial.colorNode = particleNode.add(color(0xffffff));
  pointsMaterial.positionNode = particleNode;

  const mesh = new THREE.Points(pointsGeometry, pointsMaterial);
  // @ts-ignore
  mesh.isInstancedMesh = true;
  // @ts-ignore
  mesh.count = particleNum;

  return { mesh, computeNode };
};
