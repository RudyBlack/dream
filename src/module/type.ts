import * as THREE from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import DreamJourney from '../core';
import { ObjectData, ResObjectData } from '../@types/object';

export interface InitParam {
  root: DreamJourney;
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  renderer: WebGPURenderer;
  camera: THREE.PerspectiveCamera;
  orbitControls: OrbitControls;
  container: HTMLDivElement;
}

export interface Module {
  init(params: InitParam, data?: ResObjectData): Promise<void>;

  save(): Record<string, Record<any, any>> | null;

  dispose(): void;
}
