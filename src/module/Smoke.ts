import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import {
  cameraPosition,
  color,
  If,
  instanceIndex,
  max,
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

class Smoke implements Module {
  private static instanceCount = 10;

  init(params: InitParam): Promise<void> {
    const { canvas, container, camera, renderer, scene, orbitControls } =
      params;

    // camera.position.z = 300;
    const map = Smoke.loadTexture();

    const cloud1 = Smoke.makeCloud(map, scene, 'left');
    const cloud2 = Smoke.makeCloud(map, scene, 'right');

    cloud1.position.set(0, 5, -50);
    cloud2.position.set(0, 5, -50);

    const gui = new GUI();
    gui.add(cloud1.position, 'x');
    gui.add(cloud1.position, 'y');
    gui.add(cloud1.position, 'z');
    return Promise.resolve(undefined);
  }

  private static makeCloud(map: Texture, scene: Scene, type: 'left' | 'right') {
    const { positionNode, scaleNode, colorNode, opacityNode } = Smoke.makeNodes(
      map,
      type,
    );

    const smokeNodeMaterial = new SpriteNodeMaterial();
    smokeNodeMaterial.colorNode = colorNode;
    smokeNodeMaterial.positionNode = positionNode;
    smokeNodeMaterial.opacityNode = opacityNode;
    smokeNodeMaterial.scaleNode = scaleNode;
    smokeNodeMaterial.depthWrite = false;
    smokeNodeMaterial.transparent = true;

    const smokeInstancedSprite = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      smokeNodeMaterial,
      Smoke.instanceCount,
    );
    smokeInstancedSprite.scale.setScalar(100);

    scene.add(smokeInstancedSprite);
    return smokeInstancedSprite;
  }

  private static makeNodes(map: Texture, type: 'left' | 'right') {
    const offsetRange =
      type === 'right'
        ? vec3(float(instanceIndex.mul(2)), 0, 0)
        : vec3(float(instanceIndex.mul(2)).negate(), 0, 0);
    const scaleRange = range(0.25, 0.5);

    const smokeColor = mix(
      color(0x2c1501),
      color(0x222222),
      positionGeometry.y.mul(3).clamp(0.5, 1),
    );

    const opacityNode = Smoke.makeOpacityNode(map);
    const colorNode = mix(color(0x0195f2), smokeColor, float(0.5));
    const positionNode = offsetRange.mul(0.1);
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
    const f = positionWorld.add(instanceIndex.mul(100)).mul(0.05).abs();

    const textureNode = texture(map, uv().mul(rotateRange));
    const opacityNode = textureNode.a.mul(nodeSum(f).clamp(0, 2));
    return opacityNode;
  }

  private static loadTexture() {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load('/smoke1.png');
    return map;
  }

  dispose(): void {}
}

export default Smoke;
