import * as THREE from 'three';
import { InitParam, Module } from './type.ts';
import {
  MeshStandardNodeMaterial,
  parallaxUV,
  texture,
} from 'three/examples/jsm/nodes/Nodes';
import { uv } from 'three/examples/jsm/nodes/accessors/UVNode';

class IceBox implements Module {
  save() {
    // throw new Error('Method not implemented.');
  }
  async init(params: InitParam): Promise<void> {
    const { scene, renderer, orbitControls } = params;

    const {
      topTexture,
      roughnessTexture,
      normalTexture,
      displaceTexture,
      bottomTexture,
    } = await IceBox.loadTextures();

    // const parallaxScale = 0.3;
    const offsetUV = texture(displaceTexture);
    const parallaxUVOffset = parallaxUV(uv(), offsetUV);
    const parallaxResult = texture(bottomTexture, parallaxUVOffset);
    const iceNode = texture(topTexture).overlay(parallaxResult);

    // material

    const material = new MeshStandardNodeMaterial();
    material.colorNode = iceNode.mul(5); // increase the color intensity to 5 ( contrast )
    material.roughnessNode = texture(roughnessTexture);
    material.normalMap = normalTexture;
    material.metalness = 0;

    const geometry = new THREE.BoxGeometry(10, 10, 10);

    const ground = new THREE.Mesh(geometry, material);
    ground.rotateX(-Math.PI / 2);
    scene.add(ground);

    return;
  }

  private static async loadTextures() {
    const loader = new THREE.TextureLoader();

    const topTexture = await loader.loadAsync(
      '/ambientcg/Ice002_1K-JPG_Color.jpg',
    );
    topTexture.colorSpace = THREE.SRGBColorSpace;

    const roughnessTexture = await loader.loadAsync(
      '/ambientcg/Ice002_1K-JPG_Roughness.jpg',
    );
    roughnessTexture.colorSpace = THREE.NoColorSpace;

    const normalTexture = await loader.loadAsync(
      '/ambientcg/Ice002_1K-JPG_NormalGL.jpg',
    );
    normalTexture.colorSpace = THREE.NoColorSpace;

    const displaceTexture = await loader.loadAsync(
      '/ambientcg/Ice002_1K-JPG_Displacement.jpg',
    );
    displaceTexture.colorSpace = THREE.NoColorSpace;

    const bottomTexture = await loader.loadAsync(
      '/ambientcg/Ice003_1K-JPG_Color.jpg',
    );
    bottomTexture.colorSpace = THREE.SRGBColorSpace;
    bottomTexture.wrapS = THREE.RepeatWrapping;
    bottomTexture.wrapT = THREE.RepeatWrapping;
    return {
      topTexture,
      roughnessTexture,
      normalTexture,
      displaceTexture,
      bottomTexture,
    };
  }

  dispose(): void {}
}

export default IceBox;
