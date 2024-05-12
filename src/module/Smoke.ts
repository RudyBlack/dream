import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import {
  color,
  mix,
  positionLocal,
  range,
  SpriteNodeMaterial,
  texture,
  timerLocal,
  uv,
} from 'three/examples/jsm/nodes/Nodes';
import { Texture } from 'three';

class Smoke implements Module {
  init(params: InitParam): Promise<void> {
    const { canvas, container, camera, renderer, scene, orbitControls } = params;

    // camera.position.z = 300;
    const map = Smoke.loadTexture();

    const { lifeTime, positionNode, scaleNode, colorNode, opacityNode } = Smoke.setNodes(map);

    // create particles

    const smokeNodeMaterial = new SpriteNodeMaterial();
    smokeNodeMaterial.colorNode = colorNode;
    smokeNodeMaterial.opacityNode = opacityNode;
    smokeNodeMaterial.positionNode = positionNode;
    smokeNodeMaterial.scaleNode = scaleNode;
    smokeNodeMaterial.depthWrite = false;
    smokeNodeMaterial.transparent = true;

    const smokeInstancedSprite = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), smokeNodeMaterial, 20);
    smokeInstancedSprite.scale.setScalar(5);
    scene.add(smokeInstancedSprite);

    //

    const fireNodeMaterial = new SpriteNodeMaterial();
    fireNodeMaterial.colorNode = mix(color(0xb72f17), color(0xb72f17), lifeTime);
    fireNodeMaterial.positionNode = range(new THREE.Vector3(-1, 1, -1), new THREE.Vector3(1, 2, 1)).mul(lifeTime);
    fireNodeMaterial.scaleNode = smokeNodeMaterial.scaleNode;
    fireNodeMaterial.opacityNode = opacityNode;
    fireNodeMaterial.blending = THREE.AdditiveBlending;
    fireNodeMaterial.transparent = true;
    fireNodeMaterial.depthWrite = false;

    const fireInstancedSprite = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), fireNodeMaterial, 1);

    fireInstancedSprite.scale.setScalar(5);
    fireInstancedSprite.renderOrder = 1;

    scene.add(fireInstancedSprite);

    //
    return Promise.resolve(undefined);
  }

  private static setNodes(map: Texture) {
    /**
     * range 노드는 object가 InstancedMesh인지 여부를 확인한 후, 해당 메시에 대한 최소값(minNode.value)과 최대값(maxNode.value)을 사용하여 인스턴스별로 속성 값을 랜덤하게 보간(interpolate)하는 로직을 실행
     * **/

    const lifeRange = range(0.1, 1);
    const offsetRange = range(new THREE.Vector3(-2, 3, -2), new THREE.Vector3(2, 5, 2));
    const scaleRange = range(0.3, 2);
    const rotateRange = range(0.1, 4);

    const timer = timerLocal(0.1);
    /**
     * timer.mul(lifeRange)는 timer가 lifeRange 값에 대하여 어떤 비율로 위치하는지를 나타내는 연산
     * .mod(value)는 value로 나눈 후의 몫을 나타내는 값으로 즉 0 ~ 0.7 사이의 값을 계속 반복하게 나타낼 수 있다.
     * **/
    const lifeTime = timer.mul(lifeRange).mod(0.7);

    const fakeLightEffect = positionLocal.y.oneMinus().max(0.2);
    /**
     * .clamp() 메서드는 값의 범위를 0과 1 사이로 제한합니다. positionLocal.y.mul(3)의 결과가 1보다 크거나 0보다 작은 경우, 이 메서드는 값을 각각 1과 0으로 제한합니다. 이는 색상 보간 함수인 mix가 0과 1 사이의 값만을 유효한 입력으로 받기 때문에 필요합니다.
     * mix(colorA, colorB, factor)는 두 색상 colorA와 colorB 사이를 보간 인자 factor에 따라 선형적으로 혼합합니다. factor 값이 0이면 colorA가, 1이면 colorB가 결과 색상이 됩니다. 이 경우, positionLocal.y.mul(3).clamp() 결과는 factor 역할을 하여 입자의 y 위치에 따라 결과적인 색상이 결정됩니다.
     * **/
    const smokeColor = mix(color(0x2c1501), color(0x222222), positionLocal.y.mul(3).clamp(0.5, 1));

    const textureNode = texture(map, uv().rotateUV(timer.mul(rotateRange)));
    const opacityNode = textureNode.a.mul(lifeTime.oneMinus().smoothstep(0.5, 1));
    const colorNode = mix(color(0xf27d0c), smokeColor, lifeTime.mul(2.5).min(1)).mul(fakeLightEffect);
    const positionNode = offsetRange.mul(lifeTime);
    const scaleNode = scaleRange.mul(lifeTime.max(0.3));

    return {
      positionNode,
      colorNode,
      scaleNode,
      opacityNode,
      lifeTime,
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
