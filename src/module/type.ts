import * as THREE from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface InitParam {
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  renderer: WebGPURenderer;
  camera: THREE.PerspectiveCamera;
  orbitControls: OrbitControls;
  container: HTMLDivElement;
}

export interface Module {
  init(params: InitParam): Promise<void>;

  dispose(): void;
}
