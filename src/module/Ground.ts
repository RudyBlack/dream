import { InitParam, Module } from './type.ts';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as THREE from 'three';
import { sceneFogNode2 } from '../nodes';

class Ground implements Module {
  dispose(): void {}

  async init(params: InitParam): Promise<void> {
    const { canvas, camera, scene } = params;

    const { fogNode, backgroundNode } = sceneFogNode2(camera);

    // @ts-ignore
    scene.fogNode = fogNode;

    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x999999,
    });

    const ground = new THREE.Mesh(planeGeometry, planeMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.scale.multiplyScalar(3);
    ground.castShadow = true;
    ground.receiveShadow = true;
    scene.add(ground);

    return Promise.resolve(undefined);
  }
}

export default Ground;
