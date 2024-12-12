import * as THREE from 'three';

import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import LightEdit from './LightEdit.ts';
import TransformEdit from './objectEdit/TransformEdit.ts';
import { deleteObject, patchLightData } from '../dreamJourney/api';
import DreamJourney from '../dreamJourney/core/DreamJourney.ts';
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
    this.initParam = initParam;

    this.lightEdit = new LightEdit(this, initParam);
    this.transformEdit = new TransformEdit(this, initParam);

    this.opacityEdit = new OpacityEdit(this, initParam);
  }

  public setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    this.transformEdit.setMode(mode);
  }

  public save() {
    const lightData = this.lightEdit.save();

    patchLightData(lightData);
  }

  /**
   * 삭제
   */
  public dispose() {}

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
