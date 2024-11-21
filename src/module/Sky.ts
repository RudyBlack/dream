import { InitParam, Module } from './type.ts';
import {
  color,
  cos,
  instanceIndex,
  MeshStandardNodeMaterial,
  positionLocal,
  ShaderNodeObject,
  sin,
  SpriteNodeMaterial,
  storage,
  StorageBufferNode,
  texture,
  timerLocal,
  tslFn,
  uniform,
  UniformNode,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';
import * as THREE from 'three';
import { Mesh, PerspectiveCamera, Scene, SphereGeometry } from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';
import DreamJourney from '../core';

// @ts-ignore
import StorageInstancedBufferAttribute from 'three/addons/renderers/common/StorageInstancedBufferAttribute.js';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

class Sky implements Module {
  private readonly particleCount = 1000;
  private readonly gravity = uniform(-0.0098);
  private readonly bounce = uniform(0.8);
  private readonly friction = uniform(0.99);
  private readonly size = uniform(0.12);
  private clickPosition = uniform(new THREE.Vector3());
  private camera?: PerspectiveCamera;
  private renderer?: WebGPURenderer;
  private root?: DreamJourney;
  private canvas?: HTMLCanvasElement;

  private static SPEED = 0.01;

  private scene?: Scene;

  async init(params: InitParam): Promise<void> {
    const { canvas, camera, scene, renderer, root } = params;
    this.root = root;
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.canvas = canvas;

    this.setStars();
    this.setSceneSphere();
  }

  public setStars() {
    const renderer = this.renderer!;
    const scene = this.scene!;
    const positionBuffer = this.createBuffer(this.particleCount);
    const velocityBuffer = this.createBuffer(this.particleCount);
    const colorBuffer = this.createBuffer(this.particleCount);

    const computeInitFn = this.computeInitFunction(
      positionBuffer,
      colorBuffer,
      this.particleCount,
    );
    const computeUpdateFn = this.computeUpdateFunction(
      positionBuffer,
      velocityBuffer,
      colorBuffer,
      this.bounce,
      this.particleCount,
    );

    renderer.compute(computeInitFn as any);

    const particlesMesh = this.makeParticlesMesh(
      '/sprite1.png',
      positionBuffer,
      colorBuffer,
      this.size,
      this.particleCount,
    );

    particlesMesh.position.set(0, 0, 0);

    scene.add(particlesMesh);

    this.root?.on('renderBefore', () => {
      renderer.compute(computeUpdateFn as any);
    });
  }

  public setStars2() {
    const renderer = this.renderer!;
    const scene = this.scene!;

    //make plane
    //texture apply
    //modify texture by shader
  }

  private setSceneSphere() {
    const scene = this.scene!;

    const sphereGeo = new SphereGeometry(5, 100, 100);
    const sphereNodeMat = new MeshStandardNodeMaterial();
    const backgroundNode = vec3(0, 1, 0)
      .sub(positionLocal)
      .mul(0.002)
      .clamp(0, 1);

    sphereNodeMat.colorNode = color(0, 0, 1).mul(backgroundNode);

    sphereNodeMat.side = 1;
    const sphere = new Mesh(sphereGeo, sphereNodeMat);

    sphere.scale.setScalar(100);
    scene.add(sphere);
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

      const theta = instanceIndex
        .add(1)
        .hash()
        .mul(Math.PI / 2); // 극 각도 (위도)
      const phi = instanceIndex.hash().mul(float(2).mul(Math.PI)); // 방위 각도 (경도)

      // 구면 좌표계를 카테시안 좌표계로 변환
      const x = sin(theta).mul(cos(phi));
      const y = cos(theta); // y축 방향으로 반구
      const z = sin(theta).mul(sin(phi));

      // 반경 조정을 위해 모든 좌표에 반경을 곱합니다.
      const radius = 50; // 반경 설정

      position.x = x.mul(radius);
      position.y = y.mul(radius);
      position.z = z.mul(radius);

      color.assign(vec3(theta, phi, radius));
    })().compute(particleCount);
  }

  private computeUpdateFunction(
    positionBuffer: ShaderNodeObject<StorageBufferNode>,
    velocityBuffer: ShaderNodeObject<StorageBufferNode>,
    colorBuffer: ShaderNodeObject<StorageBufferNode>,
    bounce: ShaderNodeObject<UniformNode<number>>,
    particleCount: number,
  ) {
    return tslFn(() => {
      const position = positionBuffer.element(instanceIndex);
      const velocity = velocityBuffer.element(instanceIndex);
      const color = colorBuffer.element(instanceIndex);

      const time = timerLocal(2);

      color.xyz = vec3(
        cos(time.add(instanceIndex)),
        cos(time.add(instanceIndex)),
        cos(time.add(instanceIndex)),
      );
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
    particleMaterial.colorNode = textureNode.mul(
      colorBuffer.element(instanceIndex),
    );

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
    return storage(
      new StorageInstancedBufferAttribute(particleCount, 3),
      'vec3',
      particleCount,
    );
  }

  dispose(): void {}

  save(): any {}
}

export default Sky;
