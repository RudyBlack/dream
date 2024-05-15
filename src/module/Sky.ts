import { InitParam, Module } from './type.ts';

class Sky implements Module {
  dispose(): void {}

  init(params: InitParam): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export default Sky;
