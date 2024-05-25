import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import {
  cameraPosition,
  color,
  instanceIndex,
  max,
  mix,
  positionGeometry,
  positionLocal,
  positionView,
  positionWorld,
  range,
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
  init(params: InitParam): Promise<void> {
    const { canvas, container, camera, renderer, scene, orbitControls } =
      params;

    // camera.position.z = 300;
    const map = Smoke.loadTexture();

    const cloud1 = Smoke.makeCloud(map, scene);
    cloud1.rotation.z = Math.PI / 2;
    cloud1.position.z = -50;
    cloud1.position.set(0, 5, -50);

    const gui = new GUI();
    gui.add(cloud1.position, 'x');
    gui.add(cloud1.position, 'y');
    gui.add(cloud1.position, 'z');
    return Promise.resolve(undefined);
  }

  private static makeCloud(map: Texture, scene: Scene) {
    const { positionNode, scaleNode, colorNode, opacityNode } =
      Smoke.makeNodes(map);

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
      1,
    );
    smokeInstancedSprite.scale.setScalar(100);

    scene.add(smokeInstancedSprite);
    return smokeInstancedSprite;
  }

  private static makeNodes(map: Texture) {
    const offsetRange = vec3(0, 3, 0);
    const scaleRange = float(0.3);
    const rotateRange = float(0.5);

    const timer = timerLocal(0.005, 5);

    const smokeColor = mix(
      color(0x2c1501),
      color(0x222222),
      positionLocal.y.mul(3).clamp(0.5, 1),
    );

    const distance = cameraPosition.z.sub(positionWorld.z).mul(0.01);
    const opacity = mix(0, 1, distance);

    const textureNode = texture(map, uv().rotateUV(timer.mul(rotateRange)));
    const opacityNode = textureNode.a.mul(opacity);
    const colorNode = mix(color(0x0195f2), smokeColor, float(0.5));
    const positionNode = offsetRange.mul(0.1);
    const scaleNode = scaleRange;

    return {
      positionNode,
      colorNode,
      scaleNode,
      opacityNode,
    };
  }

  private static loadTexture() {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load('/smoke1.png');
    return map;
  }

  dispose(): void {}
}

export default Smoke;
