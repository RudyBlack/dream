import * as THREE from 'three';
import Editor, { InitParam } from '../Editor.ts';
import Cloud from '../../../module/Cloud.ts';
import pako from 'pako';
import { postObjectOpacity } from '../../../api';

class OpacityEdit {
  private initParam: InitParam;
  private editor: Editor;
  private _flag = false;

  public set flag(value: boolean) {
    this._flag = value;
  }

  constructor(editor: Editor, initParam: InitParam) {
    this.editor = editor;
    this.initParam = initParam;

    this.startAdjustFromMouse();
  }

  public startAdjustFromMouse() {
    const { dreamJourney, transformEdit } = this.editor;

    const { camera, canvas } = this.initParam;

    // 레이캐스터 및 마우스 벡터 생성
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 마우스 이동 이벤트 처리
    const onMouseMove = (event: MouseEvent) => {
      if (!this._flag) return;
      const attachTarget = transformEdit.getAttachTarget();

      if (!attachTarget) return;

      // 마우스 좌표를 정규화된 장치 좌표(NDC)로 변환
      mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

      // 레이캐스터 설정
      raycaster.setFromCamera(mouse, camera);

      // 장면 내의 구름 오브젝트들과의 교차점 확인
      const intersects = raycaster.intersectObject(attachTarget);

      if (intersects.length > 0) {
        const intersect = intersects[0];

        // 교차한 구름 오브젝트
        const cloud = intersect.object;

        // 교차점의 UV 좌표 획득
        const uv = intersect.uv;

        const cloudModule = dreamJourney.loadedModules.find(
          (m) => m.constructor.name === 'Cloud',
        ) as Cloud | undefined;

        if (!cloudModule || !uv) return;

        const { uuid } = cloud;
        const updatedData = cloudModule.updateDataTexture(
          uuid,
          { x: uv.x, y: uv.y },
          500,
          10,
        );

        if (updatedData) {
          this.compressAndSend(uuid, updatedData.source.data.data);
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('pointerdown', onMouseMove, false);
  }

  private compressAndSend(uuid: string, data: Uint8Array) {
    const compressed = pako.gzip(data);
    const blob = new Blob([compressed], { type: 'application/octet-stream' });

    postObjectOpacity(uuid, blob);
  }
}

export default OpacityEdit;
