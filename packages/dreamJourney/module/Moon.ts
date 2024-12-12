import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ResObjectData } from '@types';

class Moon implements Module {
  private moon!: THREE.Group;
  private moonMaterial!: THREE.MeshStandardMaterial;
  private moonData?: ResObjectData;

  constructor(data?: ResObjectData) {
    this.moonData = data;
  }

  dispose(): void {}

  async init(params: InitParam): Promise<void> {
    const { scene } = params;
    const moonData = this.moonData;

    for (const itemKey in moonData) {
      const target = moonData[itemKey];

      const { opacity, position, scale, uuid } = target;

      const loader = new GLTFLoader();
      const res = await loader.loadAsync('/the_moon.glb');
      const moon = res.scene;
      const moonMesh = moon.getObjectByName('Object_2') as Mesh;
      const moonMaterial = (this.moonMaterial = moonMesh.material as MeshStandardMaterial);

      moonMaterial.opacity = opacity;
      moon.position.set(position[0], position[1], position[2]);

      moon.scale.set(scale[0], scale[1], scale[2]);
      moon.uuid = uuid;
      moon.name = 'MOON';
      this.moon = moon;
      scene.add(moon);
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
