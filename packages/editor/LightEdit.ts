import Editor, { InitParam } from './Editor.ts';
import { Pane } from 'tweakpane';
import * as THREE from 'three';
import { ResLightData } from '@types';

function isLight(object: THREE.Object3D): object is THREE.Light {
  return (object as THREE.Light).isLight !== undefined;
}

function isPointLight(object: THREE.Object3D): object is THREE.PointLight {
  return (object as THREE.PointLight).isPointLight !== undefined;
}

function isDirectionalLight(object: THREE.Object3D): object is THREE.DirectionalLight {
  return (object as THREE.DirectionalLight).isDirectionalLight !== undefined;
}

function isSpotLight(object: THREE.Object3D): object is THREE.SpotLight {
  return (object as THREE.SpotLight).isSpotLight !== undefined;
}

function isHemisphereLight(object: THREE.Object3D): object is THREE.HemisphereLight {
  return (object as THREE.HemisphereLight).isHemisphereLight !== undefined;
}

class LightEdit {
  private pane: Pane;
  private editor: Editor;
  private initParam: InitParam;

  constructor(editor: Editor, initParam: InitParam) {
    const { orbitControls, scene, camera } = initParam;
    this.initParam = initParam;

    this.editor = editor;
    const pane = (this.pane = new Pane());

    const lights = this.findLights();

    const options = lights.map((light) => {
      return {
        text: light.type,
        value: light.id,
      };
    });

    const lightController = pane.addBlade({
      view: 'list',
      label: 'lights',
      options,
      value: 16,
    });

    lights.forEach((targetLight) => {
      const f = pane.addFolder({
        title: targetLight.type,
        expanded: false,
      });

      if (isHemisphereLight(targetLight)) {
        f.addBinding(targetLight, 'position');
        f.addBinding(targetLight, 'rotation');
        f.addBinding(targetLight, 'intensity');
        f.addBinding(targetLight, 'color', { color: { type: 'float' } });
        f.addBinding(targetLight, 'groundColor', { color: { type: 'float' } });
      }

      if (isPointLight(targetLight)) {
        f.addBinding(targetLight, 'position');
        f.addBinding(targetLight, 'rotation');
        f.addBinding(targetLight, 'distance');
        f.addBinding(targetLight, 'color', { color: { type: 'float' } });
        f.addBinding(targetLight, 'decay');
        f.addBinding(targetLight, 'power');
      }

      if (isDirectionalLight(targetLight)) {
        f.addBinding(targetLight, 'position');
        f.addBinding(targetLight, 'rotation');
        f.addBinding(targetLight, 'intensity');
        f.addBinding(targetLight, 'color', { color: { type: 'float' } });
      }

      if (isSpotLight(targetLight)) {
        f.addBinding(targetLight, 'position');
        f.addBinding(targetLight, 'rotation');
        f.addBinding(targetLight, 'color', { color: { type: 'float' } });
        f.addBinding(targetLight, 'intensity');
        f.addBinding(targetLight, 'decay');
        f.addBinding(targetLight, 'penumbra');
        f.addBinding(targetLight, 'power');
      }
    });
    //

    pane.on('change', (e) => {
      if (e.target.controller.constructor.name === 'InputBindingController') return;
      const value = e.value;
      if (value && typeof value === 'number') {
        const targetLight = scene.getObjectById(value);

        if (targetLight) {
          this.editor.transformEdit.attachTarget(targetLight);
          const { x, y, z } = targetLight.position;
          orbitControls.target.set(x, y, z);
          orbitControls.update();
        }
      }
    });
  }

  public save(): ResLightData {
    const { scene } = this.initParam;

    const lights = this.findLights().filter((l) => l.type !== 'AmbientLight');

    const resLightData = lights.reduce((acc, light) => {
      if (isPointLight(light)) {
        const { r, g, b } = light.color;
        const [x, y, z] = light.position;
        const [rx, ry, rz] = light.rotation;

        return {
          ...acc,
          [light.uuid]: {
            type: 'PointLight',
            uuid: light.uuid,
            power: light.power,
            distance: light.distance,
            color: { r, g, b },
            position: [x, y, z],
            rotation: [rx, ry, rz],
            decay: light.decay,
          },
        };
      }

      if (isDirectionalLight(light)) {
        const { r, g, b } = light.color;
        const [x, y, z] = light.position;
        const [rx, ry, rz] = light.rotation;
        const intensity = light.intensity;

        return {
          ...acc,
          [light.uuid]: {
            type: 'DirectionalLight',
            uuid: light.uuid,
            intensity,
            color: { r, g, b },
            position: [x, y, z],
            rotation: [rx, ry, rz],
          },
        };
      }

      if (isHemisphereLight(light)) {
        const { r, g, b } = light.color;
        const [x, y, z] = light.position;
        const [rx, ry, rz] = light.rotation;
        const intensity = light.intensity;

        return {
          ...acc,
          [light.uuid]: {
            type: 'HemisphereLight',
            uuid: light.uuid,
            groundColor: {
              r: light.groundColor.r,
              g: light.groundColor.g,
              b: light.groundColor.b,
            },
            intensity,
            color: { r, g, b },
            position: [x, y, z],
            rotation: [rx, ry, rz],
          },
        };

        return acc;
      }

      return acc;
    }, {});

    return resLightData;
  }

  private findLights() {
    const { scene } = this.initParam;
    const lights: THREE.Light[] = [];

    scene.traverse((object) => {
      if (isLight(object)) {
        lights.push(object);
      }
    });

    return lights;
  }
}

export default LightEdit;
