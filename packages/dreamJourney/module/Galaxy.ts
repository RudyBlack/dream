import * as THREE from 'three';
import { InitParam, Module } from './type.ts';
import {
  color,
  cos,
  mix,
  PI2,
  range,
  sin,
  SpriteNodeMaterial,
  timerLocal,
  uniform,
  vec3,
  vec4,
} from 'three/examples/jsm/nodes/Nodes';
import { float } from 'three/examples/jsm/nodes/shadernode/ShaderNode';
import { uv } from 'three/examples/jsm/nodes/accessors/UVNode';

class Galaxy implements Module {
  constructor() {}

  dispose(): void {}

  init(params: InitParam): Promise<void> {
    const { scene } = params;
    const material = new SpriteNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const size = uniform(0.8);
    material.scaleNode = range(0, 1).mul(size);

    const radiusRatio = range(0, 3);
    const radius = radiusRatio.pow(1.5).mul(5).toVar();

    const branches = 3;
    const branchAngle = range(0, branches).floor().mul(PI2.div(branches));
    const angle = branchAngle.add(
      timerLocal().mul(radiusRatio.oneMinus().mul(0.1)),
    );

    const position = vec3(cos(angle), 0, sin(angle)).mul(radius);

    const randomOffset = range(0, 1).pow(3).mul(radiusRatio).add(0.2);

    material.positionNode = position.add(randomOffset);

    const colorInside = uniform(color('#ffa575'));
    const colorOutside = uniform(color('#311599'));
    const colorFinal = mix(
      colorInside,
      colorOutside,
      radiusRatio.oneMinus().pow(2).oneMinus(),
    );
    const alpha = float(0.1).div(uv().sub(0.5).length()).sub(0.2);
    material.colorNode = vec4(colorFinal, alpha);

    const mesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      material,
      2000,
    );
    scene.add(mesh);
    mesh.position.x = 58;
    mesh.position.y = 107;
    mesh.position.z = -99;
    mesh.rotation.x = Math.PI / 2;
    mesh.geometry.computeBoundingBox();

    mesh.computeBoundingSphere();
    if (mesh.boundingSphere) {
      mesh.boundingSphere.radius = 300;
    }

    // DebugController.position(mesh);

    return Promise.resolve(undefined);
  }

  save(): Record<string, Record<any, any>> | null {
    return null;
  }
}

export default Galaxy;
