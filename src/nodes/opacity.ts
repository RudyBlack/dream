import { uv } from 'three/examples/jsm/nodes/accessors/UVNode';

export const borderOpacityNode = () => {
  return uv().distance(0.5).remap(0.1, 0.2).oneMinus();
};
