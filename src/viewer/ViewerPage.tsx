import * as React from 'react';
import { useContext, useEffect, useRef } from 'react';

import { DreamJourneyContext } from '../provider/DreamJourneyProvider.tsx';
import DreamJourney, { Cloud, Galaxy, Ground, Ocean, Sky, Moon } from '../../packages/dreamJourney';
import { getCloudData, getMoonData } from '../api';

function ViewerPage() {
  const containerCanvasRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { setInstance, dreamJourneyInstance } = useContext(DreamJourneyContext);

  useEffect(() => {
    (async () => {
      const cloudData = await getCloudData();
      const moonData = await getMoonData();

      const canvas = canvasRef.current;
      const container = containerCanvasRef.current;

      if (!canvas || !container) return;

      const dreamJourneyInstance = new DreamJourney(canvas, container);
      await dreamJourneyInstance.init();

      /**
       * 플러그인 패턴
       * 원하는 플러그인을 주입하여 dreamJourneyInstance 생성
       * 트리쉐이킹 및 각 모듈별로 디버깅이 유용합니다.
       */
      const modules = [
        new Cloud(cloudData),
        new Moon(moonData),
        new Ground(),
        new Sky(),
        new Ocean(),
        new Galaxy(),
      ];

      await dreamJourneyInstance.setModule(...modules);

      setInstance?.(dreamJourneyInstance);
    })();

    return () => {
      dreamJourneyInstance?.dispose();
    };
  }, [containerCanvasRef, canvasRef, location]);

  return (
    <div id="container" ref={containerCanvasRef}>
      <canvas id="canvas" ref={canvasRef} />
    </div>
  );
}

export default ViewerPage;
