import { Module } from '../module';
import * as THREE from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Particles, sceneFogNode, sceneFogNode2, spaceWarp, spaceWarp2, spaceWrapPoints } from '../nodes';
import { waterNode } from '../nodes/water.ts';
import Component from '@egjs/component';
import IceBox from '../module/IceBox.ts';
import Smoke from '../module/Smoke.ts';
import AfterImage from '../module/AfterImage.ts';
import Reflection from '../module/Reflection.ts';
import Ocean from '../module/Ocean.ts';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import Ground from '../module/Ground.ts';
import { AmbientLight, Color, Vector3 } from 'three';
import Sky from '../module/Sky.ts';

interface Event {
  renderBefore: () => void;
  renderAfter: () => void;
}

class DreamJourney extends Component<Event> {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _container: HTMLDivElement;
  private _orbitControls?: OrbitControls;

  constructor(canvas: HTMLCanvasElement, container: HTMLDivElement) {
    super();
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
    this._renderer = new WebGPURenderer({ canvas: this._canvas, antialias: false });
    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(60, this._canvas.clientWidth / this._canvas.clientHeight, 1, 5000);
    this._orbitControls = new OrbitControls(this._camera, this._canvas);

    const scene = this.scene;

    const renderer = this._renderer;
    const camera = this._camera;
    const controls = this._orbitControls;
    const canvas = this._canvas;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const cameraY = 3;

    camera.position.set(0, cameraY, 0);

    controls.target.set(0, cameraY, -0.01);
    // controls.minDistance = 1;
    // controls.maxDistance = 1;
    controls.maxPolarAngle = Math.PI;

    scene.add(new THREE.AxesHelper(30));
    scene.add(new AmbientLight(0xffffff));

    controls.update();

    scene.background = new Color(0x19254a);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Digit1') {
        camera.position.set(0, cameraY, 0);
        controls.target.set(0, cameraY, -0.01);
      }

      if (e.code === 'Digit2') {
        camera.position.set(-122, 81, 118);
        controls.target.set(0, 3, -0.01);
      }
    });

    await this.setModule(new Ocean(), new Sky());

    await renderer.setAnimationLoop(async () => {
      this.trigger('renderBefore');
      this.render();
      this.trigger('renderAfter');
    });
  }

  public async setModule(...modules: Module[]) {
    const canvas = this._canvas!;
    const camera = this._camera!;
    const renderer = this._renderer!;
    const scene = this._scene!;
    const orbitControls = this._orbitControls!;
    const container = this._container!;

    const modulesPromise = modules.map((module) => {
      return module.init({ root: this, canvas, camera, renderer, scene, orbitControls, container });
    });

    return Promise.all(modulesPromise);
  }

  private loadHDR() {
    const scene = this.scene;
    new RGBELoader().setPath('textures/').load('star_sky.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;
    });
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

  private setWater(scene: THREE.Scene) {
    const water = waterNode();
    // scene.background = new THREE.Color(0x0487e2);
    // scene.backgroundNode = normalWorld.y.mix(color(0x0487e2), color(0x0066ff));
    water.position.y = 2;
    scene.add(water);
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
