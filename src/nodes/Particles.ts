import * as THREE from 'three';
import {
  instanceIndex,
  storage,
  uniform,
  tslFn,
  vec3,
  If,
  texture,
  SpriteNodeMaterial,
  ShaderNodeObject,
  StorageBufferNode,
  UniformNode,
  ComputeNode,
} from 'three/examples/jsm/nodes/Nodes';

import { InstancedBufferAttribute, Mesh, PerspectiveCamera, Scene } from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';
// @ts-ignore
import StorageInstancedBufferAttribute from 'three/addons/renderers/common/StorageInstancedBufferAttribute.js';
import DreamJourney from '../core';

export class Particles {
  private readonly particleCount = 100;
  private readonly gravity = uniform(-0.0098);
  private readonly bounce = uniform(0.8);
  private readonly friction = uniform(0.99);
  private readonly size = uniform(0.12);
  private clickPosition = uniform(new THREE.Vector3());
  private camera: PerspectiveCamera;
  private renderer: WebGPURenderer;
  private root: DreamJourney;

  private static SPEED = 0.01;

  // public readonly computeUpdateFn: ShaderNodeObject<ComputeNode>;
  public readonly computeMouseHit: ShaderNodeObject<ComputeNode>;

  constructor(root: DreamJourney, scene: Scene, renderer: WebGPURenderer, camera: PerspectiveCamera) {
    this.root = root;
    this.renderer = renderer;
    this.camera = camera;
    const positionBuffer = this.createBuffer(this.particleCount);
    const velocityBuffer = this.createBuffer(this.particleCount);
    const colorBuffer = this.createBuffer(this.particleCount);

    const computeInitFn = this.computeInitFunction(positionBuffer, colorBuffer, this.particleCount);
    const computeUpdateFn = this.computeUpdateFunction(
      positionBuffer,
      velocityBuffer,
      this.gravity,
      this.friction,
      this.bounce,
      this.particleCount,
    );

    renderer.compute(computeInitFn);

    const particlesMesh = this.makeParticlesMesh(
      '/sprite1.png',
      positionBuffer,
      colorBuffer,
      this.size,
      this.particleCount,
    );

    scene.add(particlesMesh);

    this.computeMouseHit = this.computeMouseHitFunction(positionBuffer, velocityBuffer, this.particleCount);

    window.addEventListener('keydown', this.onParticleHitTriggerByKeyboard);
    root.on('renderBefore', () => {
      renderer.compute(computeUpdateFn);
    });
  }

  private onParticleHitTriggerByKeyboard = (event: KeyboardEvent) => {
    const renderer = this.renderer;
    const computeMouseHit = this.computeMouseHit;

    if (event.code === 'KeyA') {
      renderer.compute(computeMouseHit);
    }
  };

  private computeMouseHitFunction(
    positionBuffer: ShaderNodeObject<StorageBufferNode>,
    velocityBuffer: ShaderNodeObject<StorageBufferNode>,
    particleCount: number,
  ) {
    return tslFn(() => {
      const position = positionBuffer.element(instanceIndex);
      const velocity = velocityBuffer.element(instanceIndex);

      const dist = position.distance(this.clickPosition);
      const direction = position.sub(this.clickPosition).normalize();
      // 마우스 클릭 위치에서 100 유닛 이내의 거리에 있는 입자에만 영향을 미치도록 설정합니다. 입자가 100 유닛 이내에 있으면 distArea는 양수값을, 그 이상이면 0을 가집니다.
      // .max(0)은 float(6).sub(dist) 값과 0중에서 큰걸 리턴
      const distArea = float(100).sub(dist).max(0);

      const power = distArea.mul(Particles.SPEED);
      const relativePower = power.mul(float(instanceIndex).min(0).max(1).mul(0.5).add(0.5));

      velocity.assign(velocity.add(direction.mul(relativePower)));
    })().compute(particleCount);
  }

