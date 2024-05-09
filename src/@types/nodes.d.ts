import {
  ComputeNode as ComputeNode_ORIGIN,
  ShaderNodeObject,
  Node as Node_ORIGIN,
} from 'three/examples/jsm/nodes/Nodes';

import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

declare module 'three/examples/jsm/nodes/Nodes' {
  export function tslFn<R extends Node = ShaderNodeObject<Node>>(jsFunc: () => void): () => R;

  export class ComputeNode extends ComputeNode_ORIGIN {
    onInit: ({ renderer }: { renderer: WebGPURenderer }) => void;
  }

  export class Node extends Node_ORIGIN {
    compute: (count: number, workgroupSize?: number[]) => ShaderNodeObject<ComputeNode>;
  }
}
