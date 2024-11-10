import DreamJourney from './core';
import Editor from './core/editor';

const container = document.getElementById('container') as HTMLDivElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const dreamJourney = new DreamJourney(canvas, container);
await dreamJourney.init();

const { renderer, camera, scene, orbitControls } = dreamJourney;
const editor = new Editor({ scene, renderer, camera, orbitControls });

editor.transformEdit.setTargetName = 'Cloud';
editor.setTransformMode('rotate');
// 키보드 이벤트 리스너 추가
window.addEventListener('keydown', (event) => {
  // 단일 키 인식 ('r', 's', 't')
  if (event.key === 'r') {
    editor.setTransformMode('rotate');
  } else if (event.key === 's') {
    console.log('S key pressed');
    // 필요한 로직 추가
    editor.setTransformMode('scale');
  } else if (event.key === 't') {
    console.log('T key pressed');
    // 필요한 로직 추가
    editor.setTransformMode('translate');
  }

  // Command+S (macOS) 또는 Ctrl+S (Windows)
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault(); // 브라우저의 기본 저장 동작 방지
    dreamJourney.save();
    editor.save();
    // 필요한 로직 추가
  }
});
