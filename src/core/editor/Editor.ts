import * as THREE from 'three';

import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import LightEdit from './LightEdit.ts';
import TransformEdit from './objectEdit/TransformEdit.ts';
import { deleteObject, patchLightData } from '../../api';
import DreamJourney from '../DreamJourney.ts';
import OpacityEdit from './objectEdit/OpacityEdit.ts';

export type InitParam = {
  camera: THREE.Camera;
  renderer: WebGPURenderer;
  scene: THREE.Scene;
  orbitControls: OrbitControls;
  canvas: HTMLCanvasElement;
};

class Editor {
  private initParam: InitParam;

  public readonly lightEdit: LightEdit;
  public readonly transformEdit: TransformEdit;
  public readonly opacityEdit: OpacityEdit;
  public readonly dreamJourney: DreamJourney;

  constructor(DreamJourney: DreamJourney, initParam: InitParam) {
    this.dreamJourney = DreamJourney;
    const { renderer, camera, scene, orbitControls } = initParam;
    this.initParam = initParam;

    const lightEdit = (this.lightEdit = new LightEdit(this, initParam));
    const transformEdit = (this.transformEdit = new TransformEdit(
      this,
      initParam,
    ));

    const opacityEdit = (this.opacityEdit = new OpacityEdit(this, initParam));
  }

  public setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    this.transformEdit.setMode(mode);
  }

  public save() {
    const lightData = this.lightEdit.save();

    patchLightData(lightData);
  }

  public deleteObject() {
    const target = this.transformEdit.getAttachTarget();
    if (!target) return;

    const { scene } = this.initParam;
    const { uuid, id } = target;

    this.transformEdit.detach();
    deleteObject(uuid);
    const targetInScene = scene.getObjectById(id);
    if (targetInScene) {
      scene.remove(targetInScene);
    }
  }

  public lockObject() {
    const target = this.transformEdit.getAttachTarget();
    if (target) {
      this.transformEdit.addIgnoreTarget = target.uuid;
    }
  }

  public unlockAllObject() {
    this.transformEdit.resetIgnoreTarget();
  }
}

export default Editor;
