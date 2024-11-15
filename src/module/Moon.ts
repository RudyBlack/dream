import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ResObjectData } from '../@types/object';

class Moon implements Module {
  private moon!: THREE.Group;
  private moonMaterial!: THREE.MeshStandardMaterial;

  dispose(): void {}

  async init(params: InitParam, moonData: ResObjectData): Promise<void> {
    const { scene } = params;

    for (const itemKey in moonData) {
      const target = moonData[itemKey];

      const { opacity, position, scale, uuid } = target;

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
      moon.name = 'MOON';
      this.moon = moon;
      scene.add(moon);

      // const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
      // const bulbLight = new THREE.PointLight(0xa2f0ff, 5000, 10000, 1.1);
      //
      // scene.add(hemisphereLight);
      // scene.add(bulbLight);
    }

    return Promise.resolve(undefined);
  }

  save() {
    const moon = this.moon;
    const moonMaterial = this.moonMaterial;

    return {
      [moon.uuid]: {
        scale: moon.scale.toArray(),
        position: moon.position.toArray(),
        opacity: moonMaterial.opacity,
      },
    };
  }
}

export default Moon;
