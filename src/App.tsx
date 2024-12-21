import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const DreamJourneyLogicProvider = lazy(() => import('./provider/DreamJourneyProvider'));
const EditorLogicProvider = lazy(() => import('./provider/EditorProvider'));

const EditorPage = lazy(() => import('./editor'));
const ViewPage = lazy(() => import('./viewer'));

/**
 * page 마다 각기 원하는 모듈을 로드함으로써 트리쉐이킹을 구사할 수 있습니다.
 */

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <DreamJourneyLogicProvider>
              <ViewPage />
            </DreamJourneyLogicProvider>
          }
        />
        <Route
          path="/editor"
          element={
            <EditorLogicProvider>
              <EditorPage />
            </EditorLogicProvider>
          }
        />
      </Routes>
    </>
  );
}

export default App;
