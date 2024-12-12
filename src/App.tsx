import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import ViewPage from './view';
import EditorPage from './editor';
import { EditorLogicProvider, DreamJourneyLogicProvider } from './provider';

//Provider : packages에 있는 모듈의 인스턴스를 자식 컴포넌트에 공유하기 위한 용도.

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
