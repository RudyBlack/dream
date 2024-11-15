import DreamJourney from './core';
import Editor from './core/editor';

const container = document.getElementById('container') as HTMLDivElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const dreamJourney = new DreamJourney(canvas, container);
await dreamJourney.init();

const { renderer, camera, scene, orbitControls } = dreamJourney;
const editor = new Editor(dreamJourney, {
  scene,
  renderer,
  camera,
  orbitControls,
  canvas,
});

editor.transformEdit.targetName = 'Cloud';
editor.setTransformMode('rotate');
// 키보드 이벤트 리스너 추가
window.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace') {
    editor.deleteObject();
  }

  if (event.key === 'Escape') {
    editor.transformEdit.detach();
    editor.opacityEdit.flag = false;
  }

  if (event.key === 'r') {
    editor.setTransformMode('rotate');
  } else if (event.key === 's') {
    editor.setTransformMode('scale');
  } else if (event.key === 't') {
    editor.setTransformMode('translate');
  }
  if (event.key === 'o') {
    editor.opacityEdit.flag = true;
    // editor.opacityEdit.startAdjustFromMouse();
  }

  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault(); // 브라우저의 기본 저장 동작 방지
    dreamJourney.save();
    editor.save();
  }

  if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
    event.preventDefault(); // 브라우저의 기본 저장 동작 방지
    editor.lockObject();
  }

  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault(); // 브라우저의 기본 저장 동작 방지
    editor.unlockAllObject();
  }
});
