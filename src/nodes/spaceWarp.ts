import * as THREE from 'three';
import { InstancedBufferAttribute } from 'three';
import {
  attribute,
  color,
  cos,
  instanceIndex,
  PointsNodeMaterial,
  sin,
  storage,
  tan,
  timerLocal,
  tslFn,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

/**
 * TODO
 * v 원 여러개
 * v 2차원이 아니라 3차원으로
 * 카메라 뒤로 넘어가면 반복되도록
 *
 * v 여기서 원 여러개 meshs, compute를 export
 */

export const spaceWarp = () => {
  const pointNum = 360;
  const particleSize = 3; // vec3

  const pointBuffer = new InstancedBufferAttribute(new Float32Array(pointNum * particleSize), particleSize) as never;
  const velocityBuffer = new InstancedBufferAttribute(new Float32Array(pointNum * particleSize), particleSize) as never;

  const particleBufferNode = storage(pointBuffer, 'vec3', pointNum);
  const velocityBufferNode = storage(velocityBuffer, 'vec3', pointNum);

  //@ts-ignore
  const computeShaderFn = tslFn(() => {
    const particle = particleBufferNode.element(instanceIndex);
    const velocity = velocityBufferNode.element(instanceIndex);

    // 가속도 정의

    const timer = timerLocal();
    const position = particle.add(velocity.mul(timer)).temp();
    particle.assign(position);
  });

  //@ts-ignore
  const computeNode = computeShaderFn().compute(pointNum);

  computeNode.onInit = (param: never) => {
    const { renderer } = param;

    // @ts-ignore
    const precomputeShaderNode = tslFn(() => {
      const particleIndex = float(instanceIndex);

      const velocity = velocityBufferNode.element(instanceIndex);
      const velX = cos(particleIndex).mul(0.001);
      const velY = sin(particleIndex).mul(0.001);
      const velZ = tan(particleIndex).mul(0.001);

      velocity.xyz = vec3(velX, velY, 0.01);
    });

    // @ts-ignore
    renderer.compute(precomputeShaderNode().compute(pointNum));
  };

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3)); // single vertex ( not triangle )
  pointsGeometry.setAttribute('particle', pointBuffer); // dummy the position points as instances
  // pointsGeometry.drawRange.count = 1; // force render points as instances ( not triangle )

  const particleNode = attribute('particle', 'vec3');

  const pointsMaterial = new PointsNodeMaterial();
  pointsMaterial.colorNode = particleNode.add(color(0xffffff));
  pointsMaterial.positionNode = particleNode;

  const mesh = new THREE.Points(pointsGeometry, pointsMaterial);
  // @ts-ignore
  mesh.isInstancedMesh = true;
  // @ts-ignore
  mesh.count = pointNum;

  return { mesh, computeNode };
};

export const spaceWrapPoints = () => {
  const wrapMeshes: THREE.Points[] = [];
  const wrapComputeNodes = [];

  for (let i = 0; i < 10; i++) {
    const { mesh, computeNode } = spaceWarp();
    mesh.scale.set(i * 2, i * 2, i);
    wrapMeshes.push(mesh);
    wrapComputeNodes.push(computeNode);
  }

  return { wrapMeshes, wrapComputeNodes };
};
