import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Editor {
  private target = 'llllllllllll';
  private transformControls: TransformControls;

  public set setTargetName(target: string) {
    this.target = target;
  }

  constructor(initParam: {
    camera: THREE.Camera;
    renderer: WebGPURenderer;
    scene: THREE.Scene;
    orbitControls: OrbitControls;
  }) {
    const { renderer, camera, scene, orbitControls } = initParam;

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
    window.addEventListener('click', (event) => {
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

  public setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    this.transformControls.setMode(mode);
  }
}

export default Editor;
