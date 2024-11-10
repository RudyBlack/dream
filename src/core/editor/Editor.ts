import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import LightEdit from './LightEdit.ts';
import TransformEdit from './TransformEdit.ts';
import { Light } from 'three';
import { patchLightData } from '../../api';

export type InitParam = {
  camera: THREE.Camera;
  renderer: WebGPURenderer;
  scene: THREE.Scene;
  orbitControls: OrbitControls;
};

class Editor {
  private initParam: InitParam;

  public readonly lightEdit: LightEdit;
  public readonly transformEdit: TransformEdit;

  constructor(initParam: InitParam) {
    const { renderer, camera, scene, orbitControls } = initParam;
    this.initParam = initParam;

    const lightEdit = (this.lightEdit = new LightEdit(this, initParam));
    const transformEdit = (this.transformEdit = new TransformEdit(
      this,
      initParam,
    ));
  }

  public setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    this.transformEdit.setMode(mode);
  }

  public save() {
    const lightData = this.lightEdit.save();

    patchLightData(lightData);
  }
}

export default Editor;
