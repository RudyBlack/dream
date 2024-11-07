import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MoonData } from '../@types/object';

class Moon implements Module {
  private moon!: THREE.Group;
  private moonMaterial!: THREE.MeshStandardMaterial;

  dispose(): void {}

  async init(params: InitParam, moonData: MoonData): Promise<void> {
    const { scene } = params;

    const { opacity, position, scale, uuid } = moonData;

    const loader = new GLTFLoader();
    const res = await loader.loadAsync('/the_moon.glb');
    const moon = res.scene;
    const moonMesh = moon.getObjectByName('Object_2') as Mesh;
    const moonMaterial = (this.moonMaterial =
      moonMesh.material as MeshStandardMaterial);

    moonMaterial.opacity = opacity;
    moon.position.set(position[0], position[1], position[2]);

    moon.scale.set(scale[0], scale[1], scale[2]);
    moon.uuid = uuid;
    this.moon = moon;
    scene.add(moon);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);

    const bulbLight = new THREE.PointLight(0xa2f0ff, 5000, 10000, 1.1);
    bulbLight.add(moon);
    scene.add(hemisphereLight);
    scene.add(bulbLight);

    return Promise.resolve(undefined);
  }

  save(): MoonData {
    const moon = this.moon;
    const moonMaterial = this.moonMaterial;

    return {
      type: 'Moon',
      uuid: moon.uuid,
      scale: moon.scale.toArray(),
      position: moon.position.toArray(),
      opacity: moonMaterial.opacity,
    };
  }
}

export default Moon;
