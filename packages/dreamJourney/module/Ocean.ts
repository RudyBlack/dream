import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { RepeatWrapping, Scene } from 'three';
import {
  cameraPosition,
  color,
  dot,
  max,
  MeshStandardNodeMaterial,
  normalize,
  positionWorld,
  reflector,
  texture,
  timerLocal,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';
import { uv } from 'three/examples/jsm/nodes/accessors/UVNode';

class Ocean implements Module {
  private _scene?: Scene;

  async init(params: InitParam): Promise<void> {
    this._scene = params.scene;

    this.makeWater();
  }

  dispose(): void {}

  private makeWater() {
    const scene = this._scene!;
    const textureLoader = new THREE.TextureLoader();
    const normalMap0 = textureLoader.load(
      'textures/water/Water_1_M_Normal.jpg',
    );
    const normalMap1 = textureLoader.load(
      'textures/water/Water_2_M_Normal.jpg',
    );
    normalMap0.wrapS = normalMap0.wrapT = RepeatWrapping;
    normalMap1.wrapS = normalMap1.wrapT = RepeatWrapping;

    const time = timerLocal();
    const normalColor0 = texture(normalMap0, uv().add(time.mul(0.01)))
      .mul(2.0)
      .sub(1.0);
    const normalColor1 = texture(normalMap1, uv().add(time.mul(0.001)))
      .mul(2.0)
      .sub(1.0);

    const normalColor = normalColor0.mul(normalColor1);

    const normal = normalize(vec3(normalColor.x, normalColor.z, normalColor.y));
    const toEye = normalize(cameraPosition.sub(positionWorld.mul(0.3)));

    const theta = max(dot(toEye, normal), 0.0);

    /**
     * 물 노멀벡터 즉 theta가 0이 될 수록 그 부분은 검은색
     * 물 노멀방향과 카메라 위치가 수직을 이룰수록 물의 해당 부분이 검어짐
     */

    const reflectance = theta.clamp(0.1, Math.PI / 2);

    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    const waterMaterial = new MeshStandardNodeMaterial();
    const water = new THREE.Mesh(waterGeometry, waterMaterial);

    const reflectColor = reflector({
      target: water,
      resolution: 0.5,
      generateMipmaps: true,
    });
    reflectColor.uvNode = reflectColor.uvNode!.add(normalColor);

    waterMaterial.colorNode = reflectColor
      .add(reflectance)
      .mul(color(0x355f93));
    water.rotation.x = -Math.PI / 2;

    scene.add(water);
  }

  save(): any {}
}

export default Ocean;
