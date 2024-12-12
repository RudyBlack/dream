import * as THREE from 'three';
import { InitParam, Module } from './type.ts';
import { pass } from 'three/examples/jsm/nodes/display/PassNode';
import { threshold, uniform } from 'three/examples/jsm/nodes/Nodes';
import PostProcessing from 'three/examples/jsm/renderers/common/PostProcessing';

class EffectProcessing implements Module {
  dispose(): void {}

  init(params: InitParam): Promise<void> {
    console.log('init');
    const { scene, camera, renderer, root } = params;
    const scenePass = pass(scene, camera);

    const threshold = uniform(1.4);
    const scaleNode = uniform(5);
    const intensity = uniform(1);
    const samples = 64;

    const anamorphicPass = scenePass
      .getTextureNode()
      .anamorphic(threshold, scaleNode, samples);
    anamorphicPass.resolution = new THREE.Vector2(0.2, 0.2); // 1 = full resolution

    const postProcessing = new PostProcessing(renderer);
    // @ts-ignore
    postProcessing.outputNode = scenePass.add(anamorphicPass.mul(intensity));
    // postProcessing.outputNode = scenePass.add(
    //   anamorphicPass.getTextureNode().gaussianBlur(),
    // );
    root.on('renderBefore', () => {
      postProcessing.render();
    });

    return Promise.resolve(undefined);
  }

  save(): any {}
}

export default EffectProcessing;
