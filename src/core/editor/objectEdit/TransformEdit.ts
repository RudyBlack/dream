import Editor, { InitParam } from '../Editor.ts';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

class TransformEdit {
  private transformControls: TransformControls;

  private _targetName: null | string = null;
  private ignoreTarget: string[] = [];
  private editor: Editor;

  constructor(editor: Editor, initParam: InitParam) {
    const { renderer, canvas, camera, orbitControls, scene } = initParam;

    this.editor = editor;

    // Raycaster와 마우스 벡터 초기화
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // TransformControls 설정
    const transformControls = (this.transformControls = new TransformControls(
      camera,
      renderer.domElement,
    ));
    scene.add(transformControls);

    // 마우스 클릭 이벤트 추가
    canvas.addEventListener('pointerdown', (event) => {
      if (transformControls.object) return;

      // 마우스 좌표를 -1에서 1 사이 값으로 변환
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        let selectedObject = null;

        for (let i = 0; i < intersects.length; i++) {
          const target = intersects[i];
          if (target.object.type === 'Line') continue;

          if (
            target.object.name === this._targetName &&
            target.object.type === 'Mesh' &&
            !this.ignoreTarget.includes(target.object.uuid)
          ) {
            selectedObject = target.object;
          }
        }

        if (selectedObject) {
          transformControls.attach(selectedObject);
          return;
        }
      }
    });

    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
  }

  public set addIgnoreTarget(uuid: string) {
    console.log(uuid);
    this.ignoreTarget.push(uuid);
  }

  public set targetName(value: string) {
    this._targetName = value;
  }

  public set removeIgnoreTarget(uuid: string) {
    this.ignoreTarget = this.ignoreTarget.filter((v) => v !== uuid);
  }

  public resetIgnoreTarget() {
    this.ignoreTarget = [];
  }

  public setMode(mode: 'translate' | 'rotate' | 'scale') {
    this.transformControls.setMode(mode);
  }

  public attachTarget(object: THREE.Object3D) {
    this.transformControls.attach(object);
  }

  public getAttachTarget() {
    return this.transformControls.object;
  }

  public detach() {
    this.transformControls.detach();
  }
}

export default TransformEdit;
