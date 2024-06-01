import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import {
  cameraPosition,
  color,
  If,
  instanceIndex,
  int,
  max,
  MeshStandardNodeMaterial,
  min,
  mix,
  modelPosition,
  modelViewPosition,
  modelViewProjection,
  modelWorldMatrix,
  Node,
  positionGeometry,
  positionLocal,
  positionView,
  positionWorld,
  range,
  ShaderNodeObject,
  SpriteNodeMaterial,
  texture,
  timerLocal,
  uv,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';
import { Scene, Texture, Vector3 } from 'three';
import GUI from 'lil-gui';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

const SKY_POSITION_Z = -400;

class Cloud implements Module {
  private static instanceCount = 1;

  init(params: InitParam): Promise<void> {
    const { canvas, container, camera, renderer, scene, orbitControls } =
      params;

    const map = Cloud.loadTexture();

    const cloud1 = Cloud.makeCloud(map, scene, 'left');
    const cloud2 = Cloud.makeCloud(map, scene, 'right');

    cloud1.position.set(-250, 100, SKY_POSITION_Z);
    cloud2.position.set(250, 50, SKY_POSITION_Z);

    return Promise.resolve(undefined);
  }

  private static makeCloud(map: Texture, scene: Scene, type: 'left' | 'right') {
    const { positionNode, scaleNode, colorNode, opacityNode } = Cloud.makeNodes(
      map,
      type,
    );

    const smokeNodeMaterial = new MeshStandardNodeMaterial();
    smokeNodeMaterial.colorNode = colorNode;

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

  private static makeNodes(map: Texture, type: 'left' | 'right') {
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

    const timer = timerLocal(0.003, 0.5);

    const opacityNode = Cloud.makeOpacityNode(map);
    const colorNode = mix(color(0x0195f2), smokeColor, float(0.5));
    const positionNode = offsetRange.mul(0.1).mul(timer);
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
    const opacityNode = textureNode.a.mul(1);
    return opacityNode;
  }

  private static loadTexture() {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load('/smoke1.png');
    return map;
  }

  dispose(): void {}
}

export default Cloud;
