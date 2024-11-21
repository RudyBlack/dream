import { Module } from '../module';
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
import Cloud from '../module/Cloud.ts';
import Moon from '../module/Moon.ts';
import Sky from '../module/Sky.ts';
import Ocean from '../module/Ocean.ts';
import Galaxy from '../module/Galaxy.ts';

interface Event {
  renderBefore: () => void;
  renderAfter: () => void;
}

class DreamJourney extends Component<Event> {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _container: HTMLDivElement;
  private _orbitControls?: OrbitControls;

  private _loadedModules: Module[] = [];

  public get loadedModules() {
    return this._loadedModules;
  }

  public get canvas() {
    return this._canvas;
  }

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

  get orbitControls() {
    return this._orbitControls!;
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
    const orbitControls = (this._orbitControls = new OrbitControls(
      this._camera,
      this._canvas,
    ));
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

    const resModuleData = await loadModulesData();
    const resData = await loadSceneData();

    if (resData && resModuleData) {
      const loadedMoules = [];
      const moduleData = {} as Record<string, Record<string, ObjectData>>;

      for (const itemKey in resData) {
        const target = resData[itemKey];

        if (!moduleData[target.type]) {
          moduleData[target.type] = {};
        }

        moduleData[target.type][itemKey] = target;
      }

      loadedMoules.push(await this.setModule(moduleData['Cloud'], new Cloud()));

      loadedMoules.push(await this.setModule(moduleData['Moon'], new Moon()));

      loadedMoules.push(await this.setModule(moduleData['Sky'], new Sky()));

      loadedMoules.push(await this.setModule(moduleData['Ocean'], new Ocean()));

      loadedMoules.push(
        await this.setModule(moduleData['Galaxy'], new Galaxy()),
      );

      // const loadedModules = await this.loadModules(resModuleData, resData);
      this._loadedModules = loadedMoules;
    }

    await renderer.setAnimationLoop(async () => {
      this.trigger('renderBefore');
      this.render();
      this.trigger('renderAfter');
    });

    const cloudModule = this.loadedModules[0] as Cloud;

    if (cloudModule) {
      cloudModule.clouds.forEach((c) => {
        getObjectOpacity(c.uuid).then((res) => {
          const resData = res.body;

          if (resData) {
            const a = resData.getReader();
            a.read().then((r) => {
              if (r.value) {
                cloudModule.replaceDataTexture(
                  c.uuid,
                  pako.ungzip(r.value, { raw: false }),
                );
              }
            });
          }
        });
      });
    }
  }

  public async setModule(data: ResObjectData, ...modules: Module[]) {
    const canvas = this._canvas!;
    const camera = this._camera!;
    const renderer = this._renderer!;
    const scene = this._scene!;
    const orbitControls = this._orbitControls!;
    const container = this._container!;

    await modules[0].init(
      {
        root: this,
        canvas,
        camera,
        renderer,
        scene,
        orbitControls,
        container,
      },
      data,
    );

    return modules[0];
  }

  public async save() {
    const loadedModules = this._loadedModules;

    const saveData = loadedModules.reduce((acc, module) => {
      const saveData = module.save();

      return { ...acc, ...saveData };
    }, {});

    patchSceneData(saveData);
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

  private loadModules = async (resData: string[], data: ResObjectData) => {
    const loadedMoules = [];
    const moduleData = {} as Record<string, Record<string, ObjectData>>;

    for (const itemKey in data) {
      const target = data[itemKey];

      if (!moduleData[target.type]) {
        moduleData[target.type] = {};
      }

      moduleData[target.type][itemKey] = target;
    }

    for (const item of resData) {
      try {
        // 동적 import를 사용하여 모듈 가져오기
        const modulePath = `../module/${item}`; // 경로는 모듈 구조에 따라 조정 필요

        const ModuleClass = (await import(modulePath)).default;

        if (ModuleClass) {
          const module = await this.setModule(
            moduleData[item],
            new ModuleClass(),
          );
          loadedMoules.push(module);
        } else {
          console.warn(`Module for type ${item} not found.`);
        }
      } catch (error) {
        console.error(`Failed to load module for type ${item}:`, error);
      }
    }

    return loadedMoules;
  };
}

export default DreamJourney;
