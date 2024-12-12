import DreamJourney, { Cloud, Galaxy, Ground, Ocean, Sky, Moon } from '../../packages/dreamJourney';
import Editor from '../../packages/editor';

import { EditorContext } from '../provider/EditorProvider.tsx';
import { useKeyboardControl } from './components';
import { getCloudData, getMoonData } from '../api';
import React, { useContext, useEffect, useRef } from 'react';

function EditorPage() {
  const containerCanvasRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { editorInstance, setModuleInstance } = useContext(EditorContext);

  useKeyboardControl();

  useEffect(() => {
    (async () => {
      const cloudData = await getCloudData();
      const moonData = await getMoonData();

      const canvas = canvasRef.current;
      const container = containerCanvasRef.current;

      if (!canvas || !container) return;

      const dreamJourney = new DreamJourney(canvas, container);
      await dreamJourney.init();

      const modules = [
        new Cloud(cloudData),
        new Moon(moonData),
        new Ground(),
        new Sky(),
        // new Ocean(),
        new Galaxy(),
      ];

      await dreamJourney.setModule(...modules);

      const { renderer, camera, scene, orbitControls } = dreamJourney;
      const editor = new Editor(dreamJourney, {
        scene,
        renderer,
        camera,
        orbitControls,
        canvas,
      });

      editor.transformEdit.targetName('Cloud');

      setModuleInstance?.(editor);
    })();

    return () => {
      editorInstance?.dispose();
    };
  }, [containerCanvasRef, canvasRef, location]);

  return (
    <>
      <div id="container" ref={containerCanvasRef}>
        <canvas id="canvas" ref={canvasRef} />
      </div>
    </>
  );
}

export default EditorPage;
