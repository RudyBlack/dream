import { Module } from '../module';
import * as THREE from 'three';
import { AmbientLight, Color } from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Component from '@egjs/component';
import Cloud from '../module/Cloud.ts';
import Ocean from '../module/Ocean.ts';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
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
    this._renderer = new WebGPURenderer({
      canvas: this._canvas,
      antialias: false,
    });
    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(
      60,
      this._canvas.clientWidth / this._canvas.clientHeight,
      1,
      5000,
    );
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
        camera.position.set(-122, 81, 300);
        controls.target.set(0, 3, -0.01);
      }
    });

    await this.setModule(new Ocean(), new Sky(), new Cloud());

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
      return module.init({
        root: this,
        canvas,
        camera,
        renderer,
        scene,
        orbitControls,
        container,
      });
    });

    return Promise.all(modulesPromise);
  }

  private loadHDR() {
    const scene = this.scene;
    new RGBELoader()
      .setPath('textures/')
      .load('star_sky.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;
      });
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
