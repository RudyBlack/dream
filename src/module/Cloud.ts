import pako from 'pako';
import { InitParam, Module } from './type.ts';
import * as THREE from 'three';
import { DataTexture, Texture } from 'three';
import {
  color,
  instanceIndex,
  MeshStandardNodeMaterial,
  mix,
  positionLocal,
  positionWorld,
  range,
  texture,
  timerLocal,
  uv,
  vec3,
} from 'three/examples/jsm/nodes/Nodes';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';
import { ObjectData, ResObjectData } from '../@types/object';
import { postObjectOpacity } from '../api';

const CLOUD_COLOR = 0xcfcad6;

class Cloud implements Module {
  private static instanceCount = 1;
  private cloudData!: ResObjectData;
  private _opacityData?: Record<string, Uint8Array>;

  private _clouds: THREE.InstancedMesh[] = [];

  public get clouds() {
    return this._clouds;
  }

  public set opacityData(value: Record<string, Uint8Array>) {
    this._opacityData = value;
  }

  init(params: InitParam, data: ResObjectData): Promise<void> {
    const { canvas, container, camera, renderer, scene, orbitControls } =
      params;

    this.cloudData = data;

    for (const itemKey in data) {
      const target = data[itemKey];

      this.makeCloud(params, itemKey, target).then((cloud) => {
        if (cloud) {
          this._clouds.push(cloud);
        }
      });
    }

    return Promise.resolve(undefined);
  }

  public dispose(): void {}

  public save() {
    const cloudObjects = this._clouds;
    const rtnObject = {} as Record<string, Partial<ObjectData>>;

    cloudObjects.forEach((obj) => {
      rtnObject[obj.uuid] = {
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
      };
    });

    return rtnObject;
  }

  public replaceDataTexture(uuid: string, replaceData: Uint8Array) {
    const target = this._clouds.find((item) => item.uuid === uuid);

    if (!target) return;

    const maskTexture = target.userData.maskTexture as DataTexture;
    const data = maskTexture.image.data;

    replaceData.forEach((value, i) => {
      data[i] = value;
    });

    maskTexture.needsUpdate = true;
  }

  public updateDataTexture(
    uuid: string,
    uv: { x: number; y: number },
    radius = 100,
    intensity = 0.5,
  ) {
    const target = this._clouds.find((item) => item.uuid === uuid);

    if (!target) return;

    const maskTexture = target.userData.maskTexture as DataTexture;
    const data = maskTexture.image.data;
    const textureWidth = maskTexture.image.width;
    const textureHeight = maskTexture.image.height;

    // UV 좌표를 픽셀 좌표로 변환
    const x = Math.floor(uv.x * textureWidth);
    const y = Math.floor(uv.y * textureHeight); // Y축 방향 변환

    // 브러시 크기 설정
    const brushRadius = radius; // 픽셀 단위

    const updatedData = {} as Record<number, number>;
    // 원형 브러시를 사용하여 주변 픽셀의 알파 값을 0으로 설정
    for (let i = -brushRadius; i <= brushRadius; i++) {
      for (let j = -brushRadius; j <= brushRadius; j++) {
        const dx = x + i;
        const dy = y + j;

        // 텍스처 범위를 벗어나면 무시
        if (dx < 0 || dx >= textureWidth || dy < 0 || dy >= textureHeight)
          continue;

        // 원형 브러시 영역 계산
        if (i * i + j * j > brushRadius * brushRadius) continue;

        const factor = (brushRadius - Math.sqrt(i * i + j * j)) / brushRadius;

        // 픽셀 인덱스 계산
        const index = dy * textureWidth + dx;

        const opacityData = Math.max(
          0,
          Math.floor(Math.min(data[index], 255 - factor * 255 - intensity)),
        );
        data[index] = opacityData;

        updatedData[index] = opacityData;
      }
    }

    // 마스크 텍스처 업데이트
    maskTexture.needsUpdate = true;

    return maskTexture;
  }

  private makeDataTexture(width: number, height: number) {
    const maskWidth = width;
    const maskHeight = height;

    // RGBA 데이터를 저장할 배열 생성
    const size = maskWidth * maskHeight;
    const data = new Uint8Array(size);

    // 초기화 (모든 픽셀의 알파 값을 255로 설정)
    for (let i = 0; i < size; i++) {
      data[i] = 255; // A
    }

    // DataTexture 생성
    const maskTexture = new THREE.DataTexture(
      data,
      maskWidth,
      maskHeight,
      THREE.RedFormat, // 또는 THREE.RedFormat
    );
    maskTexture.needsUpdate = true;

    return maskTexture;
  }

  private async loadTexture(path: string) {
    try {
      const textureLoader = new THREE.TextureLoader();
      const map = await textureLoader.loadAsync(path);

      return map;
    } catch (e) {
      console.error(`${path}: 구름 불러오는 로직에서 에러`);
    }
  }

  private async makeCloud(
    params: InitParam,
    uuid: string,
    cloudData: ObjectData,
  ) {
    const { scene } = params;
    const { position, scale, path } = cloudData;

    const map3 = await this.loadTexture(path ?? '');
    if (!map3) return;

    const maskTexture = this.makeDataTexture(
      map3.image.width,
      map3.image.height,
    );

    const { positionNode, colorNode, opacityNode, dataTextureNode } =
      this.makeNodes(map3, maskTexture, { color: '#E1FFFC' });

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

    const cloud = smokeInstancedSprite;

    cloud.userData.maskTexture = maskTexture;

    cloud.position.set(position[0], position[1], position[2]);
    cloud.scale.set(scale[0], scale[1], scale[2]);

    cloud.uuid = uuid;
    cloud.name = 'Cloud';

    return cloud;
  }

  private makeNodes(
    map: Texture,
    dataTexture: THREE.DataTexture,
    options: { color: number | string },
  ) {
    const offsetRange = vec3(float(instanceIndex), 0, 0);

    const scaleRange = range(2.5, 5);

    const smokeColor = mix(
      color(0x2c1501),
      color(0x222222),
      positionWorld.y.mul(3).clamp(0.5, 1),
    );

    const timer = timerLocal(0.05);

    const textureNode = texture(map, uv());
    const dataTextureNode = texture(dataTexture, uv());

    const opacityNode = textureNode.a.mul(dataTextureNode.r);

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
      dataTextureNode,
    };
  }
}

export default Cloud;
