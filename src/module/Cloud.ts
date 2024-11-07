import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { Scene, Texture } from 'three';
import {
  color,
  instanceIndex,
  MeshStandardNodeMaterial,
  mix,
  Node,
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
import { CloudData, CloudObject } from '../@types/object';

const CLOUD_COLOR = 0xcfcad6;

class Cloud implements Module {
  private static instanceCount = 1;
  private cloudData!: CloudData;

  private clouds: THREE.InstancedMesh[] = [];

  init(params: InitParam, data: CloudData): Promise<void> {
    const { canvas, container, camera, renderer, scene, orbitControls } =
      params;

    this.cloudData = data;

    this.clouds = data.objects.map((d) => {
      return this.makeCloud(params, d);
    });

    return Promise.resolve(undefined);
  }

  private static makeCloud(
    map: Texture,
    scene: Scene,
    options: { color?: number } = {},
  ) {
    const { color = 0xffffff } = options;
    const { positionNode, scaleNode, colorNode, opacityNode } = Cloud.makeNodes(
      map,
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

  private static makeNodes(map: Texture, options: { color: number }) {
    const offsetRange = vec3(float(instanceIndex), 0, 0);

    const scaleRange = range(2.5, 5);

    const smokeColor = mix(
      color(0x2c1501),
      color(0x222222),
      positionWorld.y.mul(3).clamp(0.5, 1),
    );

    const timer = timerLocal(0.05);

    const opacityNode = Cloud.makeOpacityNode(map);
    const colorNode = mix(
      color(options.color ?? 0x015181),
      smokeColor,
      float(0.5),
    );
    const positionNode = offsetRange.mul(timer).sin().mul(range(0.08, 0.01));
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
    const map = textureLoader.load(path, undefined, undefined, (error) => {
      console.error(`${path}: 구름 불러오는 로직에서 에러`);
    });
    return map;
  }

  private makeCloud(params: InitParam, cloudData: CloudObject) {
    const { scene } = params;
    const { position, scale, path, uuid, rotation } = cloudData;

    const map3 = Cloud.loadTexture(path);

    const cloudLeft = Cloud.makeCloud(map3, scene, {
      color: CLOUD_COLOR,
    });

    cloudLeft.position.set(position[0], position[1], position[2]);
    cloudLeft.scale.set(scale[0], scale[1], scale[2]);

    cloudLeft.uuid = uuid;

    return cloudLeft;
  }

  dispose(): void {}

  save(): CloudData {
    const cloudObjects = this.clouds;
    const cloudData = cloudObjects.map((obj) => {
      return {
        uuid: obj.uuid,
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
        path:
          this.cloudData.objects.find((value) => value.uuid === obj.uuid)
            ?.path ?? '',
      };
    }) as CloudObject[];

    return {
      type: 'Cloud',
      objects: cloudData,
    };
  }
}

export default Cloud;
