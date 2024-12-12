import DreamJourney from '../../packages/dreamJourney/core';
import Editor from '../../packages/editor';

import * as React from 'react';
import { useContext, useEffect, useRef } from 'react';
import { EditorContext } from '../provider/EditorProvider.tsx';
import { useKeyboardControl } from './components';
import { getCloudData, getMoonData } from '../api';
import { Cloud, Galaxy, Ground, Ocean, Sky } from '../../packages/dreamJourney';
import Moon from '../../packages/dreamJourney/module/Moon.ts';

interface Props {}

function EditorPage(props: Props) {
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

      dreamJourney.setModule(...modules);

      const { renderer, camera, scene, orbitControls } = dreamJourney;
      const editor = new Editor(dreamJourney, {
        scene,
        renderer,
        camera,
        orbitControls,
        canvas,
      });

      editor.transformEdit.targetName = 'Cloud';

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
