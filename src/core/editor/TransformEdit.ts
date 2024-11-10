import Editor, { InitParam } from './Editor.ts';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

class TransformEdit {
  private transformControls: TransformControls;

  private target = 'llllllllllll';
  private editor: Editor;

  constructor(editor: Editor, initParam: InitParam) {
    const { renderer, camera, orbitControls, scene } = initParam;

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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        transformControls.detach();
      }
    });
    // 마우스 클릭 이벤트 추가
    window.addEventListener('pointerdown', (event) => {
      if (transformControls.object) return;
      // 마우스 좌표를 -1에서 1 사이 값으로 변환
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 레이캐스터로 오브젝트 감지
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        // 교차된 첫 번째 오브젝트 선택

        let selectedObject = null;

        for (let i = 0; i < intersects.length; i++) {
          const target = intersects[i];
          if (
            target.object.type === 'Mesh' &&
            target.object.name === this.target
          ) {
            selectedObject = target.object;
          }
        }

        if (selectedObject) {
          transformControls.attach(selectedObject);
        } else {
          transformControls.detach();
        }
      }
    });

    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
  }

  public set setTargetName(target: string) {
    this.target = target;
  }

  public setMode(mode: 'translate' | 'rotate' | 'scale') {
    this.transformControls.setMode(mode);
  }

  public attachTarget(object: THREE.Object3D) {
    this.transformControls.attach(object);
  }
}

export default TransformEdit;
