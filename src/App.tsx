import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import ViewPage from './view';
import EditorPage from './editor';
import { EditorLogicProvider, DreamJourneyLogicProvider } from './provider';

interface Props {}

function App(props: Props) {
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