  /**
   * hash는 0,1 사이의 유사 랜덤값.
   * position.x = ranX.mul(100).add(-50)는 ranX가 0과 1의 유사 랜덤값이고 100을 곱하면 0,100 사이의 유사 랜덤값이 된다. 그 후 -50을 더하므로 그 결과는 -50과 50 사이의 랜덤값이다.
   * @param positionBuffer
   * @param colorBuffer
   * @param particleCount
   * @private
   */
  private computeInitFunction(
    positionBuffer: ShaderNodeObject<StorageBufferNode>,
    colorBuffer: ShaderNodeObject<StorageBufferNode>,
    particleCount: number,
  ) {
    return tslFn(() => {
      const position = positionBuffer.element(instanceIndex);
      const color = colorBuffer.element(instanceIndex);

      const ranX = instanceIndex.hash();
      const ranY = instanceIndex.add(2).hash();
      const ranZ = instanceIndex.add(3).hash();

      position.x = ranX.mul(100).add(-50); //position.x는 -50부터 +50 사이의 값으로 설정
      // @ts-ignore
      position.y = 0;
      position.z = ranZ.mul(100).add(-50);

      color.assign(vec3(ranX, ranY, ranZ));
    })().compute(particleCount);
  }

  private computeUpdateFunction(
    positionBuffer: ShaderNodeObject<StorageBufferNode>,
    velocityBuffer: ShaderNodeObject<StorageBufferNode>,
    gravity: ShaderNodeObject<UniformNode<number>>,
    friction: ShaderNodeObject<UniformNode<number>>,
    bounce: ShaderNodeObject<UniformNode<number>>,
    particleCount: number,
  ) {
    return tslFn(() => {
      const position = positionBuffer.element(instanceIndex);
      const velocity = velocityBuffer.element(instanceIndex);

      //이 코드는 속도 벡터에 중력을 y축 방향으로 적용한 후, 마찰 계수를 곱하여 전체 속도를 감속시킵니다.
      // velocity.assign(velocity.add(vec3(0.0, gravity, 0.0)).mul(friction));
      position.assign(position.add(velocity));

      If(position.y.lessThan(0), () => {
        // @ts-ignore
        position.y = 0;

        // y축 속도의 방향을 반대로 하고, 반발력을 곱하여 입자가 바닥에서 살짝 튀어오르도록 합니다.
        velocity.y = velocity.y.negate().mul(bounce);

        // x축과 z축의 속도를 감소시켜, 마찰로 인한 수평 방향의 속도 감소를 모방합니다.
        velocity.x = velocity.x.mul(0.9);
        velocity.z = velocity.z.mul(0.9);
      });
    })().compute(particleCount);
  }

  private makeParticlesMesh(
    texturePath: string,
    positionBuffer: ShaderNodeObject<StorageBufferNode>,
    colorBuffer: ShaderNodeObject<StorageBufferNode>,
    size: ShaderNodeObject<UniformNode<number>>,
    particleCount: number,
  ) {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load(texturePath);
    const textureNode = texture(map);

    const particleMaterial = new SpriteNodeMaterial();
    particleMaterial.colorNode = textureNode.mul(colorBuffer.element(instanceIndex));

    // @ts-ignore
    particleMaterial.positionNode = positionBuffer.toAttribute();
    particleMaterial.scaleNode = size;
    particleMaterial.depthWrite = false;
    particleMaterial.depthTest = true;
    particleMaterial.transparent = true;

    const particles = new Mesh(new THREE.PlaneGeometry(1, 1), particleMaterial);
    // @ts-ignore
    particles.isInstancedMesh = true;
    // @ts-ignore
    particles.count = particleCount;
    particles.frustumCulled = false;

    return particles;
  }

  private createBuffer(particleCount: number) {
    return storage(new StorageInstancedBufferAttribute(particleCount, 3), 'vec3', particleCount);
  }
}
