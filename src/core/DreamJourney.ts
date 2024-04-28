import { Module } from '../module';
import * as THREE from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class DreamJourney {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _container: HTMLDivElement;
  private _renderer?: WebGPURenderer;
  private _scene?: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _orbitControls?: OrbitControls;

  get scene() {
    return this._scene!;
  }

  get camera() {
    return this._camera!;
  }

  get renderer() {
    return this._renderer!;
  }

  constructor(canvas: HTMLCanvasElement, container: HTMLDivElement) {
    this._canvas = canvas;
    this._container = container;
  }

  public async init() {
    this._renderer = new WebGPURenderer({ canvas: this._canvas, antialias: true });
    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(75, this._canvas.clientWidth / this._canvas.clientHeight, 1, 20000);
    this._orbitControls = new OrbitControls(this._camera, this._canvas);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    this._scene.add(cube);

    const renderer = this._renderer;
    const camera = this._camera;
    const controls = this._orbitControls;
    const canvas = this._canvas;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    camera.position.set(0, 0, 10);

    controls.maxPolarAngle = Math.PI * 0.495;

    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.render();
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

    async function animate() {
      requestAnimationFrame(animate);
      await renderer.renderAsync(scene, camera);
      orbitControls?.update();
    }
    animate();
  }
}

export default DreamJourney;
