import { useContext, useEffect } from 'react';
import { EditorContext } from '../../provider/EditorProvider.tsx';

function useKeyboardControl() {
  const { editorInstance } = useContext(EditorContext);

  useEffect(() => {
    const editor = editorInstance;
    if (!editor) return;

    console.log(editor);

    const keyboardControlCb = (event: KeyboardEvent) => {
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
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault(); // 브라우저의 기본 저장 동작 방지
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
    };

    window.addEventListener('keydown', keyboardControlCb);

    return () => {
      window.removeEventListener('keydown', keyboardControlCb);
    };
  }, [editorInstance]);
}

export default useKeyboardControl;
