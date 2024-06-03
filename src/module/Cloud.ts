import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { Scene, Texture } from 'three';
import {
  color,
  instanceIndex,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  mix,
  Node,
  positionGeometry,
  positionLocal,
  positionWorld,
  range,
  ShaderNodeObject,
  texture,
  timerLocal,
  uv,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';
import DebugController from '../DebugController.ts';

const SKY_POSITION_Z = -400;

class Cloud implements Module {
  private static instanceCount = 1;

  init(params: InitParam): Promise<void> {
    const { canvas, container, camera, renderer, scene, orbitControls } =
      params;

    // DebugController.position(cloud4);
    // DebugController.rotation(cloud4);
    // DebugController.scale(cloud4);

    this.moonNearClouds(params);
    // this.farClouds(params);
    return Promise.resolve(undefined);
  }

  private static makeCloud(
    map: Texture,
    scene: Scene,
    type: 'left' | 'right',
    options: { color?: number } = {},
  ) {
    const { color = 0xffffff } = options;
    const { positionNode, scaleNode, colorNode, opacityNode } = Cloud.makeNodes(
      map,
      type,
      { color },
    );

    const smokeNodeMaterial = new MeshStandardNodeMaterial();
    smokeNodeMaterial.colorNode = colorNode;
    smokeNodeMaterial.positionNode = positionLocal.add(positionNode);
    smokeNodeMaterial.opacityNode = opacityNode;

    smokeNodeMaterial.depthWrite = false;
    smokeNodeMaterial.transparent = true;
    smokeNodeMaterial.depthFunc = 1;

    const smokeInstancedSprite = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      smokeNodeMaterial,
      Cloud.instanceCount,
    );

    smokeInstancedSprite.scale.setScalar(200);
    scene.add(smokeInstancedSprite);
    return smokeInstancedSprite;
  }

  private static makeNodes(
    map: Texture,
    type: 'left' | 'right',
    options: { color: number },
  ) {
    const offsetRange =
      type === 'right'
        ? vec3(float(instanceIndex), 0, 0)
        : vec3(float(instanceIndex.mul(instanceIndex)).negate(), 5, 0);
    const scaleRange = range(2.5, 5);

    const smokeColor = mix(
      color(0x2c1501),
      color(0x222222),
      positionWorld.y.mul(3).clamp(0.5, 1),
    );

    const timer = timerLocal(0.001);

    const opacityNode = Cloud.makeOpacityNode(map);
    const colorNode = mix(
      color(options.color ?? 0x015181),
      smokeColor,
      float(0.5),
    );
    const positionNode = offsetRange.mul(timer);
    const scaleNode = float(scaleRange);

    return {
      positionNode,
      colorNode,
      scaleNode,
      opacityNode,
    };
  }

  private static makeOpacityNode(map: Texture) {
    function nodeSum(node: ShaderNodeObject<Node>) {
      return node.x
        .mul(0.2)
        .add(node.y.abs().mul(0.01))
        .add(node.z.abs().mul(0.01));
    }

    const rotateRange = range(1, 1.2);
    const f = positionWorld.add(instanceIndex.mul(100)).mul(0.05);

    const textureNode = texture(map, uv().mul(rotateRange));
    // const opacityNode = textureNode.a.mul(nodeSum(f).clamp(0, 1));
    const opacityNode = textureNode.a.mul(0.9);
    return opacityNode;
  }

  private static loadTexture(path: string) {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load(path);
    return map;
  }

  private moonNearClouds(params: InitParam) {
    const { scene } = params;
    const color = 0xcfcad6;
    const map3 = Cloud.loadTexture('/clouds/03.png');
    const map32 = Cloud.loadTexture('/clouds/32.png');

    const cloudLeft = Cloud.makeCloud(map3, scene, 'left', { color });
    const cloudRight = Cloud.makeCloud(map32, scene, 'right', { color });

    cloudLeft.position.set(-214, 266, -884);
    cloudLeft.scale.set(661, 220, 280);

    cloudRight.position.set(269, 410, -1008);
    // cloudRight.rotation.z = 11.5;
    cloudRight.scale.set(814, 356, 300);
    DebugController.position(cloudRight);
    DebugController.scale(cloudRight);
    // DebugController.position(cloudRight);
  }

  private farClouds(params: InitParam) {
    const { scene } = params;
    const color = 0x3e7297;
    const map2 = Cloud.loadTexture('/clouds/03.png');
    const map3 = Cloud.loadTexture('/clouds/02.png');

    const cloud1 = Cloud.makeCloud(map2, scene, 'left', { color });
    const cloud3 = Cloud.makeCloud(map3, scene, 'right', { color });
    const cloud4 = Cloud.makeCloud(map2, scene, 'right', { color });

    cloud1.position.set(-463, 67, -947);
    cloud1.scale.set(403, 220, 280);

    cloud3.position.set(538, 88, -684);
    cloud3.rotation.z = 5;
    cloud3.scale.set(125, 174, 300);

    cloud4.position.set(538, 88, -684);
    cloud4.rotation.z = 5;
    cloud4.scale.set(125, 174, 300);
  }

  dispose(): void {}
}

export default Cloud;
