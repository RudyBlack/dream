import { Cloud, Module } from '../module';
import * as THREE from 'three';
import { AmbientLight, Color } from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Component from '@egjs/component';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import {
  getObjectOpacity,
  loadLightData,
  loadModulesData,
  loadSceneData,
  patchSceneData,
} from '../api';
import { ObjectData, ResObjectData } from '../@types/object';
import LightLoader from './LightLoader.ts';
import pako from 'pako';

interface Event {
  renderBefore: () => void;
  renderAfter: () => void;
}

class DreamJourney extends Component<Event> {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _container: HTMLDivElement;
  private _orbitControls?: OrbitControls;
  private _renderer?: WebGPURenderer;
  private _scene?: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;

  private _loadedModules: Module[] = [];

  public get loadedModules() {
    return this._loadedModules;
  }

  public get canvas() {
    return this._canvas;
  }

  public get renderer() {
    return this._renderer!;
  }

  public get scene() {
    return this._scene!;
  }

  public get camera() {
    return this._camera!;
  }

  public get orbitControls() {
    return this._orbitControls!;
  }

  constructor(canvas: HTMLCanvasElement, container: HTMLDivElement) {
    super();
    this._canvas = canvas;
    this._container = container;
  }

  public async init() {
    this._renderer = new WebGPURenderer({
      canvas: this._canvas,
      antialias: false,
    });
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(
      50,
      this._canvas.clientWidth / this._canvas.clientHeight,
      1,
      5000,
    );
    const orbitControls = (this._orbitControls = new OrbitControls(this._camera, this._canvas));
    const scene = this.scene;
    const renderer = this._renderer;
    const camera = this._camera;
    const controls = this._orbitControls;
    const canvas = this._canvas;

    const lightLoader = new LightLoader({
      root: this,
      canvas,
      camera,
      renderer,
      scene,
      orbitControls,
      container: this._container,
    });

    const lightData = await loadLightData();

    if (lightData) {
      lightLoader.loadLight(lightData);
    }

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const cameraY = 3;

    camera.position.set(0, cameraY, 0);
    controls.target.set(0, cameraY, -0.01);

    controls.maxPolarAngle = Math.PI;

    scene.add(new AmbientLight(0xffffff));

    controls.update();

    scene.background = new Color(0x19254a);

    await renderer.setAnimationLoop(async () => {
      this.trigger('renderBefore');
      this.render();
      this.trigger('renderAfter');
    });
  }

  /**
   * 사용할 모듈(플러그인)을 로드
   * @param modules
   */
  public async setModule(...modules: Module[]) {
    const canvas = this._canvas!;
    const camera = this._camera!;
    const renderer = this._renderer!;
    const scene = this._scene!;
    const orbitControls = this._orbitControls!;
    const container = this._container!;

    const loadModules = modules.map((module) => {
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

    return await Promise.all(loadModules);
  }

  /**
   * 인스턴스 삭제
   */
  public dispose() {
    //TODO
    this.renderer.dispose();
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
