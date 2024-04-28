import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { InitParam, Module } from './type.ts';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

class Ocean implements Module {
  private _sun?: THREE.Vector3;
  private _water?: Water;
  private _stats?: Stats;
  private _mesh?: THREE.Mesh;

  private _renderer?: WebGPURenderer;
  private _scene?: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;

  constructor() {}

  public async init(params: InitParam) {
    const { renderer, camera, scene, canvas, orbitControls, container } = params;
    this._renderer = renderer;
    this._scene = scene;
    this._camera = camera;
    const sun = this._sun!;
    const water = this._water!;

    this._sun = new THREE.Vector3();

    // Water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    this._water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });

    this._water.rotation.x = -Math.PI / 2;

    scene.add(this._water);

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
      elevation: 2,
      azimuth: 180,
    };

    // const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    // const renderTarget = this._renderTarget;

    function updateSun() {
      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();

      // if (renderTarget !== undefined) renderTarget.dispose();

      sceneEnv.add(sky);
      // renderTarget = pmremGenerator.fromScene(sceneEnv);
      scene.add(sky);

      // scene.environment = renderTarget.texture;
    }

    updateSun();

    //

    const geometry = new THREE.BoxGeometry(30, 30, 30);
    const material = new THREE.MeshStandardMaterial({ roughness: 0 });

    const mesh = (this._mesh = new THREE.Mesh(geometry, material));
    scene.add(mesh);

    //

    this._stats = new Stats();
    container.appendChild(this._stats.dom);

    // GUI

    const gui = new GUI();

    const folderSky = gui.addFolder('Sky');
    folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange(updateSun);
    folderSky.open();

    const waterUniforms = water.material.uniforms;

    const folderWater = gui.addFolder('Water');
    folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
    folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
    folderWater.open();

    //

    // window.addEventListener('resize', this.onWindowResize);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.render();
    this._stats?.update();
  }

  render() {
    const time = performance.now() * 0.001;
    const mesh = this._mesh!;
    const water = this._water!;
    const renderer = this._renderer!;
    const scene = this._scene!;
    const camera = this._camera!;

    mesh.position.y = Math.sin(time) * 20 + 5;
    mesh.rotation.x = time * 0.5;
    mesh.rotation.z = time * 0.51;

    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);
  }

  dispose(): void {}
}

export default Ocean;
