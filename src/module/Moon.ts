import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import GUI from 'lil-gui';
import { Color, Mesh, MeshStandardMaterial } from 'three';

class Moon implements Module {
  dispose(): void {}

  async init(params: InitParam): Promise<void> {
    const { scene } = params;

    const loader = new GLTFLoader();
    const res = await loader.loadAsync('/the_moon.glb');
    const moon = res.scene;
    const moonMesh = moon.getObjectByName('Object_2') as Mesh;
    const moonMaterial = moonMesh.material as MeshStandardMaterial;
    moonMaterial.opacity = 0.8;
    moon.position.set(-50, 100, -350);

    moon.scale.setScalar(50);
    scene.add(moon);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);

    const bulbLight = new THREE.PointLight(0xa2f0ff, 5000, 10000, 1.1);
    bulbLight.add(moon);
    scene.add(hemisphereLight);
    scene.add(bulbLight);

    const gui = new GUI();
    gui.add(bulbLight, 'decay');
    gui.add(bulbLight, 'distance');
    gui.add(bulbLight, 'intensity');

    return Promise.resolve(undefined);
  }
}

export default Moon;
