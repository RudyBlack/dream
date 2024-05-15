import { InitParam, Module } from './type.ts';
import {
  color,
  depth,
  depthTexture,
  MeshBasicNodeMaterial,
  mx_worley_noise_float,
  positionWorld,
  timerLocal,
  vec2,
  viewportDepthTexture,
  viewportSharedTexture,
  viewportTopLeft,
} from 'three/examples/jsm/nodes/Nodes';
import * as THREE from 'three';

class Ocean implements Module {
  async init(params: InitParam): Promise<void> {
    const { renderer, camera, scene, canvas, orbitControls, root, container } = params;

    const water = this.makeWater();
    scene.add(water);
  }

  private makeWater() {
    const timer = timerLocal(0.3);
    const floorUV = positionWorld;

    const waterLayer0 = mx_worley_noise_float(floorUV.add(4).add(timer));
    const waterLayer1 = mx_worley_noise_float(floorUV.mul(2).add(timer));

    const waterIntensity = waterLayer0.mul(waterLayer1);
    const waterColor = waterIntensity.mul(1.4).mix(color(0x0487e2), color(0x74ccf4));

    const depthWater = depthTexture(viewportDepthTexture());
    const depthEffect = depthWater.remapClamp(-0.002, 0.04);

    const refractionUV = viewportTopLeft.add(vec2(0, waterIntensity.mul(0.1)));

    const depthTestForRefraction = depthTexture(viewportDepthTexture(refractionUV)).sub(depth);

    const depthRefraction = depthTestForRefraction.remapClamp(0, 0.1);

    const finalUV = depthTestForRefraction.lessThan(0).cond(viewportTopLeft, refractionUV);

    const viewportTexture = viewportSharedTexture(finalUV);

    const waterMaterial = new MeshBasicNodeMaterial();
    waterMaterial.colorNode = waterColor;
    waterMaterial.backdropNode = depthEffect.mix(
      viewportSharedTexture(),
      viewportTexture.mul(depthRefraction.mix(1, waterColor)),
    );
    waterMaterial.backdropAlphaNode = depthRefraction.oneMinus();
    waterMaterial.transparent = true;

    const water = new THREE.Mesh(new THREE.BoxGeometry(50, 0.001, 50), waterMaterial);
    water.position.set(0, 0, 0);

    return water;
  }

  dispose(): void {}
}

export default Ocean;
