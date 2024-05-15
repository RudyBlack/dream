import * as THREE from 'three';
import { InitParam, Module } from './type.ts';
import { uv } from 'three/examples/jsm/nodes/accessors/UVNode';
import {
  MeshPhongNodeMaterial,
  MeshStandardNodeMaterial,
  NodeMaterial,
  reflector,
  texture,
  viewportTopLeft,
} from 'three/examples/jsm/nodes/Nodes';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Scene, TextureLoader } from 'three';

class Reflection implements Module {
  private _scene?: Scene;

  dispose(): void {}

  public async init(params: InitParam): Promise<void> {
    const { renderer, scene, canvas, camera, container, orbitControls, root } = params;
    this._scene = scene;
    const textureLoader = new THREE.TextureLoader();

    const { floorColor, floorNormal } = Reflection.loadTexture(textureLoader);

    const { nodeMaterial, reflection } = this.setReflectionToTarget(
      floorColor,
      floorNormal,
      new MeshStandardNodeMaterial(),
    );

    const floor = new THREE.Mesh(new THREE.BoxGeometry(50, 0.001, 50), nodeMaterial);
    floor.add(reflection.target);
    floor.position.set(0, 0, 0);
    scene.add(floor);

    const { mixer, modelScene } = await Reflection.modelLoad();
    scene.add(modelScene);

    const clock = new THREE.Clock();

    root.on('renderBefore', () => {
      const delta = clock.getDelta();
      mixer?.update(delta);
    });

    return Promise.resolve(undefined);
  }

  public setReflectionToTarget(colorMap: THREE.Texture, normalMap: THREE.Texture, nodeMaterial: NodeMaterial) {
    const { normalOffset } = this.setNormalNode(normalMap);

    const reflection = reflector({ resolution: 1 }); // 0.5 is half of the rendering view
    reflection.target.rotateX(-Math.PI / 2);
    // reflection.uvNode = reflection.uvNode!;

    /** 노드 매터리얼에 텍스처 + 반사 노드를 더한 텍스처를 할당할 뿐  **/
    nodeMaterial.colorNode = texture(colorMap, uv());

    return { nodeMaterial, reflection };
  }

  private static loadTexture(textureLoader: TextureLoader) {
    const floorColor = textureLoader.load('/floors/FloorsCheckerboard_S_Diffuse.jpg');
    // floorColor.wrapS = THREE.RepeatWrapping;
    // floorColor.wrapT = THREE.RepeatWrapping;

    floorColor.colorSpace = THREE.SRGBColorSpace;

    const floorNormal = textureLoader.load('/floors/FloorsCheckerboard_S_Normal.jpg');
    // floorNormal.wrapS = THREE.RepeatWrapping;
    // floorNormal.wrapT = THREE.RepeatWrapping;
    return { floorColor, floorNormal };
  }

  private static async modelLoad() {
    const loader = new GLTFLoader();

    const { scene, animations } = await loader.loadAsync('/Michelle.glb');
    const model = scene;
    model.children[0].children[0].castShadow = true;

    const mixer = new THREE.AnimationMixer(model);

    const action = mixer.clipAction(animations[0]);
    action.play();

    // scene.position.x = -2;

    return { mixer, modelScene: scene };
  }

  private loadModel() {}

  private setNormalNode(normalTexture: THREE.Texture) {
    const floorUV = uv();
    const normalOffset = texture(normalTexture, floorUV).xy.sub(0.5).mul(0.02);

    return { normalOffset };
  }
}

export default Reflection;
