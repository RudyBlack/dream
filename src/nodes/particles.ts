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

export class Particles {
  private readonly particleCount = 1000000;
  private readonly gravity = uniform(-0.0098);
  private readonly bounce = uniform(0.8);
  private readonly friction = uniform(0.99);
  private readonly size = uniform(0.12);
  private clickPosition = uniform(new THREE.Vector3());

  private plane: THREE.Mesh;

  public readonly computeParticles: ShaderNodeObject<ComputeNode>;
  private camera: PerspectiveCamera;
  private renderer: WebGPURenderer;

  private computeMouseHit: ShaderNodeObject<ComputeNode>;

  constructor(scene: Scene, renderer: WebGPURenderer, camera: PerspectiveCamera) {
    this.renderer = renderer;
    this.camera = camera;
    const positionBuffer = this.createBuffer(this.particleCount);
    const velocityBuffer = this.createBuffer(this.particleCount);
    const colorBuffer = this.createBuffer(this.particleCount);

    const computeInitFn = this.computeInitFunction(positionBuffer, colorBuffer, this.particleCount);
    const computeUpdateFn = (this.computeParticles = this.computeUpdateFunction(
      positionBuffer,
      velocityBuffer,
      this.gravity,
      this.friction,
      this.bounce,
      this.particleCount,
    ));

    const particlesMesh = this.makeParticlesMesh(
      '/sprite1.png',
      positionBuffer,
      colorBuffer,
      this.size,
      this.particleCount,
    );
    scene.add(particlesMesh);

    const helper = new THREE.GridHelper(60, 40, 0x303030, 0x303030);
    scene.add(helper);

    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);

    const plane = (this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false })));
    scene.add(plane);

    renderer.compute(computeInitFn);

    this.computeMouseHit = this.computeMouseHitFunction(positionBuffer, velocityBuffer, this.particleCount);

    renderer.domElement.addEventListener('pointermove', this.onMouseMove);

    this.particlesRender(computeUpdateFn);
  }

  private onMouseMove = (event: MouseEvent) => {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const camera = this.camera;
    const plane = this.plane;
    const clickPosition = this.clickPosition;
    const renderer = this.renderer;
    const computeMouseHit = this.computeMouseHit;

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects([plane], false);

    if (intersects.length > 0) {
      const { point } = intersects[0];

      // move to uniform

      clickPosition.value.copy(point);
      clickPosition.value.y = -1;

      // compute

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
      const distArea = float(6).sub(dist).max(0);

      const power = distArea.mul(0.01);
      const relativePower = power.mul(instanceIndex.hash().mul(0.5).add(0.5));

      velocity.assign(velocity.add(direction.mul(relativePower)));
    })().compute(particleCount);
  }

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

      position.x = ranX.mul(100).add(-50);
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

      velocity.assign(velocity.add(vec3(0.0, gravity, 0.0)).mul(friction));
      position.assign(position.add(velocity));

      If(position.y.lessThan(0), () => {
        // @ts-ignore
        position.y = 0;
        velocity.y = velocity.y.negate().mul(bounce);

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

  private particlesRender(computeUpdateFn: ShaderNodeObject<ComputeNode>) {}
}
