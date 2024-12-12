import { InitParam } from '../module';
import * as THREE from 'three';

import { isDirectionalLight, isHemisphereLight, isPointLight } from '../utils/checkLight.ts';
import { DirectionalLightData, HemisphereLightData, PointLightData, ResLightData } from '@types';

class LightLoader {
  private initParam: InitParam;
  constructor(initParam: InitParam) {
    this.initParam = initParam;
  }

  public loadLight(lightsData: ResLightData) {
    const { canvas, camera, scene, renderer, root, orbitControls, container } = this.initParam;

    for (const lightsDataKey in lightsData) {
      const light = new THREE[lightsData[lightsDataKey].type]();

      if (isPointLight(light)) {
        const targetLightData = lightsData[lightsDataKey] as PointLightData;

        const [x, y, z] = targetLightData.position;
        const [rx, ry, rz] = targetLightData.rotation;
        const { r, g, b } = targetLightData.color;
        light.uuid = targetLightData.uuid;
        light.power = targetLightData.power;
        light.distance = targetLightData.distance;

        light.color.set(r, g, b);
        light.rotation.set(rx, ry, rz);
        light.decay = targetLightData.decay;
        light.position.set(x, y, z);

        scene.add(light);
      }

      if (isDirectionalLight(light)) {
        const targetLightData = lightsData[lightsDataKey] as DirectionalLightData;

        const [x, y, z] = targetLightData.position;
        const [rx, ry, rz] = targetLightData.rotation;
        const { r, g, b } = targetLightData.color;

        light.intensity = targetLightData.intensity;
        light.uuid = targetLightData.uuid;
        light.color.set(r, g, b);
        light.rotation.set(rx, ry, rz);
        light.position.set(x, y, z);

        scene.add(light);
      }

      if (isHemisphereLight(light)) {
        const targetLightData = lightsData[lightsDataKey] as HemisphereLightData;

        const [x, y, z] = targetLightData.position;
        const [rx, ry, rz] = targetLightData.rotation;
        const { r, g, b } = targetLightData.color;

        light.uuid = targetLightData.uuid;

        light.groundColor.set(
          targetLightData.groundColor.r,
          targetLightData.groundColor.g,
          targetLightData.groundColor.b,
        );

        light.intensity = targetLightData.intensity;
        light.color.set(r, g, b);
        light.rotation.set(rx, ry, rz);

        light.position.set(x, y, z);

        scene.add(light);
      }
    }
  }
}

export default LightLoader;
