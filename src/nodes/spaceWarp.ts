import * as THREE from 'three';
import { InstancedBufferAttribute, Vector3 } from 'three';
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
  uniform,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

/**
 * TODO
 * v 원 여러개
 * v 2차원이 아니라 3차원으로
 * v 카메라 뒤로 넘어가면 반복되도록
 * spaceWarp 파티클 시간이 지나도 일정하게 속도 유지되도록
 * v 여기서 원 여러개 meshs, compute를 export
 */

export const spaceWarp = (camera: THREE.PerspectiveCamera, scale: Vector3) => {
  const pointNum = 3600;
  const particleSize = 3; // vec3

  const cameraPosition = camera.position;

  const pointBuffer = new InstancedBufferAttribute(new Float32Array(pointNum * particleSize), particleSize) as never;
  const velocityBuffer = new InstancedBufferAttribute(new Float32Array(pointNum * particleSize), particleSize) as never;

  const particleBufferNode = storage(pointBuffer, 'vec3', pointNum);
  const velocityBufferNode = storage(velocityBuffer, 'vec3', pointNum);

  //@ts-ignore
  const computeShaderFn = tslFn(() => {
    const particle = particleBufferNode.element(instanceIndex);
    const velocity = velocityBufferNode.element(instanceIndex);
    const index = float(instanceIndex);

    const cameraPositionUniform = uniform(cameraPosition.z);

    const position = particle.add(velocity.mul(10).div(index.div(36000)));
    particle.assign(position.z.abs().greaterThan(cameraPositionUniform).cond(velocity, position));

    const particleIndex = float(instanceIndex);

    const velX = cos(particleIndex).mul(0.001);
    const velY = sin(particleIndex).mul(0.001);
    const velZ = 0.00005;

    velocity.assign(
      velocity.z.greaterThan(uniform(cameraPosition.z).mul(0.0001)).cond(vec3(velX, velY, velZ), velocity),
    );
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

      velocity.xyz = vec3(velX, velY, 0.00005);
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

  mesh.scale.set(0.3, 0.3, 0.3);

  return { mesh, computeNode };
};

export const spaceWarp2 = (camera: THREE.PerspectiveCamera) => {
  const pointNum = 360;
  const particleSize = 3; // vec3

  const cameraPosition = camera.position;

  const pointBuffer = new InstancedBufferAttribute(new Float32Array(pointNum * particleSize), particleSize) as never;
  const velocityBuffer = new InstancedBufferAttribute(new Float32Array(pointNum * particleSize), particleSize) as never;

  const particleBufferNode = storage(pointBuffer, 'vec3', pointNum);
  const velocityBufferNode = storage(velocityBuffer, 'vec3', pointNum);

  //@ts-ignore
  const computeShaderFn = tslFn(() => {
    const particle = particleBufferNode.element(instanceIndex);
    const velocity = velocityBufferNode.element(instanceIndex);

    const cameraPositionUniform = uniform(cameraPosition.z);

    const timer = timerLocal();

    const position = particle.add(velocity);
    particle.assign(position.z.abs().greaterThan(cameraPositionUniform.add(2)).cond(velocity, position));
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

  mesh.scale.set(0.3, 0.3, 0.3);

  return { mesh, computeNode };
};

export const spaceWrapPoints = (camera: THREE.PerspectiveCamera) => {
  const wrapMeshes: THREE.Points[] = [];
  const wrapComputeNodes = [];

  for (let i = 0; i < 10; i++) {
    const { mesh, computeNode } = spaceWarp2(camera);
    mesh.scale.set(i * 2, i * 2, i * 2);
    wrapMeshes.push(mesh);
    wrapComputeNodes.push(computeNode);
  }

  return { wrapMeshes, wrapComputeNodes };
};
