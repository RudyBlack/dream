import { Module } from '../module';
import * as THREE from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { sceneFogNode } from '../nodes';

class DreamJourney {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _container: HTMLDivElement;
  private _orbitControls?: OrbitControls;

  constructor(canvas: HTMLCanvasElement, container: HTMLDivElement) {
    this._canvas = canvas;
    this._container = container;
  }

  private _renderer?: WebGPURenderer;

  get renderer() {
    return this._renderer!;
  }

  private _scene?: THREE.Scene;

  get scene() {
    return this._scene!;
  }

  private _camera?: THREE.PerspectiveCamera;

  get camera() {
    return this._camera!;
  }

  public async init() {
    this._renderer = new WebGPURenderer({ canvas: this._canvas, antialias: true });
    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(75, this._canvas.clientWidth / this._canvas.clientHeight, 1, 1000);
    this._orbitControls = new OrbitControls(this._camera, this._canvas);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    const scene = this.scene;
    const renderer = this._renderer;
    const camera = this._camera;
    const controls = this._orbitControls;
    const canvas = this._canvas;

    const ambientLight = new THREE.AmbientLight(0xb0b0b0);

    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(0.32, 0.39, 0.7);

    scene.add(ambientLight);
    scene.add(light);

    this._scene.add(cube);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);
    controls.update();

    this.setFog(scene, camera);

    const render = this.render.bind(this);
    renderer.setAnimationLoop(render);
  }

  public async setModule(...modules: Module[]) {
    const canvas = this._canvas!;
    const camera = this._camera!;
    const renderer = this._renderer!;
    const scene = this._scene!;
    const orbitControls = this._orbitControls!;
    const container = this._container!;

    const modulesPromise = modules.map((module) => {
      return module.init({ canvas, camera, renderer, scene, orbitControls, container });
    });

    return Promise.all(modulesPromise);
  }

  private setFog(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    // @ts-ignore
    scene.fogNode = sceneFogNode(camera);

    scene.add(new THREE.HemisphereLight(0xf0f5f5, 0xd0dee7, 0.5));

    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c6a99,
    });

    const ground = new THREE.Mesh(planeGeometry, planeMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.scale.multiplyScalar(3);
    ground.castShadow = true;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  private onWindowResize() {
    const camera = this.camera;
    const renderer = this.renderer;
    const canvas = this._canvas;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  private render() {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    const orbitControls = this._orbitControls;

    renderer.render(scene, camera);
    orbitControls?.update();
  }
}

export default DreamJourney;
