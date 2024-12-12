import { InitParam, Module } from './type.ts';
import PostProcessing from 'three/examples/jsm/renderers/common/PostProcessing';
import { pass } from 'three/examples/jsm/nodes/display/PassNode';

import * as THREE from 'three';

class AfterImage implements Module {
  constructor() {}
  dispose(): void {}

  init(params: InitParam): Promise<void> {
    const { renderer, camera, scene, canvas, container, orbitControls, root } =
      params;

    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode();

    const combinedPass = scenePassColor.afterImage(0.96);

    const postProcessing = new PostProcessing(renderer);
    // @ts-ignore
    postProcessing.outputNode = combinedPass;

    root.on('renderAfter', () => {
      postProcessing.render();
    });

    return Promise.resolve(undefined);
  }

  save(): any {}
}

export default AfterImage;
